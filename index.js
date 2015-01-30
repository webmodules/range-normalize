
/**
 * Module dependencies.
 */

var indexOf = require('index-of');
var debug = require('debug')('range-normalize');

// map to an Object for faster lookup times
var voidElements = require('void-elements').reduce(function (obj, name) {
  obj[name.toUpperCase()] = true;
  return obj;
}, {});

/**
 * Module exports.
 */

module.exports = normalize;

/**
 * "Normalizes" the DOM Range instance, such that slight variations in the start
 * and end containers end up being normalized to the same "base" representation.
 * The aim is to always have `startContainer` and `endContainer` pointing to
 * TextNode instances.
 *
 * Pseudo-logic is as follows:
 *
 * For the "start":
 *
 *  - Is start container already a text node?
 *    - Is start offset at the end of the text node?
 *      - Traverse "up" the start container until a `nextSibling` is found
 *      - Set new offset = 0
 *      - Go back to start, repeat
 *    - Else
 *      - Done! start container and offset are normalized
 *  - Else
 *    - Traverse "down" the start container until either a text node or void element is found
 *    - Set new start offset = 0
 *    - Is new start container a text node?
 *      - Go back to start, repeat
 *    - Else, is new start container a void element?
 *      - Set start container's `parentNode` as new start container
 *      - Set new start offset = indexOf(new start container's `childNodes`, old start container "void element")
 *    - Else (assume start container is any other HTML element which may or may not contain children)
 *      - ???
 *
 * For the "end":
 *
 *  - Is end container already a text node?
 *    - Is end offset at the beginning of the text node?
 *      - Traverse "up" the end container until a `previousSibling` is found
 *
 * @param {Range} range - DOM Range instance to "normalize"
 * @return {Range} returns `range`, after being "normalized"
 */

function normalize (range) {
  var start = {
    end: false,
    node: range.startContainer,
    offset: range.startOffset
  };
  var end = {
    end: true,
    node: range.endContainer,
    offset: range.endOffset
  };
  var collapsed = range.collapsed;


  function normalizeStart () {
    debug('normalizeStart()');
    var type = start.node.nodeType;
    if (type === 3 /* text */) {
      normalizeTextNode(start, start.node.nodeValue.length, 'nextSibling', normalizeStart);
    } else if (type === 1 /* element */) {
      normalizeElement(start, normalizeStart);
    }
  }

  function normalizeEnd () {
    debug('normalizeEnd()');
    if (collapsed) {
      end.node = start.node;
      end.offset = start.offset;
      debug('range is "collapsed", set end.node=%o, end.offset=%o', name(end.node), end.offset);
    } else {
      var type = end.node.nodeType;
      if (type === 3 /* text */) {
        normalizeTextNode(end, 0, 'previousSibling', normalizeEnd);
      } else if (type === 1 /* element */) {
        normalizeElement(end, normalizeEnd);
      }
    }
  }

  function normalizeTextNode (info, badOffset, sibling, startOver) {
    debug('normalizeTextNode() node=%o offset=%o end=%o, badOffset=%o', name(info.node), info.offset, info.end, badOffset);
    if (info.offset === badOffset) {
      debug('offset %o is "bad", need to move to %o', info.offset, sibling);

      var node = info.node;
      while (node && !node[sibling]) {
        node = node.parentNode;
      }

      if (node) {
        info.node = node[sibling];
        if (info.end) {
          info.offset = info.node.nodeType === 3 ? info.node.nodeValue.length : info.node.childNodes.length;
        } else {
          info.offset = 0;
        }

        debug('new node=%o offset=%o', name(info.node), info.offset);

        startOver();
      }
    } else {
      // text node and offset are in a normalized state, do nothing...
      debug('DONE! node=%o offset=%o', name(info.node), info.offset);
    }
  }

  function normalizeElement (info, startOver) {
    debug('normalizeElement() node=%o offset=%o', name(info.node), info.offset);
    if (voidElements[info.node.nodeName]) {
      normalizeVoidElement(info, info.end ? 1 : 0);
    } else {
      debug('need to find deepest child node of %o at offset=%o', name(info.node), info.offset);

      var nodes = info.node.childNodes;
      if (info.offset >= nodes.length) {
        info.node = nodes[nodes.length - 1];
        info.offset = info.node.nodeType === 1 ? info.node.childNodes.length : info.node.nodeValue.length;
      } else {
        info.node = info.node.childNodes[info.offset];
        info.offset = 0;
      }

      debug('new node=%o offset=%o', name(info.node), info.offset);

      startOver();
    }
  }

  function normalizeVoidElement (info, delta) {
    debug('%o is a "void element", need to use parent node', name(info.node));
    var node = info.node;
    var parent = node.parentNode;
    if (parent) {
      info.node = parent;
      info.offset = indexOf(parent.childNodes, node) + delta;
      debug('DONE! node=%o offset=%o', name(info.node), info.offset);
    }
  }


  normalizeStart();

  debug('');
  debug('');

  normalizeEnd();

  debug('');
  debug('');

  if (start.node !== range.startContainer || start.offset !== range.startOffset) {
    debug('normalizing Range `start` to node=%o offset=%o:', name(start.node), start.offset);
    range.setStart(start.node, start.offset);
  }

  if (end.node !== range.endContainer || end.offset !== range.endOffset) {
    debug('normalizing Range `end` to node=%o offset=%o:', name(end.node), end.offset);
    range.setEnd(end.node, end.offset);
  }

  return range;
}

function name (node) {
  return node.nodeType === 3 ?
    node.nodeValue :
    '<' + node.nodeName + '>';
}
