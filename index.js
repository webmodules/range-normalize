
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
  var tmp;


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


  tmp = sc;
  if (sc.nodeType === 1) {
    debug('start is an Element, need to find deepest `firstChild` TextNode');

    while (sc && sc.nodeType !== 3) {
      sc = sc.firstChild;
    }

    if (sc) {
      so = 0;
    } else {
      debug('could not find TextNode within %o, resetting `sc`', range.startContainer);
      sc = tmp;
    }
  }



  if (ec.nodeType === 3 && eo === 0) {
    debug('end is at start of TextNode, need to move to `previousSibling`');

    while (ec && !ec.previousSibling) {
      ec = ec.parentNode;
    }

    if (ec) {
      ec = ec.previousSibling;
      eo = ec.childNodes.length;
    } else {
      debug('could not find TextNode within %o, resetting `sc`', range.endContainer);
      ec = range.endContainer;
    }
  }


  tmp = ec;
  if (ec.nodeType === 1) {
    debug('end is an Element, need to find deepest `lastChild` TextNode');

    while (ec && ec.nodeType !== 3) {
      ec = ec.lastChild;
    }

    if (ec) {
      eo = ec.nodeValue.length;
    } else {
      debug('could not find TextNode within %o, resetting `ec`', range.endContainer);
      ec = tmp;
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
