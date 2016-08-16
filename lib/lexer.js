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
    this.startColumn = 0;
    this.endColumn = 0;
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
    this.startColumn = 0;
    this.endColumn = 0;
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
    do {
        this._skipNonTokens();
        this._refreshCurrentAndNextChars();

        if (this.from >= this.buflen) {
            return null;
        }
    } while (this._processComment());

    // Always add cases in descending order of occurrence probability
    if (this._processIdentifier()) {
        return this._consume(TokenTypes.IDENTIFIER);
    } else if (this._processOperator()) {
        return this._consume(TokenTypes.OPERATOR);
    } else if (this._processNumber()) {
        return this._consume(TokenTypes.NUMBER);
    }
    return this._processError();
};

// PRIVATE

function error(token, description) {
    return {error: description, on: token};
}

Lexer.prototype._make = function (type, value) {
    return {
        type: type,
        value: value,
        range: {
            start: {row: this.row, column: this.startColumn},
            end: {row: this.row, column: this.endColumn}
        }
    };
};

Lexer.prototype._consume = function (type) {
    var text = this.buf.substring(this.from, this.i);
    var newToken = this._make(type, text);
    console.log(newToken);
    this.from = this.i;
    this.startColumn = this.endColumn;
    return newToken;
};

Lexer.prototype._refreshCurrentAndNextChars = function () {
    this.current = this.buf.charAt(this.from);
    this.nextChar = this.buf.charAt(this.from + 1);
};

Lexer.prototype._processOperator = function () {
    if (this.punctuators.indexOf(this.current) >= 0) {
        this._increaseFrom();
        this._processMultiCharOperator();
        return true;
    }
    return false;
};

Lexer.prototype._processMultiCharOperator = function () {
    if (this.prefix.indexOf(this.current) >= 0 && this.suffix.indexOf(this.nextChar) >= 0) {
        this._incrementStep();
    }
};

Lexer.prototype._processNumber = function () {
    if (_isDigit(this.current)) {
        this._increaseFrom();
        while (this.i < this.buflen && _isDigit(this.buf.charAt(this.i))) {
            this._incrementStep();
        }
        return true;
    }
    return false;
};

Lexer.prototype._processError = function () {
    this._increaseFrom();
    return error('Unmatched token', this._consume('UNMATCHED'));
};

Lexer.prototype._resetColumnCount = function () {
    this.startColumn = this.endColumn;
};

Lexer.prototype._increaseFrom = function () {
    this.i = this.from + 1;
    this.startColumn = this.startColumn + 1;
    this.endColumn = this.startColumn;
};

Lexer.prototype._incrementStep = function () {
    this.i++;
    this.endColumn++;
};

Lexer.prototype._processIdentifier = function () {
    if (_isAlpha(this.current)) {
        this._increaseFrom();
        while (this.i < this.buflen && _isAlphanum(this.buf.charAt(this.i))) {
            this._incrementStep();
        }
        return true;
    }
    return false;
};

Lexer.prototype._skipNonTokens = function () {
    while (this.from < this.buflen) {
        var c = this.buf.charAt(this.from);
        if (c === ' ' || c === '\t' || c === '\r' || c === '\n') {
            if (_isNewline(c)) {
                this.row += 1;
                this.endColumn = 0;
                this.startColumn = 0;
            } else {
                this.startColumn++;
                this.endColumn = this.startColumn;
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
            this._incrementStep();
        }
        this.from = this.i;
        this.row++;
        this.startColumn = 0;
        this.endColumn = 0;
        return true;
    }
};

Lexer.prototype._processMultiLineComment = function (chars) {
    if (chars === '/*') {
        this._incrementStep();
        this._incrementStep();
        while (this.i < this.buflen && this.buf.charAt(this.i) !== '*' && this.buf.charAt(this.i + 1) !== '/') {
            this._incrementStep();
            if (_isNewline(this.buf.charAt(this.i))) {
                this.endColumn = 0;
            }
        }
        this._incrementStep();
        this._incrementStep();
        this.from = this.i;
        this.endColumn = this.startColumn;
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
