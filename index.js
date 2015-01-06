
/**
 * Module dependencies.
 */

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
 * @param {Range} range - DOM Range instance to "normalize"
 * @return {Range} returns `range`, after being "normalized"
 */

function normalize (range) {
  var sc = range.startContainer;
  var so = range.startOffset;
  var ec = range.endContainer;
  var eo = range.endOffset;
  var collapsed = range.collapsed;
  var end;

  if (sc.nodeType === 3 && so === sc.nodeValue.length) {
    debug('start is at end of TextNode, need to move to `nextSibling`');

    while (sc && !sc.nextSibling) {
      sc = sc.parentNode;
    }

    if (sc) {
      sc = sc.nextSibling;
      so = 0;
    } else {
      debug('could not find TextNode within %o, resetting `sc`', range.startContainer);
      sc = range.startContainer;
    }
  }


  if (sc.nodeType === 1) {
    if (voidElements[sc.nodeName]) {
      debug('start is a "void element", need to use parent node', sc);
      var v = sc;
      sc = v.parentNode;
      so = toArray(sc.childNodes).indexOf(v);
    } else {
      debug('start is an Element, need to find deepest child node at offset %o', so);

      if (so >= sc.childNodes.length) {
        end = true;
        sc = sc.childNodes[sc.childNodes.length - 1];
      } else {
        end = false;
        sc = sc.childNodes[so];
      }

      var c;
      while (sc) {
        if (sc.nodeType === 3) break;
        if (end) {
          c = sc.lastChild;
        } else {
          c = sc.firstChild;
        }
        if (c && voidElements[c.nodeName]) break;
        sc = c;
      }

      if (sc) {
        if (sc.nodeType === 1) {
          // a "void element"'s parent
          so = end ? sc.childNodes.length : 0;
        } else {
          // text node
          so = end ? sc.nodeValue.length : 0;
        }
      } else {
        debug('could not find TextNode within %o, resetting `sc`', range.startContainer);
        sc = range.startContainer;
        so = range.startOffset;
      }
    }
  }


  while (true) {

    if (collapsed && ec === sc && eo === so) {
      debug('collapsed Range with both boundaries touching, done with `ec`/`eo`');
      break;
    }

    if (ec.nodeType === 3 && eo === 0) {
      debug('end is at start of TextNode, need to move to `previousSibling`');

      while (ec && !ec.previousSibling) {
        ec = ec.parentNode;
      }

      if (ec) {
        ec = ec.previousSibling;
        eo = ec.nodeType === 3 ? ec.nodeValue.length : ec.childNodes.length;
      } else {
        debug('could not find TextNode within %o, resetting `ec`', range.endContainer);
        if (collapsed) {
          ec = sc;
          eo = so;
        } else {
          ec = range.endContainer;
          eo = range.endOffset;
        }
        break;
      }
    }


    if (ec.nodeType === 1) {
      if (voidElements[ec.nodeName]) {
        debug('end is a "void element", need to use parent node', ec);
        var v = ec;
        ec = v.parentNode;
        eo = toArray(ec.childNodes).indexOf(v) + 1;
        break;
      } else {
        debug('end is an Element, need to find deepest node at offset %o', eo);
        end = true;

        if (eo >= ec.childNodes.length) {
          ec = ec.childNodes[ec.childNodes.length - 1];
        } else {
          ec = ec.childNodes[eo - 1];
        }

        var c;
        while (ec) {
          if (ec.nodeType === 3) break;
          c = ec.lastChild;
          if (c && voidElements[c.nodeName]) break;
          ec = c;
        }

        if (ec) {
          if (ec.nodeType === 1) {
            // a "void element"'s parent
            eo = ec.childNodes.length;
          } else {
            // text node
            eo = ec.nodeValue.length;
          }
          break;
        } else {
          debug('could not find TextNode within %o, resetting `ec`', range.endContainer);
          if (collapsed) {
            ec = sc;
            eo = so;
          } else {
            ec = range.endContainer;
            eo = range.endOffset;
          }
          break;
        }
      }
    } else {
      break;
    }
  }


  if (sc !== range.startContainer || so !== range.startOffset) {
    debug('normalizing Range `start` to %o %o:', sc, so);
    range.setStart(sc, so);
  }
  if (ec !== range.endContainer || eo !== range.endOffset) {
    debug('normalizing Range `end` to %o %o:', ec, eo);
    range.setEnd(ec, eo);
  }

  return range;
}

/**
 * Inlined to-array function
 */

function toArray (a) {
  var r = [];
  for (var i = 0, l = a.length; i < l; i++) {
    r.push(a[i]);
  }
  return r;
}
