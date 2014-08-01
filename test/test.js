
var assert = require('assert');
var normalize = require('../');

describe('range-normalize', function () {

  it('should normalize a Range wrapping the outside of <b> node', function () {
    var div = document.createElement('div');
    div.innerHTML = '<i>asdf </i><b>asdf</b> asdf';

    var range = document.createRange();
    range.setStart(div.childNodes[0].firstChild, 5);
    range.setEnd(div.childNodes[2], 0);

    // normalize Range
    normalize(range);

    // test that the Range is normalized to the inner TextNode of the <b>
    console.log(range);
    assert(range.startContainer === div.childNodes[1].firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 0);
    assert(range.endContainer === div.childNodes[1].firstChild);
    assert(range.endOffset === 4);
  });

  it('should normalize a Range wrapping a <b> node', function () {
    var div = document.createElement('div');
    div.innerHTML = '<i>asdf </i><b>asdf</b> asdf';

    var range = document.createRange();
    range.setStart(div.childNodes[1], 0);
    range.setEnd(div.childNodes[1], 1);

    // normalize Range
    normalize(range);

    // test that the Range is normalized to the inner TextNode of the <b>
    console.log(range);
    assert(range.startContainer === div.childNodes[1].firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 0);
    assert(range.endContainer === div.childNodes[1].firstChild);
    assert(range.endOffset === 4);
  });

  it('should leave as-is a Range wrapping text inside a <b> node', function () {
    var div = document.createElement('div');
    div.innerHTML = '<i>asdf </i><b>asdf</b> asdf';

    var range = document.createRange();
    range.setStart(div.childNodes[1].firstChild, 0);
    range.setEnd(div.childNodes[1].firstChild, 4);

    // normalize Range
    normalize(range);

    // test that the Range is normalized to the inner TextNode of the <b>
    console.log(range);
    assert(range.startContainer === div.childNodes[1].firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 0);
    assert(range.endContainer === div.childNodes[1].firstChild);
    assert(range.endOffset === 4);
  });

});
