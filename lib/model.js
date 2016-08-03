var GobstonesError = function (message) {
    this.message = message;
};
GobstonesError.prototype = new Error();

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
    for (var i = 0; i < this.sizeX; i++) {
        c.table[0][i] = [];
        c.table[1][i] = [];
        c.table[2][i] = [];
        c.table[3][i] = [];
        for (var j = 0; j < this.sizeY; j++) {
            c.table[0][i][j] = this.table[0][i][j];
            c.table[1][i][j] = this.table[1][i][j];
            c.table[2][i][j] = this.table[2][i][j];
            c.table[3][i][j] = this.table[3][i][j];
        }
    }
    c.x = this.x;
    c.y = this.y;
    return c;
};

Board.prototype.putStone = function (color) {
    this.table[color][this.x][this.y] += 1;
};

Board.prototype.removeStone = function (color) {
    if (this.table[color][this.x][this.y] <= 0) {
        throw new GobstonesError('Se intentó sacar una bolita pero ya no quedaban bolitas para sacar');
    }
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
    if (!this.canMove(vec)) {
        throw new GobstonesError('Te caiste del tablero por: x=' + this.x + ' y=' + this.y);
    }
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
