var gbs = require('./gbs');

gbs.node.Conditional = function (expression, trueBranch, falseBranch) {
    this.expression = expression;
    this.trueBranch = trueBranch;
    this.falseBranch = falseBranch;
};

gbs.node.Literal = function (value) {
    this.value = value;
};

gbs.node.BinaryOperation = function (left, right) {
    this.left = left;
    this.right = right;
};

module.exports = gbs;

// conditional: function (condition, left, right) {
// literal: function () {
// variable: function () {
// conditionalRepetition: function (condition, body) {
// numericRepetition: function (numericExpression, body) {
// assignment: function (left, right) {
// switch: function (condition, cases) {
// procedureCall: function (node, declaration, parameters) {
// functionCall: function (node, declarationProvider, parameters) {
// putStone: function (expression) {
// negation: function (expression)
// removeStone: function (expression)
// moveClaw: function (expression)
// hasStone: function (expression)
// boom: function (node)
// canMove: function (expression)
// programDeclaration: function (body)
// procedureDeclaration: function (token, parameters, body)
// functionDeclaration: function (token, parameters, body, returnExpression)
//
// rootProgram: function (grammar)
