# Gobstones language module for the web
[![Build Status](https://travis-ci.org/gobstones/gs-weblang-core.svg?branch=master)](https://travis-ci.org/gobstones/gs-weblang-core)
[![Coverage Status](https://coveralls.io/repos/github/gobstones/gs-weblang-core/badge.svg?branch=master)](https://coveralls.io/github/gobstones/gs-weblang-core?branch=master)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

## hello-world example
```js
function parse(sourceCode) {
	var tokens = gsWeblangCore.tokens
	var interpreter = gsWeblangCore.interpreter
	var Lexer = gsWeblangCore.lexer
	var Parser = gsWeblangCore.parser
	var Grammar = gsWeblangCore.grammar
	var Context = gsWeblangCore.context

	var grammar = Grammar(Parser, new Lexer(), tokens, interpreter)
	var ast = grammar.parseProgram(sourceCode);
	var context = new Context()
	grammar.interpret(ast, context);

	return context.board().table;
}

// ---------

parse("program { Mover(Norte)\nPoner(Azul) }");
```
