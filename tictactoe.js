const SIZE = 3;
const RENDERER = document.querySelector('.renderer');
const MODEFORM = document.querySelector('form');
const RESET = document.querySelector('#reset');

class Board {
    constructor (element, size, mode="ai", startTurn="X"){
        this.mode = mode;
        this.turn = startTurn;
        this.element = element;
        this.size = size;
        this.gameOver = false;
        this.board = [];
        var html = '<table>';
        for (var i = 0; i<size; i++){
            var row = '<tr>';
            this.board[i] = [];
            for (var j = 0; j<size; j++) {
                this.board[i][j] = ' ';
                row += `<td class="box" coords="${i},${j}"></td>`;
            }
            html += row+'</tr>';
        }
        this.element.innerHTML = html+'</table>';
        var size = this.size*105-5;
        this.element.innerHTML += `<div class="statusBox" width="${size}px">${this.turn}'s turn</div>`;
        this.initListeners(this);
    }

    initListeners(self) {
        this.element.querySelectorAll('td').forEach(function (td) {
            td.onclick = function (e) {
                if (!self.gameOver){
                    var [x,y] = td.getAttribute('coords').split(",")
                    x = parseInt(x);
                    y = parseInt(y);
                    if (self.board[x][y] == ' '){
                        gameBoard.put(x,y,self.turn);
                        self.turn = self.turn == 'X' ? 'O' : 'X';
                        self.element.children[1].innerHTML = `${self.turn}'s turn`;
                        var winner = self.winTest();
                        if (winner) {
                            self.won(winner);
                        }
                        if (self.mode == 'ai') {
                            if (self.turn == 'O'){
                                self.aiSolve("min");
                            }
                            self.turn = self.turn == 'X' ? 'O' : 'X';
                            self.element.children[1].innerHTML = `${self.turn}'s turn`;
                            var winner = self.winTest();
                            if (winner) {
                                self.won(winner);
                            }
                        }
                    }
                }
            }
        })
    }

    put (x,y,move){
        this.board[x][y] = move;
        var trs = gameBoard.element.children[0].children[0].children;
        trs[x].children[y].innerHTML = move;
    }

    click (x,y){
        var trs = gameBoard.element.children[0].children[0].children;
        trs[x].children[y].onclick.apply(trs[x].children[y]);
    }

    winTest(board = this.board) {
        for (var r in board){
            if (board[r].every((val, i, arr) => val === arr[0]) && board[r][0]!=" "){
                return [board[r][0], 'hor', r];
            }
        }

        var transposed = board[0].map((_, colIndex) => board.map(row => row[colIndex]));
        for (var c in transposed){
            if (transposed[c].every((val, i, arr) => val === arr[0]) && transposed[c][0]!=" "){
                return [transposed[c][0], 'ver', c];
            }
        }

        var diag1 = [];
        for (var i = 0; i<this.size; i++){
            diag1[i] = board[i][i];
        }
        if (diag1.every((val, i, arr) => val === arr[0]) && diag1[0]!=" "){
            return [diag1[0], 'dia', 1];
        }

        var diag2 = [];
        for (var i = this.size-1; i>=0; i--){
            diag2[i] = board[this.size-i-1][i];
        }
        if (diag2.every((val, i, arr) => val === arr[0]) && diag2[0]!=" "){
            return [diag2[0], 'dia', 2];
        }
        if (board.every((val) => val.every((item) => item!=' '))) {
            return ['Nobody', null, null];
        }
        return false;
    }

