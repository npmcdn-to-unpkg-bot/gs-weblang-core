var Context = require("./execution-context");

var Statement = {
    arity: "statement"
};

function interpretBlock(block, context) {
    block = block || [];
    for (var i = 0; i < block.length; i++) {
        console.log(">>>>>>>>>>>>>>>>><", block[i]);
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
        stmt.alias = "conditional";
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
        stmt.alias = "while";
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
        stmt.alias = "repeat";
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
        stmt.alias = ":=";
        stmt.arity = "binary";
        stmt.variable = left;
        stmt.expression = right;
        stmt.assignment = true;
        stmt.interpret = function (context) {
            context.put(left.value, right.eval(context));
        };
        return stmt;
    },
    procedureCall: function (declaration, parameters) {
        var stmt = Object.create(Statement);
        stmt.arity = "routine";
        stmt.alias = "ProcedureCall";
        stmt.declaration = declaration;
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
    functionCall: function (declarationProvider, parameters) {
        var stmt = {};
        stmt.alias = "functionCall";
        stmt.eval = function (context) {
            var declaration = declarationProvider();
            console.log("####>", declaration);
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
        stmt.alias = "PutStone";
        stmt.color = expression;
        stmt.interpret = function (context) {
            context.board().putStone(expression.eval(context));
            return context;
        };
        return stmt;
    },
    removeStone: function (expression) {
        var stmt = Object.create(Statement);
        stmt.alias = "RemoveStone";
        stmt.parameters = [expression];
        stmt.interpret = function (context) {
            context.board().removeStone(expression.eval(context));
            return context;
        };
        return stmt;
    },
    moveClaw: function (expression) {
        var stmt = Object.create(Statement);
        stmt.alias = "MoveClaw";
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
        stmt.alias = "program";
        stmt.body = body;
        stmt.interpret = function (context) {
            interpretBlock(body, context);
            return context;
        };
        return stmt;
    },
    procedureDeclaration: function (token, parameters, body) {
        token.name = token.value;
        token.arity = "routine";
        token.alias = "procedureDeclaration";
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
        token.arity = "routine";
        token.alias = "functionDeclaration";
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
                if (root[i].alias === "program") {
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

