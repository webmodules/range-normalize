
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
    node: range.startContainer,
    offset: range.startOffset
  };
  var end = {
    node: range.endContainer,
    offset: range.endOffset
  };
  var atEnd = false;
  var collapsed = range.collapsed;

  if (start.node.nodeType === 3 && start.offset === start.node.nodeValue.length) {
    debug('start is at end of TextNode, need to move to `nextSibling`');

    while (start.node && !start.node.nextSibling) {
      start.node = start.node.parentNode;
    }

    if (start.node) {
      start.node = start.node.nextSibling;
      start.offset = 0;
    } else {
      debug('could not find TextNode within %o, resetting `start.node`', range.startContainer);
      start.node = range.startContainer;
    }
  }


  if (start.node.nodeType === 1) {
    if (voidElements[start.node.nodeName]) {
      debug('start is a "void element", need to use parent node', start.node);
      var v = start.node;
      start.node = v.parentNode;
      start.offset = indexOf(start.node.childNodes, v);
    } else {
      debug('start is an Element, need to find deepest child node at offset %o', start.offset);

      if (start.offset >= start.node.childNodes.length) {
        atEnd = true;
        start.node = start.node.childNodes[start.node.childNodes.length - 1];
      } else {
        atEnd = false;
        start.node = start.node.childNodes[start.offset];
      }

      var c;
      while (start.node) {
        if (start.node.nodeType === 3) break;
        if (atEnd) {
          c = start.node.lastChild;
        } else {
          c = start.node.firstChild;
        }
        if (c && voidElements[c.nodeName]) break;
        start.node = c;
      }

      if (start.node) {
        if (start.node.nodeType === 1) {
          // a "void element"'s parent
          start.offset = atEnd ? start.node.childNodes.length : 0;
        } else {
          // text node
          start.offset = atEnd ? start.node.nodeValue.length : 0;
        }
      } else {
        debug('could not find TextNode within %o, resetting `start.node`', range.startContainer);
        start.node = range.startContainer;
        start.offset = range.startOffset;
      }
    }
  }


  while (true) {

    if (collapsed && end.node === start.node && end.offset === start.offset) {
      debug('collapsed Range with both boundaries touching, done with `end.node`/`end.offset`');
      break;
    }

    if (end.node.nodeType === 3 && end.offset === 0) {
      debug('end is at start of TextNode, need to move to `previousSibling`');

      while (end.node && !end.node.previousSibling) {
        end.node = end.node.parentNode;
      }

      if (end.node) {
        end.node = end.node.previousSibling;
        end.offset = end.node.nodeType === 3 ? end.node.nodeValue.length : end.node.childNodes.length;
      } else {
        debug('could not find TextNode within %o, resetting `end.node`', range.endContainer);
        if (collapsed) {
          end.node = start.node;
          end.offset = start.offset;
        } else {
          end.node = range.endContainer;
          end.offset = range.endOffset;
        }
        break;
      }
    }


    if (end.node.nodeType === 1) {
      if (voidElements[end.node.nodeName]) {
        debug('end is a "void element", need to use parent node', end.node);
        var v = end.node;
        end.node = v.parentNode;
        end.offset = indexOf(end.node.childNodes, v) + 1;
        break;
      } else {
        debug('end is an Element, need to find deepest node at offset %o', end.offset);
        atEnd = true;

        if (end.offset >= end.node.childNodes.length) {
          end.node = end.node.childNodes[end.node.childNodes.length - 1];
        } else {
          end.node = end.node.childNodes[end.offset - 1];
        }

        var c;
        while (end.node) {
          if (end.node.nodeType === 3) break;
          c = end.node.lastChild;
          if (c && voidElements[c.nodeName]) break;
          end.node = c;
        }

        if (end.node) {
          if (end.node.nodeType === 1) {
            // a "void element"'s parent
            end.offset = end.node.childNodes.length;
          } else {
            // text node
            end.offset = end.node.nodeValue.length;
          }
          break;
        } else {
          debug('could not find TextNode within %o, resetting `end.node`', range.endContainer);
          if (collapsed) {
            end.node = start.node;
            end.offset = start.offset;
          } else {
            end.node = range.endContainer;
            end.offset = range.endOffset;
          }
          break;
        }
      }
    } else {
      break;
    }
  }


  if (start.node !== range.startContainer || start.offset !== range.startOffset) {
    debug('normalizing Range `start` to %o %o:', start.node, start.offset);
    range.setStart(start.node, start.offset);
  }

  if (end.node !== range.endContainer || end.offset !== range.endOffset) {
    debug('normalizing Range `end` to %o %o:', end.node, end.offset);
    range.setEnd(end.node, end.offset);
  }

  return range;
}
