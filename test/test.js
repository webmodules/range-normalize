
var assert = require('assert');
var normalize = require('../');

describe('range-normalize', function () {
  var div;

  afterEach(function () {
    if (div) {
      // clean up...
      document.body.removeChild(div);
      div = null;
    }
  });

  it('should normalize a Range wrapping the outside of B node', function () {
    div = document.createElement('div');
    div.innerHTML = '<i>asdf </i><b>asdf</b> asdf';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.childNodes[0].firstChild, 5);
    range.setEnd(div.childNodes[2], 0);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.childNodes[1].firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 0);
    assert(range.endContainer === div.childNodes[1].firstChild);
    assert(range.endOffset === 4);
  });

  it('should normalize a Range wrapping a B node', function () {
    div = document.createElement('div');
    div.innerHTML = '<i>asdf </i><b>asdf</b> asdf';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.childNodes[1], 0);
    range.setEnd(div.childNodes[1], 1);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.childNodes[1].firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 0);
    assert(range.endContainer === div.childNodes[1].firstChild);
    assert(range.endOffset === 4);
  });

  it('should leave as-is a Range wrapping text inside a B node', function () {
    div = document.createElement('div');
    div.innerHTML = '<i>asdf </i><b>asdf</b> asdf';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.childNodes[1].firstChild, 0);
    range.setEnd(div.childNodes[1].firstChild, 4);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.childNodes[1].firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 0);
    assert(range.endContainer === div.childNodes[1].firstChild);
    assert(range.endOffset === 4);
  });

  it('should normalize a Range in between DIV child nodes (start)', function () {
    div = document.createElement('div');
    div.innerHTML = '<i>hello</i><b>world</b>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div, 0);
    range.setEnd(div, 0);
    assert(range.collapsed);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.firstChild.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 0);
    assert(range.endContainer === div.firstChild.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 0);
    assert(range.collapsed);
  });

  it('should normalize a Range in between DIV child nodes (middle)', function () {
    div = document.createElement('div');
    div.innerHTML = '<i>hello</i><b>world</b>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div, 1);
    range.setEnd(div, 1);
    assert(range.collapsed);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.lastChild.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 0);
    assert(range.endContainer === div.lastChild.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 0);
    assert(range.collapsed);
  });

  it('should normalize a Range in between DIV child nodes (end)', function () {
    div = document.createElement('div');
    div.innerHTML = '<i>hello</i><b>world</b>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div, 2);
    range.setEnd(div, 2);
    assert(range.collapsed);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.lastChild.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 5);
    assert(range.endContainer === div.lastChild.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 5);
    assert(range.collapsed);
  });

  it('should normalize a Range with multiple TextNodes', function () {
    div = document.createElement('div');
    div.appendChild(document.createTextNode('a'));
    div.appendChild(document.createTextNode('b'));
    div.appendChild(document.createTextNode('c'));
    div.appendChild(document.createTextNode('d'));
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.childNodes[0], 1);
    range.setEnd(div.childNodes[3], 0);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.childNodes[1], '`startContainer` doesn\'t match');
    assert(range.startOffset === 0);
    assert(range.endContainer === div.childNodes[2], '`endContainer` doesn\'t match');
    assert(range.endOffset === 1);
  });

  it('should normalize a Range with multiple TextNodes 2', function () {
    div = document.createElement('div');
    div.appendChild(document.createTextNode('a'));
    div.appendChild(document.createTextNode('b'));
    div.appendChild(document.createTextNode('c'));
    div.appendChild(document.createTextNode('d'));
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.childNodes[1], 0);
    range.setEnd(div.childNodes[1], 1);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.childNodes[1], '`startContainer` doesn\'t match');
    assert(range.startOffset === 0);
    assert(range.endContainer === div.childNodes[1], '`endContainer` doesn\'t match');
    assert(range.endOffset === 1);
  });

  it('should not move Range points into childless nodes', function () {
    div = document.createElement('div');
    div.innerHTML = '<i>blah</i><br><b>hello</b>';
    document.body.appendChild(div);

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

  it('should normalize a Range pointing to parent nodes surrounding an A', function () {
    div = document.createElement('div');
    div.innerHTML = '<p>asdf <b>asdf asd</b>f asdf afd<a href="#">asdfsdfsdfsafsdfsdfsfd</a>asfdsfdmsdfdfs asdf </p>'
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild, 3);
    range.setEnd(div.firstChild, 4);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.firstChild.childNodes[3].firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 0, '`startOffset` doesn\'t match')
    assert(range.endContainer === div.firstChild.childNodes[3].firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 22, '`endOffset` doesn\'t match');
  });

});
