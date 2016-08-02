var Board = require('./model');

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
