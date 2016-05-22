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
    var ast = g.parseProgram("procedure PutFourRedStones(){}");
    t.is(ast[0].arity, "routine");
    t.is(ast[0].name, "PutFourRedStones");
    t.is(ast[0].alias, "procedureDeclaration");
});

test('Parser recognizes functions', function (t) {
    var ast = g.parseProgram("function hasRedStones(){ return True }");
    t.is(ast[0].arity, "routine");
    t.is(ast[0].name, "hasRedStones");
    t.is(ast[0].alias, "functionDeclaration");
});

test('when function declared with empty body, should throw exception', function (t) {
    t.throws(function () {
        g.parseProgram("function hasRedStones(){  }");
    });
});

test('when function declared without return statement, should throw exception', function (t) {
    t.throws(function () {
        g.parseProgram("function hasRedStones(){ if(True){}else{} }");
    });
});

