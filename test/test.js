
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
    assert(range.startContainer === div.firstChild.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 5);
    assert(range.endContainer === div.firstChild.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 5);
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
    assert(!range.collapsed, 'range should not be collapsed');
    assert(range.startContainer === div, '`startContainer` doesn\'t match');
    assert(range.startOffset === 1, '`startOffset` doesn\'t match')
    assert(range.endContainer === div, '`endContainer` doesn\'t match');
    assert(range.endOffset === 2, '`endOffset` doesn\'t match');
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

  it('should normalize a Range pointing to the beginning of parent P with B and I children', function () {
    div = document.createElement('div');
    div.innerHTML = '<p><b><i>hello</i></b></p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild, 0);
    range.setEnd(div.firstChild, 0);
    assert(range.collapsed);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.firstChild.firstChild.firstChild.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 0, '`startOffset` doesn\'t match')
    assert(range.endContainer === div.firstChild.firstChild.firstChild.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 0, '`endOffset` doesn\'t match');
    assert(range.collapsed);
  });

  it('should normalize a Range pointing to the end of parent P with B and I children', function () {
    div = document.createElement('div');
    div.innerHTML = '<p><b><i>hello</i></b></p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild, 1);
    range.setEnd(div.firstChild, 1);
    assert(range.collapsed);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.firstChild.firstChild.firstChild.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 5, '`startOffset` doesn\'t match')
    assert(range.endContainer === div.firstChild.firstChild.firstChild.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 5, '`endOffset` doesn\'t match');
    assert(range.collapsed);
  });

  it('should normalize a Range pointing to the end text node with B and I parents', function () {
    div = document.createElement('div');
    div.innerHTML = '<p><b><i>hello</i></b></p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild.firstChild.firstChild, 5);
    range.setEnd(div.firstChild.firstChild.firstChild.firstChild, 5);
    assert(range.collapsed);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.firstChild.firstChild.firstChild.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 5, '`startOffset` doesn\'t match')
    assert(range.endContainer === div.firstChild.firstChild.firstChild.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 5, '`endOffset` doesn\'t match');
    assert(range.collapsed);
  });

  it('should normalize a Range selecting parent P with B and I children', function () {
    div = document.createElement('div');
    div.innerHTML = '<p><b><i>hello</i></b></p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div, 0);
    range.setEnd(div, 1);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.firstChild.firstChild.firstChild.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 0, '`startOffset` doesn\'t match')
    assert(range.endContainer === div.firstChild.firstChild.firstChild.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 5, '`endOffset` doesn\'t match');
  });

  it('should normalize a Range selecting text at the end of a P', function () {
    div = document.createElement('div');
    div.innerHTML = '<div><p>a</p></div><p>merriweather 300 normal</p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild.firstChild, 1);
    range.setEnd(div.firstChild.firstChild.firstChild, 1);
    assert(range.collapsed);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.firstChild.firstChild.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 1, '`startOffset` doesn\'t match')
    assert(range.endContainer === div.firstChild.firstChild.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 1, '`endOffset` doesn\'t match');
    assert(range.collapsed);
  });

  it('should normalize a Range selecting node above text at the end of a P', function () {
    div = document.createElement('div');
    div.innerHTML = '<div><p>a</p></div><p>merriweather 300 normal</p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild, 1);
    range.setEnd(div.firstChild.firstChild, 1);
    assert(range.collapsed);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.firstChild.firstChild.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 1, '`startOffset` doesn\'t match')
    assert(range.endContainer === div.firstChild.firstChild.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 1, '`endOffset` doesn\'t match');
    assert(range.collapsed);
  });

  it('should normalize a Range selecting node 2 levels above text at the end of a P', function () {
    div = document.createElement('div');
    div.innerHTML = '<div><p>a</p></div><p>merriweather 300 normal</p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild, 1);
    range.setEnd(div.firstChild, 1);
    assert(range.collapsed);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.firstChild.firstChild.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 1, '`startOffset` doesn\'t match')
    assert(range.endContainer === div.firstChild.firstChild.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 1, '`endOffset` doesn\'t match');
    assert(range.collapsed);
  });

  it('should Normalize a non-collapsed Range with start pointing to a TextNode and end pointing to ending Element boundary', function () {
    div = document.createElement('div');
    div.innerHTML = '<p>foo</p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild, 3);
    range.setEnd(div.firstChild, 1);
    assert(!range.collapsed);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.firstChild.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 3, '`startOffset` doesn\'t match')
    assert(range.endContainer === div.firstChild.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 3, '`endOffset` doesn\'t match');
    assert(range.collapsed);
  });

  it('should leave as-is a collapsed Range already pointing to a TextNode', function () {
    div = document.createElement('div');
    div.innerHTML = '<p>foo</p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild, 3);
    range.setEnd(div.firstChild.firstChild, 3);
    assert(range.collapsed);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.firstChild.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 3, '`startOffset` doesn\'t match')
    assert(range.endContainer === div.firstChild.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 3, '`endOffset` doesn\'t match');
    assert(range.collapsed);
  });

  it('should normalize a Range already pointing to a text node and a DIV', function () {
    div = document.createElement('div');
    div.innerHTML = '<p>foo</p><p>bar</p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild, 2);
    range.setEnd(div, 1);
    assert.equal('o', range.toString());

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.firstChild.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 2, '`startOffset` doesn\'t match')
    assert(range.endContainer === div.firstChild.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 3, '`endOffset` doesn\'t match');
    assert.equal('o', range.toString());
  });

  it('should normalize a Range already pointing to a text node and a DIV', function () {
    div = document.createElement('div');
    div.innerHTML = '<p>foo</p><p><img src="#"></p><p><br></p><p>bar</p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild, 2);
    range.setEnd(div, 1);
    assert.equal('o', range.toString());

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.firstChild.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 2, '`startOffset` doesn\'t match')
    assert(range.endContainer === div.firstChild.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 3, '`endOffset` doesn\'t match');
    assert.equal('o', range.toString());
  });

  it('should normalize a Range wrapping a BR node', function () {
    div = document.createElement('div');
    div.innerHTML = '<p><br></p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div, 0);
    range.setEnd(div, 1);
    assert.equal('', range.toString());
    assert(!range.collapsed);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 0, '`startOffset` doesn\'t match')
    assert(range.endContainer === div.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 1, '`endOffset` doesn\'t match');
    assert.equal('', range.toString());
    assert(!range.collapsed);
  });

  it('should normalize a Range wrapping multiple BR nodes', function () {
    div = document.createElement('div');
    div.innerHTML = '<p><br><br><br><br><br></p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div, 0);
    range.setEnd(div.firstChild, 3);
    assert.equal('', range.toString());
    assert(!range.collapsed);

    // normalize Range
    normalize(range);

    // test that the Range is normalized
    assert(range.startContainer === div.firstChild, '`startContainer` doesn\'t match');
    assert(range.startOffset === 0, '`startOffset` doesn\'t match')
    assert(range.endContainer === div.firstChild, '`endContainer` doesn\'t match');
    assert(range.endOffset === 3, '`endOffset` doesn\'t match');
    assert.equal('', range.toString());
    assert(!range.collapsed);
  });

});
