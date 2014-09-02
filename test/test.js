
var assert = require('assert');
var normalize = require('../');

describe('range-normalize', function () {

  it('should normalize a Range wrapping the outside of B node', function () {
    var div = document.createElement('div');
    div.innerHTML = '<i>asdf </i><b>asdf</b> asdf';

    var range = document.createRange();
    range.setStart(div.childNodes[0].firstChild, 5);
    range.setEnd(div.childNodes[2], 0);

    // normalize Range
    normalize(range);

    // test that the Range is normalized to the inner TextNode of the <b>
    assert(range.startContainer === div.childNodes[1].firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 0);
    assert(range.endContainer === div.childNodes[1].firstChild);
    assert(range.endOffset === 4);
  });

  it('should normalize a Range wrapping a B node', function () {
    var div = document.createElement('div');
    div.innerHTML = '<i>asdf </i><b>asdf</b> asdf';

    var range = document.createRange();
    range.setStart(div.childNodes[1], 0);
    range.setEnd(div.childNodes[1], 1);

    // normalize Range
    normalize(range);

    // test that the Range is normalized to the inner TextNode of the <b>
    assert(range.startContainer === div.childNodes[1].firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 0);
    assert(range.endContainer === div.childNodes[1].firstChild);
    assert(range.endOffset === 4);
  });

  it('should leave as-is a Range wrapping text inside a B node', function () {
    var div = document.createElement('div');
    div.innerHTML = '<i>asdf </i><b>asdf</b> asdf';

    var range = document.createRange();
    range.setStart(div.childNodes[1].firstChild, 0);
    range.setEnd(div.childNodes[1].firstChild, 4);

    // normalize Range
    normalize(range);

    // test that the Range is normalized to the inner TextNode of the <b>
    assert(range.startContainer === div.childNodes[1].firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 0);
    assert(range.endContainer === div.childNodes[1].firstChild);
    assert(range.endOffset === 4);
  });

  it('should normalize a Range in between DIV child nodes', function () {
    var div = document.createElement('div');
    div.innerHTML = '<i>hello</i><b>world</b>';

    var range = document.createRange();
    range.setStart(div, 1);
    range.setEnd(div, 1);
    assert(range.collapsed);

    // normalize Range
    normalize(range);

    // test that the Range is normalized to the inner TextNode of the <b>
    assert(range.startContainer === div.lastChild.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 0);
    assert(range.endContainer === div.lastChild.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 0);
    assert(range.collapsed);
  });

  it('should not move Range points into childless nodes', function () {
    var div = document.createElement('div');
    div.innerHTML = '<i>blah</i><br><b>hello</b>';

    var range = document.createRange();
    range.setStart(div.childNodes[0].firstChild, 4);
    range.setEnd(div.childNodes[2].firstChild, 0);

    // normalize Range
    normalize(range);

    // test that the Range remains the same
    assert(range.startContainer === div.childNodes[0].firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 4, '`startOffset` doesn\'t match')
    assert(range.endContainer === div.childNodes[2].firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 0, '`endOffset` doesn\'t match');
  });

});
