var test = require('ava');
var Lexer = require('../lib/lexer');

var lexer;

test.beforeEach(function () {
    lexer = new Lexer();
});

test('Lexer recognizes numbers', function (t) {
    lexer.input("1");
    t.is(lexer.next().type, 'number');
});

test('Lexer recognizes operators', function (t) {
    lexer.input("+");
    t.is(lexer.next().type, 'operator');
});

test('Lexer recognizes names', function (t) {
    lexer.input("someVariableName");
    t.is(lexer.next().type, 'name');
});

test('Lexer recognizes single line comments', function (t) {
    lexer.input("//some comment");
    t.is(lexer.next().type, 'comment');
});

test('Lexer recognizes multi line comments', function (t) {
    var commentText = "/* some \n comment */";
    lexer.input(commentText);
    var comment = lexer.next();
    t.is(comment.type, 'comment');
    t.is(comment.value, commentText);
});

test('Lexer tokens have their original values', function (t) {
    lexer.input("someVariableName");
    t.is(lexer.next().value, 'someVariableName');
});

test('Lexer recognizes end of stream', function (t) {
    lexer.input("");
    t.is(lexer.hasNext(), false);
});

test('Lexer recognizes stream with remaining data', function (t) {
    lexer.input("+");
    t.is(lexer.hasNext(), true);
});

test('Lexer recognizes end of stream after stream is consumed', function (t) {
    lexer.input("+");
    lexer.next();
    t.is(lexer.hasNext(), false);
});
