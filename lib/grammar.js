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
                return f(self.left.eval(context), self.right.eval(context));
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
                    g.error(g.token, 'Se esperaba un nombre de parámetro.');
                }
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
    g.prefix(n.NOT, function () {
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

    g.constant(n.FALSE, false, n.BOOLEAN);
    g.constant(n.TRUE, true, n.BOOLEAN);
    g.constant(n.BLUE, 0, n.COLOR);
    g.constant(n.RED, 1, n.COLOR);
    g.constant(n.BLACK, 2, n.COLOR);
    g.constant(n.GREEN, 3, n.COLOR);
    g.constant(n.NORTH, [0, 1], n.DIRECTION);
    g.constant(n.SOUTH, [0, -1], n.DIRECTION);
    g.constant(n.EAST, [1, 0], n.DIRECTION);
    g.constant(n.WEST, [-1, 0], n.DIRECTION);

    g.stmt(';', function () {
        return {separator: ';'};
    });

    g.infix('(', 80, function (left) {
        if (left.arity !== 'name') {
            g.error(left, left.value + ' no es una función o procedimiento');
        }
        var parameters = parameterListCall();
        var node;
        if (left.value[0].toUpperCase() === left.value[0]) {
            node = b.procedureCall(left, function () {
                return g.scope.find(left.value);
            }, parameters);
        } else {
            node = b.functionCall(left, function () {
                return g.scope.find(left.value);
            }, parameters);
        }
        return node;
    });

    g.stmt(n.MOVE, function () {
        return b.moveClaw(parenthesisExpression());
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
    g.stmt(n.BOOM, function () {
        var boom = b.boom(g.token);
        g.advance('(');
        g.advance(')');
        return boom;
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
        var start = g.token.range;
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
        var node = b.conditional(condition, trueBranch, falseBranch);
        node.range = start;
        return node;
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
        var programDeclaration = b.programDeclaration(g.block());
        programDeclaration.range = g.token.range;
        return programDeclaration;
    });

    g.root(n.FUNCTION, function () {
        g.newScope();
        var token = g.token;
        if (g.token.arity === 'name') {
            if (g.token.value[0] !== g.token.value[0].toLowerCase()) {
                g.error(token, 'El nombre de la función ' + token.value + ' debe emepzar con minúscula');
            }
            g.scope.define(g.token);
            g.advance();
        } else {
            g.error(token, 'Se esperaba un nombre de función');
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
        g.newScope();
        var token = g.token;
        if (g.token.arity === 'name') {
            if (g.token.value[0] !== g.token.value[0].toUpperCase()) {
                g.error(token, 'El nombre del procedimiento ' + token.value + ' debe emepzar con mayúscula');
            }
            g.scope.define(g.token);
            g.advance();
        } else {
            g.error(token, 'Se esperaba un nombre de procedimiento');
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

