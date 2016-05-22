var test = require('ava');
var grammar = require('../lib/grammar');
var Parser = require('../lib/parser');
var Lexer = require('../lib/lexer');
var Names = require('../lib/gobstones-tokens-en');
var behaviors = require('../lib/interpreter');

var g;

test.beforeEach(function () {
    g = grammar(Parser, new Lexer(), Names, behaviors);
});

test('Parser recognizes number literals', function (t) {
    var ast = g.parseExpression("1");
    t.is(ast.arity, 'literal');
    t.is(ast.value, 1);
});

test('Parser recognizes procedures', function (t) {
    var ast = g.parse("procedure PutFourRedStones(){}");
    t.is(ast[0].arity, "routine");
    t.is(ast[0].name, "PutFourRedStones");
    t.is(ast[0].alias, "procedureDeclaration");
});

test('Parser recognizes functions', function (t) {
    var ast = g.parse("function hasRedStones(){ return true }");
    t.is(ast[0].arity, "routine");
    t.is(ast[0].name, "hasRedStones");
    t.is(ast[0].alias, "functionDeclaration");
});

