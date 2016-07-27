(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["gsWeblangCore"] = factory();
	else
		root["gsWeblangCore"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	    grammar: __webpack_require__(1),
	    parser: __webpack_require__(2),
	    lexer: __webpack_require__(3),
	    tokens: __webpack_require__(4),
	    interpreter: __webpack_require__(5),
	    context: __webpack_require__(6)
	};


/***/ },
/* 1 */
/***/ function(module, exports) {

	function Grammar(Parser, lexer, names, behaviour) {
	    'use strict';
	
	    var n = names;
	    var b = behaviour;
	    var g = new Parser(lexer);
	
	    function operator(op, bp, f) {
	        g.infix(op, bp, function (left) {
	            var self = this;
	            this.left = left;
	            this.right = g.expression(bp);
	            this.arity = 'binary';
	            this.eval = function (context) {
	                return f(self.right.eval(context), self.left.eval(context));
	            };
	            return this;
	        });
	    }
	
	    function parameterListCall() {
	        var parameters = [];
	        if (g.token.id !== ')') {
	            for (; ;) {
	                parameters.push(g.expression(0));
	                if (g.token.id !== ',') {
	                    break;
	                }
	                g.advance(',');
	            }
	        }
	        g.advance(')');
	        return parameters;
	    }
	
	    function parameterDeclarationList() {
	        var parameters = [];
	        g.advance('(');
	        if (g.token.id !== ')') {
	            for (; ;) {
	                if (g.token.arity !== 'name') {
	                    g.error(g.token, 'Expected a parameter name.');
	                }
	                g.scope.define(g.token);
	                parameters.push(g.token);
	                g.advance();
	                if (g.token.id !== ',') {
	                    break;
	                }
	                g.advance(',');
	            }
	        }
	        g.advance(')');
	        return parameters;
	    }
	
	    function parenthesisExpression() {
	        'use strict';
	        g.advance('(');
	        var p = g.expression(0);
	        g.advance(')');
	        return p;
	    }
	
	    function bodyStatement() {
	        return (g.token.id === '{') ? g.block() : [g.statement()];
	    }
	
	    operator('<', 40, function (x, y) {
	        return x < y;
	    });
	    operator('<=', 40, function (x, y) {
	        return x <= y;
	    });
	    operator('>', 40, function (x, y) {
	        return x > y;
	    });
	    operator('>=', 40, function (x, y) {
	        return x >= y;
	    });
	    operator('!=', 40, function (x, y) {
	        return x !== y;
	    });
	    operator('==', 40, function (x, y) {
	        return x === y;
	    });
	    operator('||', 20, function (x, y) {
	        return x || y;
	    });
	    operator('&&', 20, function (x, y) {
	        return x && y;
	    });
	    operator('+', 50, function (x, y) {
	        return x + y;
	    });
	    operator('-', 50, function (x, y) {
	        return x - y;
	    });
	    operator('*', 60, function (x, y) {
	        return x * y;
	    });
	    operator('/', 60, function (x, y) {
	        return x / y;
	    });
	    
	    g.prefix(n.NOT, function (x) {
	       return b.negation(g.expression(60)); 
	    });
	
	    g.symbol('(end)');
	
	    g.symbol(':');
	    g.symbol(')');
	    g.symbol('(');
	    g.symbol(']');
	    g.symbol('}');
	    g.symbol(',');
	    g.symbol('->');
	    g.symbol(n.ELSE);
	    g.symbol(n.TO);
	
	    g.constant(n.FALSE, false);
	    g.constant(n.TRUE, true);
	    g.constant(n.BLUE, 0);
	    g.constant(n.RED, 1);
	    g.constant(n.BLACK, 2);
	    g.constant(n.GREEN, 3);
	    g.constant(n.NORTH, [0, 1]);
	    g.constant(n.SOUTH, [0, -1]);
	    g.constant(n.EAST, [1, 0]);
	    g.constant(n.WEST, [-1, 0]);
	
	    g.stmt(';', function () {
	        return {separator: ';'};
	    });
	
	    g.infix('(', 80, function (left) {
	        if (left.arity !== 'name') {
	            g.error(left, left.value + ' is not a routine');
	        }
	        var parameters = parameterListCall();
	        var node;
	        if (left.value[0].toUpperCase() === left.value[0]) {
	            node = b.procedureCall(left.value, function () {
	                return g.scope.find(left.value);
	            }, parameters);
	        } else {
	            node = b.functionCall(left.value, function () {
	                return g.scope.find(left.value);
	            }, parameters);
	        }
	        return node;
	    });
	
	    g.infixr(':=', 10, function (left) {
	        if (left.id !== '.' && left.id !== '[' && left.arity !== 'name') {
	            g.error(left, 'Bad lvalue.');
	        }
	        return b.assignment(left, g.expression(9));
	    });
	
	    g.stmt(n.PUT, function () {
	        return b.putStone(parenthesisExpression());
	    });
	    g.stmt(n.REMOVE, function () {
	        return b.removeStone(parenthesisExpression());
	    });
	    g.stmt(n.MOVE, function () {
	        return b.moveClaw(parenthesisExpression());
	    });
	    g.prefix(n.HAS_STONES, function () {
	        return b.hasStone(parenthesisExpression());
	    });
	    g.prefix(n.CAN_MOVE, function () {
	        return b.canMove(parenthesisExpression());
	    });
	
	    g.symbol('(literal)').nud = b.literal();
	    g.symbol('(name)').nud = b.variable();
	
	    g.stmt(n.IF, function () {
	        g.advance('(');
	        var condition = g.expression(0);
	        g.advance(')');
	        var trueBranch = bodyStatement();
	        var falseBranch = null;
	        if (g.token.id === n.ELSE) {
	            g.scope.reserve(g.token);
	            g.advance(n.ELSE);
	            falseBranch = bodyStatement();
	        }
	        return b.conditional(condition, trueBranch, falseBranch);
	    });
	
	    g.stmt(n.SWITCH, function () {
	        var condition = parenthesisExpression();
	        if (g.token.id === n.TO) {
	           g.advance(n.TO); 
	        }
	        g.advance('{');
	        var cases = [];
	        for (; ;) {
	            var exp = g.expression(0);
	            g.advance('->');
	            var body = bodyStatement();
	            cases.push({
	                case: exp,
	                body: body
	            });
	            if (g.token.id === '}' || !g.tokens.hasNext()) {
	                break;
	            }
	        }
	        g.advance('}');
	        return b.switch(condition, cases);
	    });
	
	    g.stmt(n.WHILE, function () {
	        var condition = parenthesisExpression();
	        var body = bodyStatement();
	        return b.conditionalRepetition(condition, body);
	    });
	
	    g.stmt(n.REPEAT, function () {
	        var numericExpression = parenthesisExpression();
	        var body = bodyStatement();
	        return b.numericRepetition(numericExpression, body);
	    });
	
	    g.stmt('{', function () {
	        var a = g.statements();
	        g.advance('}');
	        return a;
	    });
	
	    g.stmt('(', function () {
	        var a = g.statements();
	        g.advance(')');
	        return a;
	    });
	
	    g.root(n.PROGRAM, function () {
	        return b.programDeclaration(g.block());
	    });
	
	    g.root(n.FUNCTION, function () {
	        g.newScope();
	        var token = g.token;
	        if (g.token.arity === 'name') {
	            g.scope.define(g.token);
	            g.advance();
	        }
	        var parameters = parameterDeclarationList();
	        var body = bodyStatement();
	        var ret = body.pop();
	        if (!ret || ret.alias !== 'return' || !ret.expression) {
	            g.error(token, 'La función ' + token.value + ' debe terminar con un ' + n.RETURN);
	        }
	        g.scope.pop();
	        var declaration = b.functionDeclaration(token, parameters, body, ret.expression);
	        declaration.std = function () {
	            return declaration;
	        };
	        return declaration;
	    });
	
	    g.root(n.PROCEDURE, function () {
	        /**
	         * Bind scope to token
	         * Bind declaration to token
	         */
	
	        g.newScope();
	        var token = g.token;
	        if (g.token.arity === 'name') {
	            g.scope.define(g.token);
	            g.advance();
	        }
	        var parameters = parameterDeclarationList();
	        var body = bodyStatement();
	        g.scope.pop();
	        var declaration = b.procedureDeclaration(token, parameters, body);
	        declaration.std = function () {
	            return declaration;
	        };
	        return declaration;
	    });
	
	    g.stmt(n.RETURN, function () {
	        if (g.token.id !== ';') {
	            this.alias = 'return';
	            this.expression = parenthesisExpression();
	        }
	        return this;
	    });
	
	    return b.rootProgram(g);
	}
	
	module.exports = Grammar;
	


/***/ },
/* 2 */
/***/ function(module, exports) {

	function Parser(lexer) {
	    this.scope = null;
	    this.token = null;
	    this.tokens = lexer;
	    var self = this;
	
	    var symbolTable = {};
	
	    this.error = function (token, description) {
	        var someError = {error: description, on: token};
	        throw someError;
	    };
	
	    var OriginalSymbol = {
	        nud: function () {
	            self.error(this, 'Undefined.');
	        },
	        led: function () {
	            self.error(this, 'Missing operator.');
	        }
	    };
	
	    var itself = function () {
	        return this;
	    };
	
	    var originalScope = {
	        define: function (name) {
	            var t = this.def[name.value];
	            if (typeof t === 'object') {
	                self.error(name, t.reserved ? 'Already reserved.' : 'Already defined.');
	            }
	            this.def[name.value] = name;
	            name.reserved = false;
	            name.nud = itself;
	            name.led = null;
	            name.std = null;
	            name.lbp = 0;
	            name.scope = self.scope;
	            return name;
	        },
	        find: function (name) {
	            var e = this;
	            var targetToken;
	            for (; ;) {
	                targetToken = e.def[name];
	                if (targetToken && typeof targetToken !== 'function') {
	                    return e.def[name];
	                }
	                e = e.parent;
	                if (!e) {
	                    targetToken = symbolTable[name];
	                    return targetToken && typeof targetToken !== 'function' ? targetToken : symbolTable['(name)'];
	                }
	            }
	        },
	        pop: function () {
	            this.scope = this.parent;
	        },
	        reserve: function (name) {
	            if (name.arity !== 'name' || name.reserved) {
	                return;
	            }
	            var t = this.def[name.value];
	            if (t) {
	                if (t.reserved) {
	                    return;
	                }
	                if (t.arity === 'name') {
	                    name.error('Already defined.');
	                }
	            }
	            this.def[name.value] = name;
	            name.reserved = true;
	        }
	    };
	
	    this.newScope = function () {
	        var s = self.scope;
	        self.scope = Object.create(originalScope);
	        self.scope.def = {};
	        self.scope.parent = s;
	        return self.scope;
	    };
	
	    this.symbol = function (id, bindingPower) {
	        var s = symbolTable[id];
	        bindingPower = bindingPower || 0;
	        if (s) {
	            if (bindingPower >= s.lbp) {
	                s.lbp = bindingPower;
	            }
	        } else {
	            s = Object.create(OriginalSymbol);
	            s.id = s.value = id;
	            s.lbp = bindingPower;
	            symbolTable[id] = s;
	        }
	        return s;
	    };
	
	    this.expression = function (rightBindingPower) {
	        var left;
	        var t = self.token;
	        this.advance();
	        left = t.nud();
	        while (rightBindingPower < self.token.lbp) {
	            t = self.token;
	            this.advance();
	            left = t.led(left);
	        }
	        return left;
	    };
	
	    this.constant = function (symbol, value) {
	        var x = this.symbol(symbol);
	        x.nud = function () {
	            self.scope.reserve(this);
	            this.value = symbolTable[this.id].value;
	            this.arity = 'literal';
	            this.eval = function () {
	                return value;
	            };
	            return this;
	        };
	        x.value = value;
	        return x;
	    };
	
	    this.infix = function (id, bp, led) {
	        var s = this.symbol(id, bp);
	        s.led = led || function (left) {
	            this.left = left;
	            this.right = self.expression(bp);
	            this.arity = 'binary';
	            return this;
	        };
	        return s;
	    };
	
	    this.infixr = function (id, bp, led) {
	        var s = this.symbol(id, bp);
	        s.led = led || function (left) {
	            this.left = left;
	            this.right = self.expression(bp - 1);
	            this.arity = 'binary';
	            return this;
	        };
	        return s;
	    };
	
	    this.prefix = function (id, nud) {
	        var s = this.symbol(id);
	        s.nud = nud || function () {
	            scope.reserve(this);
	            this.left = self.expression(70);
	            this.arity = 'unary';
	            return this;
	        };
	        return s;
	    };
	
	    this.stmt = function (symbol, f) {
	        var x = this.symbol(symbol);
	        x.std = f;
	        return x;
	    };
	
	    this.root = function (symbol, f) {
	        var x = this.symbol(symbol);
	        x.root = f;
	        return x;
	    };
	
	    /**
	     * The advance function fetches the next token,
	     * generating the corresponding symbol from the definitions on symbolTable
	     *
	     * @param id. Token ID
	     * @returns Token
	     */
	    this.advance = function (id) {
	        var a;
	        var o;
	        var t;
	        var v;
	        var tokens = this.tokens;
	        if (id && this.token.id !== id) {
	            this.error(this.token, 'Se esperaba "' + id + '" pero se encontró ' + this.token.value);
	        }
	        if (!tokens.hasNext()) {
	            this.token = symbolTable['(end)'];
	            return this.token;
	        }
	        t = tokens.next();
	        v = t.value;
	        a = t.type;
	        if (a === 'name') {
	            o = this.scope.find(v);
	        } else if (a === 'operator') {
	            o = symbolTable[v];
	            if (!o) {
	                this.error(t, 'Unknown operator.');
	            }
	        } else if (a === 'number') {
	            o = symbolTable['(literal)'];
	            a = 'literal';
	            v = parseInt(v, 10);
	        } else {
	            this.error(t, 'Unexpected token.');
	        }
	
	        var token = Object.create(o);
	        token.from = t.from;
	        token.row = t.row;
	        token.to = t.to;
	        token.value = v;
	        token.arity = a;
	        this.token = token;
	        return token;
	    };
	
	    this.block = function () {
	        var t = this.token;
	        this.advance('{');
	        return t.std();
	    };
	
	    this.statement = function () {
	        var n = this.token;
	        var v;
	
	        if (n.std) {
	            this.advance();
	            self.scope.reserve(n);
	            return n.std();
	        }
	        v = this.expression(0);
	        if (!v.assignment && v.id !== '(' && v.arity !== 'routine') {
	            this.error(v, 'Bad expression statement.');
	        }
	        return v;
	    };
	
	    this.rootDeclaration = function () {
	        var n = this.token;
	        var v;
	
	        if (n.root) {
	            this.advance();
	            self.scope.reserve(n);
	            return n.root();
	        }
	        v = this.expression(0);
	        if (!v.assignment && v.id !== '(' && v.arity !== 'routine') {
	            this.error(v, 'Bad expression statement.');
	        }
	        return v;
	    };
	
	    this.statements = function () {
	        var statementsList = [];
	        var symbol;
	        for (; ;) {
	            if (this.token.id === '}' || this.token.id === '(end)') {
	                break;
	            }
	            var from = this.token.from;
	            symbol = this.statement();
	            if (symbol) {
	                symbol.from = from;
	                if (this.token.from) {
	                    symbol.to = this.token.from;
	                }
	                statementsList.push(symbol);
	            }
	        }
	        if (statementsList.length === 0) {
	            return null;
	        }
	        return statementsList;
	    };
	
	    this.roots = function () {
	        var roots = [];
	        var symbol;
	        for (; ;) {
	            if (this.token.id === '(end)') {
	                break;
	            }
	            var from = this.token.from;
	            symbol = this.rootDeclaration();
	            if (symbol) {
	                symbol.from = from;
	                if (this.token.from) {
	                    symbol.to = this.token.from;
	                }
	                roots.push(symbol);
	            }
	        }
	        if (roots.length === 0) {
	            return null;
	        }
	        return roots;
	    };
	
	    this.parseProgram = function (input) {
	        this.tokens.input(input);
	        this.newScope();
	        this.advance();
	        var s = this.roots();
	        this.advance('(end)');
	        this.scope.pop();
	        return s;
	    };
	
	    this.parse = function (input) {
	        this.tokens.input(input);
	        this.newScope();
	        this.advance();
	        var s = this.statements();
	        this.advance('(end)');
	        this.scope.pop();
	        return s;
	    };
	
	    this.parseExpression = function (input) {
	        this.tokens.input(input);
	        this.newScope();
	        this.advance();
	        var s = this.expression(0);
	        this.advance('(end)');
	        this.scope.pop();
	        return s;
	    };
	}
	
	module.exports = Parser;


/***/ },
/* 3 */
/***/ function(module, exports) {

	/**
	 * LEXER
	 *
	 * The lexer class is an iterator that takes a String as input in Lexer.input
	 * and returns a token each time Lexer.next is called, or null otherwise.
	 * Characters used for multi character operators can be configured on instantiation.
	 */
	
	// PUBLIC
	
	function Lexer(prefix, suffix) {
	    // Current reading position
	    this.from = 0;
	    this.row = 0;
	    this.prefix = prefix || '!=-<>:|&';
	    this.suffix = suffix || '=|&>';
	
	    this.punctuators = '+-*.:%|!?#&;,()<>{}[]=';
	
	    // Look ahead position
	    this.i = 0;
	
	    this.buf = null;
	    this.buflen = 0;
	}
	
	Lexer.prototype.hasNext = function () {
	    this._skipNonTokens();
	    return this.from < this.buflen;
	};
	
	Lexer.prototype.input = function (buf) {
	    this.from = 0;
	    this.i = 0;
	    this.row = 0;
	    this.buf = buf;
	    this.buflen = buf.length;
	    this.current = null;
	    this.nextChar = null;
	};
	
	var TokenTypes = {
	    IDENTIFIER: 'name',
	    OPERATOR: 'operator',
	    EOF: 'eof',
	    COMMENT: 'comment',
	    NUMBER: 'number',
	    NEWLINE: 'newline'
	};
	
	/**
	 * This method is highly procedural for performance reasons.
	 * There is no need for the lexer to be too flexible, since the
	 * semantics will be associated to identifiers on the parser.
	 *
	 * @returns Token. The next token on the buffer, or null if the buffer is empty.
	 */
	Lexer.prototype.next = function () {
	    this._skipNonTokens();
	    this._refreshCurrentAndNextChars();
	
	    if (this.from >= this.buflen) {
	        return null;
	    }
	
	    // Always add cases in descending order of occurrence probability
	    if (this._processIdentifier()) {
	        return this._consume(TokenTypes.IDENTIFIER);
	    } else if (this._processOperator()) {
	        return this._consume(TokenTypes.OPERATOR);
	    } else if (this._processNumber()) {
	        return this._consume(TokenTypes.NUMBER);
	    } else if (this._processComment()) {
	        return this._consume(TokenTypes.COMMENT);
	    }
	
	    return this._processError();
	};
	
	// PRIVATE
	
	function error(token, description) {
	    return {error: description, on: token};
	}
	
	Lexer.prototype._make = function (type, value) {
	    return {type: type, value: value, from: this.from, to: this.i, row: this.row};
	};
	
	Lexer.prototype._consume = function (type) {
	    var text = this.buf.substring(this.from, this.i);
	    var newToken = this._make(type, text);
	    this.from = this.i;
	    return newToken;
	};
	
	Lexer.prototype._refreshCurrentAndNextChars = function () {
	    this.current = this.buf.charAt(this.from);
	    this.nextChar = this.buf.charAt(this.from + 1);
	};
	
	Lexer.prototype._processOperator = function () {
	    if (this.punctuators.indexOf(this.current) >= 0) {
	        this.i = this.from + 1;
	        this._processMultiCharOperator();
	        return true;
	    }
	    return false;
	};
	
	Lexer.prototype._processMultiCharOperator = function () {
	    if (this.prefix.indexOf(this.current) >= 0 && this.suffix.indexOf(this.nextChar) >= 0) {
	        this.i++;
	    }
	};
	
	Lexer.prototype._processNumber = function () {
	    if (_isDigit(this.current)) {
	        this.i = this.from + 1;
	        while (this.i < this.buflen && _isDigit(this.buf.charAt(this.i))) {
	            this.i++;
	        }
	        return true;
	    }
	    return false;
	};
	
	Lexer.prototype._processError = function () {
	    this.i = this.from + 1;
	    return error('Unmatched token', this._consume('UNMATCHED'));
	};
	
	Lexer.prototype._processIdentifier = function () {
	    if (_isAlpha(this.current)) {
	        this.i = this.from + 1;
	        while (this.i < this.buflen && _isAlphanum(this.buf.charAt(this.i))) {
	            this.i++;
	        }
	        return true;
	    }
	    return false;
	};
	
	Lexer.prototype._skipNonTokens = function () {
	    while (this.from < this.buflen) {
	        var c = this.buf.charAt(this.from);
	        if (c === ' ' || c === '\t' || c === '\r' || c === '\n') {
	            if (c === '\n') {
	                this.row += 1;
	            }
	            this.from++;
	            this.i = this.from;
	        } else {
	            break;
	        }
	    }
	};
	
	Lexer.prototype._processComment = function () {
	    var chars = this.current + this.nextChar;
	    return this._processSingleLineComment(chars) || this._processMultiLineComment(chars);
	};
	
	Lexer.prototype._processSingleLineComment = function (chars) {
	    if (chars === '//') {
	        while (this.i < this.buflen && !_isNewline(this.buf.charAt(this.i))) {
	            this.i++;
	        }
	        return true;
	    }
	};
	
	Lexer.prototype._processMultiLineComment = function (chars) {
	    if (chars === '/*') {
	        this.i = this.i + 2;
	        while (this.i < this.buflen && this.buf.charAt(this.i) !== '*' && this.buf.charAt(this.i + 1) !== '/') {
	            this.i++;
	        }
	        this.i = this.i + 2;
	        return true;
	    }
	    return false;
	};
	
	function _isNewline(c) {
	    return c === '\r' || c === '\n';
	}
	
	function _isDigit(c) {
	    return c >= '0' && c <= '9';
	}
	
	function _isAlpha(c) {
	    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || c === '$';
	}
	
	function _isAlphanum(c) {
	    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c === '_' || c === '$';
	}
	
	module.exports = Lexer;


/***/ },
/* 4 */
/***/ function(module, exports) {

	var TOKEN_NAMES = {
	    WHILE: 'while',
	    IF: 'if',
	    ELSE: 'else',
	    SWITCH: 'switch',
	    REPEAT: 'repeat',
	    FUNCTION: 'function',
	    PROCEDURE: 'procedure',
	    PROGRAM: 'program',
	    PUT: 'Poner',
	    REMOVE: 'Sacar',
	    HAS_STONES: 'hayBolitas',
	    CAN_MOVE: 'puedeMover',
	    MOVE: 'Mover',
	    RETURN: 'return',
	    RED: 'Rojo',
	    BLUE: 'Azul',
	    BLACK: 'Negro',
	    GREEN: 'Verde',
	    TRUE: 'True',
	    NOT: 'not',
	    TO: 'to',
	    FALSE: 'False',
	    NORTH: 'Norte',
	    SOUTH: 'Sur',
	    EAST: 'Este',
	    WEST: 'Oeste'
	};
	
	module.exports = TOKEN_NAMES;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var Context = __webpack_require__(6);
	
	var Statement = {
	    arity: 'statement'
	};
	
	function interpretBlock(block, context) {
	    block = block || [];
	    for (var i = 0; i < block.length; i++) {
	        block[i].interpret(context);
	    }
	}
	
	function fillParameters(context, parameters, declaration) {
	    for (var i = 0; i < declaration.parameters.length; i++) {
	        context.put(declaration.parameters[i].value, parameters[i].eval(context));
	    }
	}
	
	var behaviours = {
	    conditional: function (condition, left, right) {
	        var stmt = Object.create(Statement);
	        stmt.alias = 'conditional';
	        stmt.condition = condition;
	        stmt.left = left;
	        stmt.right = right;
	        stmt.interpret = function (context) {
	            interpretBlock(condition.eval(context) ? left : right, context);
	            return context;
	        };
	        return stmt;
	    },
	    literal: function () {
	        return function () {
	            var self = this;
	            this.eval = function () {
	                return self.value;
	            };
	            return this;
	        };
	    },
	    variable: function () {
	        return function () {
	            var self = this;
	            this.eval = function (context) {
	                return context.get(self.value);
	            };
	            return this;
	        };
	    },
	    conditionalRepetition: function (condition, body) {
	        var stmt = Object.create(Statement);
	        stmt.alias = 'while';
	        stmt.expression = condition;
	        stmt.body = body;
	        stmt.interpret = function (context) {
	            while (condition.eval(context)) {
	                interpretBlock(body, context);
	            }
	            return context;
	        };
	        return stmt;
	    },
	    numericRepetition: function (numericExpression, body) {
	        var stmt = Object.create(Statement);
	        stmt.alias = 'repeat';
	        stmt.expression = numericExpression;
	        stmt.body = body;
	        stmt.interpret = function (context) {
	            var times = numericExpression.eval(context);
	            for (var i = 0; i <= times; i++) {
	                interpretBlock(body, context);
	            }
	            return context;
	        };
	        return stmt;
	    },
	    assignment: function (left, right) {
	        var stmt = Object.create(Statement);
	        stmt.alias = ':=';
	        stmt.arity = 'binary';
	        stmt.variable = left;
	        stmt.expression = right;
	        stmt.assignment = true;
	        stmt.interpret = function (context) {
	            context.put(left.value, right.eval(context));
	        };
	        return stmt;
	    },
	    switch: function (condition, cases) {
	        var stmt = Object.create(Statement);
	        stmt.alias = 'switch';
	        stmt.value = condition;
	        stmt.cases = cases;
	        stmt.interpret = function (context) {
	            var value = condition.eval(context);
	            
	            for (var i = 0; i < cases.length; i++) {
	                console.log(value, "   ---   ",cases[i].case.eval(context), value == cases[i].case.eval(context), value === cases[i].case.eval(context));
	                if (cases[i].case.eval(context) === value) {
	                    console.log(cases[i].body, " <<<<<< ");
	                    interpretBlock(cases[i].body, context);
	                }
	            }
	            return context;
	        };
	        return stmt;
	    },
	    procedureCall: function (name, declaration, parameters) {
	        var stmt = Object.create(Statement);
	        stmt.arity = 'routine';
	        stmt.alias = 'ProcedureCall';
	        stmt.name = name;
	        stmt.parameters = parameters;
	
	        stmt.interpret = function (context) {
	            context.startContext();
	            fillParameters(context, parameters, declaration);
	            interpretBlock(declaration.body, context);
	            context.stopContext();
	            return context;
	        };
	        return stmt;
	    },
	    functionCall: function (name, declarationProvider, parameters) {
	        var stmt = {};
	        stmt.alias = 'functionCall';
	        stmt.name = name;
	        stmt.eval = function (context) {
	            var declaration = declarationProvider();
	            context.startContext();
	            context.pushBoard();
	            if (declaration.parameters) {
	                fillParameters(context, parameters, declaration);
	            }
	            interpretBlock(declaration.body, context);
	            var result = declaration.return.eval(context);
	            context.popBoard();
	            context.stopContext();
	            return result;
	        };
	        return stmt;
	    },
	    putStone: function (expression) {
	        var stmt = Object.create(Statement);
	        stmt.alias = 'PutStone';
	        stmt.color = expression;
	        stmt.interpret = function (context) {
	            context.board().putStone(expression.eval(context));
	            return context;
	        };
	        return stmt;
	    },
	    negation: function(expression) {
	        var exp = {arity: 'unary'};
	        exp.alias = 'not';
	        exp.expression = expression;
	        exp.eval = function (context) {
	            return !expression.eval(context);
	        };
	        return this;
	    },
	    removeStone: function (expression) {
	        var stmt = Object.create(Statement);
	        stmt.alias = 'RemoveStone';
	        stmt.parameters = [expression];
	        stmt.interpret = function (context) {
	            context.board().removeStone(expression.eval(context));
	            return context;
	        };
	        return stmt;
	    },
	    moveClaw: function (expression) {
	        var stmt = Object.create(Statement);
	        stmt.alias = 'MoveClaw';
	        stmt.paramters = [expression];
	        stmt.interpret = function (context) {
	            context.board().move(expression.eval(context));
	            return context;
	        };
	        return stmt;
	    },
	    hasStone: function (expression) {
	        var fun = {};
	        fun.eval = function (context) {
	            return context.board().hasStone(expression.eval(context));
	        };
	        return fun;
	    },
	    canMove: function (expression) {
	        var fun = {};
	        fun.eval = function (context) {
	            return context.board().canMove(expression.eval(context));
	        };
	        return fun;
	    },
	    programDeclaration: function (body) {
	        var stmt = Object.create(Statement);
	        stmt.alias = 'program';
	        stmt.body = body;
	        stmt.interpret = function (context) {
	            interpretBlock(body, context);
	            return context;
	        };
	        return stmt;
	    },
	    procedureDeclaration: function (token, parameters, body) {
	        token.name = token.value;
	        token.arity = 'routine';
	        token.alias = 'procedureDeclaration';
	        token.parameters = parameters;
	        token.body = body;
	        token.interpret = function (context) {
	            return context;
	        };
	        return token;
	    },
	    functionDeclaration: function (token, parameters, body, returnExpression) {
	        token.interpret = function (context) {
	            return context;
	        };
	        token.name = token.value;
	        token.arity = 'routine';
	        token.alias = 'functionDeclaration';
	        token.parameters = parameters;
	        token.body = body;
	        token.return = returnExpression;
	        return token;
	    },
	    rootProgram: function (grammar) {
	        grammar.interpret = function (root, context) {
	            var main;
	            var declarations = [];
	            context = context || new Context();
	            for (var i = 0; i < root.length; i++) {
	                if (root[i].alias === 'program') {
	                    main = root[i];
	                } else {
	                    declarations.push(root[i]);
	                }
	            }
	            interpretBlock(declarations, context);
	            main.interpret(context);
	        };
	        return grammar;
	    }
	};
	
	module.exports = behaviours;
	


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var Board = __webpack_require__(7);
	
	var Context = function () {
	    var variablesStack = [];
	    var boardsStack = [];
	    var currentBoard = new Board(9, 9);
	    var currentVariables = {};
	
	    this.init = function () {
	        currentBoard.init();
	    };
	
	    this.board = function () {
	        return currentBoard;
	    };
	
	    this.put = function (key, value) {
	        console.log('VARIABLE SET: ', key, '   ', value);
	        currentVariables[key] = value;
	    };
	
	    this.get = function (id) {
	        return currentVariables[id];
	    };
	
	    this.all = function () {
	        return currentVariables;
	    };
	
	    this.startContext = function () {
	        variablesStack.push(currentVariables);
	        currentVariables = {};
	    };
	
	    this.stopContext = function () {
	        currentVariables = variablesStack.pop();
	    };
	
	    this.pushBoard = function () {
	        boardsStack.push(currentBoard);
	        currentBoard = currentBoard.clone();
	    };
	
	    this.popBoard = function () {
	        currentBoard = boardsStack.pop();
	    };
	
	    this.init();
	};
	
	module.exports = Context;


/***/ },
/* 7 */
/***/ function(module, exports) {

	function Board(sizeX, sizeY) {
	    this.x = 0;
	    this.y = 0;
	
	    this.sizeX = sizeX;
	    this.sizeY = sizeY;
	}
	
	Board.blue = 0;
	Board.red = 1;
	Board.black = 2;
	Board.green = 3;
	
	Board.prototype.init = function () {
	    this.table = [[], [], [], []];
	    for (var i = 0; i < this.sizeX; i++) {
	        this.table[0][i] = [];
	        this.table[1][i] = [];
	        this.table[2][i] = [];
	        this.table[3][i] = [];
	        for (var j = 0; j < this.sizeY; j++) {
	            this.table[0][i][j] = 0;
	            this.table[1][i][j] = 0;
	            this.table[2][i][j] = 0;
	            this.table[3][i][j] = 0;
	        }
	    }
	};
	
	Board.prototype.clone = function () {
	    var c = new Board(this.sizeX, this.sizeY);
	    c.init();
	    for (var i = 0; i < this.table.length; i++) {
	        c.table[i] = this.table[i].slice();
	    }
	    c.x = this.x;
	    c.y = this.y;
	    return c;
	};
	
	Board.prototype.putStone = function (color) {
	    this.table[color][this.x][this.y] += 1;
	};
	
	Board.prototype.removeStone = function (color) {
	    this.table[color][this.x][this.y] -= 1;
	};
	
	Board.prototype.hasStone = function (color) {
	    return this.table[color][this.x][this.y];
	};
	
	Board.prototype.canMove = function (vec) {
	    var nextX = this.x + vec[0];
	    var nextY = this.y + vec[1];
	    return nextX < this.sizeX && nextX >= 0 && nextY < this.sizeY && nextY >= 0;
	};
	
	Board.prototype.move = function (vec) {
	    this.x += vec[0];
	    this.y += vec[1];
	};
	
	Board.prototype.printAscii = function () {
	    var out = this.sizeX + 'x' + this.sizeY + '\n';
	    var az = this.table[0];
	    var ro = this.table[1];
	    var ne = this.table[2];
	    var ve = this.table[3];
	    for (var j = this.sizeY - 1; j >= 0; j--) {
	        for (var i = 0; i < this.sizeX; i++) {
	            out += (az[i][j] || ro[i][j] || ne[i][j] || ve[i][j]) ? '#' : '.';
	        }
	        out += '\n';
	    }
	    return out;
	};
	
	module.exports = Board;


/***/ }
/******/ ])
});
;
//# sourceMappingURL=index.umd.js.map