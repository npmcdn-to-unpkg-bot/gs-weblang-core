var test = require('ava');
var grammar = require('../lib/grammar');
var Parser = require('../lib/parser');
var Lexer = require('../lib/lexer');
var Names = require('../lib/gobstones-tokens-en');
var behaviors = require('../lib/interpreter');
var Context = require('../lib/execution-context');

var g;

test.beforeEach(function () {
    g = grammar(Parser, new Lexer(), Names, behaviors);
});

test('Parser recognizes functions', function () {
    var context = new Context();
    var ast = g.parseProgram(" program { Poner(red()) } function red(){ return Rojo }");
    g.interpret(ast, context);
    console.log(context);
});