    won(winner) {
        this.gameOver = true;
        var trs = this.element.children[0].children[0].children;
        for (var tr of trs){
            for (var td of tr.children){
                td.classList.add('grey');
            }
        }
        if (winner[1] == 'hor') {
            for (var i = 0; i<trs[winner[2]].children.length; i++){
                trs[winner[2]].children[i].classList.remove('grey');
                trs[winner[2]].children[i].classList.add('green');
            }
        }
        if (winner[1] == 'ver') {
            for (var i = 0; i<trs[winner[2]].children.length; i++){
                trs[i].children[winner[2]].classList.remove('grey');
                trs[i].children[winner[2]].classList.add('green');
            }
        }
        if (winner[1] == 'dia') {
            if (winner[2] == 1) {
                for (var i = 0; i<trs.length; i++){
                    trs[i].children[i].classList.remove('grey');
                    trs[i].children[i].classList.add('green');
                }
            }
            if (winner[2] == 2) {
                for (var i = trs.length-1; i>=0; i--){
                    trs[this.size-i-1].children[i].classList.remove('grey');
                    trs[this.size-i-1].children[i].classList.add('green');
                }
            }
        }
        this.element.children[1].innerHTML = `${winner[0]} wins`;
    }

    getOptions(option=this.board) {
        var numMoves = 0;
        for (var i = 0; i<this.size; i++){
            for (var j = 0; j<this.size; j++){
                if (option[i][j] != ' ') numMoves++;
            }
        }
        if (numMoves % 2 == 0){
            var player = 'X';
        }
        else {
            var player = 'O';
        }
        var options = [];
        for (var i = 0; i<this.size; i++) {
            for (var j = 0; j<this.size; j++) {
                if (option[i][j] == ' '){
                    var op = option.map((arr) => arr.slice());
                    op[i][j] = player != 'X' ? 'O' : 'X';
                    options.push(op);
                }
            }
        }
        return options;
    }

    getCost(option) {
        var winner = this.winTest(option)[0];
        if (winner == 'O'){
            return -1;
        }
        if (winner == 'X'){
            return 1;
        }
        if (winner == 'Nobody'){
            return 0;
        }
        return null;
    }

    getNodes(op=this.board) {
        var options = this.getOptions(op);
        var nodes = [];
        for (var option of options) {
            var node = this.getNodes(option);
            var cost = this.getCost(option);
            nodes.push({
                board:option,
                cost:cost,
                children:node
            });
        }
        return nodes;
    }

    min(nodes, alpha, beta) {
        var childcost = [];
        for (var node of nodes.children) {
            if (node.cost == null){
                node.cost = this.max(node, alpha, beta).cost;
            }
            beta = Math.min(beta, node.cost);
            if (beta <= alpha) {
                break;
            }
            childcost.push(node);
        }
        if (childcost.length > 0) {
            return childcost.reduce(function(prev, curr) {
                return prev.cost < curr.cost ? prev : curr;
            });
        }
    }

    max(nodes, alpha, beta) {
        var childcost = [];
        for (var node of nodes.children) {
            if (node.cost == null) {
                node.cost = this.min(node, alpha, beta).cost;
            }
            alpha = Math.max(alpha, node.cost);
            if (beta <= alpha) {
                break;
            }
            childcost.push(node);
        }
        if (childcost.length > 0) {
            return childcost.reduce(function(prev, curr) {
                return prev.cost > curr.cost ? prev : curr;
            });
        }
    }

    aiSolve(mode="max") {
        var options = {cost:null,children:this.getNodes()};
        if (mode == "max"){
            var best = this.max(options, -1, 1);
        }
        else {
            var best = this.min(options);
            if (best == undefined) return;
        }
        for (var i in best.board){
            for (var j in best.board[i]){
                this.put(i,j,best.board[i][j])
            }
        }
    }

    delete() {
        this.element.innerHTML = '';
    }
}

var mode = "ai";
var gameBoard = new Board(RENDERER, SIZE, mode);

MODEFORM.onchange = (e) => {
    gameBoard.delete();
    mode = e.target.value.toLowerCase();
    gameBoard = new Board(RENDERER, SIZE, mode);
}

RESET.onclick = () => {
    gameBoard.delete();
    gameBoard = new Board(RENDERER, SIZE, mode);
}
