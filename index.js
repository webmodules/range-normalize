
/**
 * Module dependencies.
 */

var debug = require('debug')('range-normalize');

/**
 * Module exports.
 */

module.exports = normalize;

/**
 * "Normalizes" the DOM Range instance, such that slight variations in the start
 * and end containers end up being normalized to the same "base" representation.
 * The aim is to always have `startContainer` and `endContainer` pointing to
 * a TextNode instance.
 *
 * @param {Range} range - DOM Range instance to "normalize"
 * @return {Range} returns `range`, after being "normalized"
 */

function normalize (range) {
  var sc = range.startContainer;
  var so = range.startOffset;
  var ec = range.endContainer;
  var eo = range.endOffset;


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
    debug('start is an Element, need to find deepest `firstChild` TextNode');

    while (sc && sc.nodeType !== 3) {
      sc = sc.firstChild;
    }

    if (sc) {
      so = 0;
    } else {
      debug('could not find TextNode within %o, resetting `sc`', range.startContainer);
      sc = range.startContainer;
    }
  }



  if (ec.nodeType === 3 && eo === 0) {
    debug('end is at start of TextNode, need to move to `previousSibling`');

    while (ec && !ec.previousSibling) {
      ec = ec.parentNode;
    }

    ec = ec.previousSibling;
  }


  if (ec.nodeType === 1) {
    debug('end is an Element, need to find deepest `lastChild` TextNode');

    while (ec && ec.nodeType !== 3) {
      ec = ec.lastChild;
    }

    if (ec) {
      eo = ec.nodeValue.length;
    } else {
      debug('could not find TextNode within %o, resetting `ec`', range.endContainer);
      ec = range.endContainer;
    }
  }



  debug('normalizing to %o %o, %o %o:', sc, so, ec, eo);
  range.setStart(sc, so);
  range.setEnd(ec, eo);

  return range;
}
