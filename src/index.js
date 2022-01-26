"use strict";
const EMPTY = " ";
const MARK = "🚩";
const MINE = "💣";
console.log("test");
var gBoard = [];

var gLevel = [];
var gGame = [];

function initGame() {
  console.log("game loaded");
  //   disableMenuDisplay();
  gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
  };
  gLevel = {
    SIZE: 4,
    MINES: 2
  };

  gBoard = buildBoard();

  gBoard[2][2].isMine = true;
  gBoard[3][3].isMine = true;

  console.table(gBoard);

  setMinesNegsCount(gBoard);
  renderBoard(gBoard);
}

function disableMenuDisplay() {
  //   document.oncontextmenu = function (e) {
  //     var evt = new Object({ keyCode: 93 });
  //     e.preventDefault();
  //   };
}
function buildBoard() {
  var board = [];
  var currCell;
  var cell = {
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isMarked: false
  };
  for (var i = 0; i < 5; i++) {
    board[i] = [];
    for (var j = 0; j < 5; j++) {
      // currCell = mat[i][j];
      board[i].push({
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
      });
    }
  }
  return board;
}

function helpFunction() {
  var currCell;
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      currCell = gBoard[i][j];
      console.log(currCell);
    }
  }
}
function setMinesNegsCount(board) {
  var currCell;
  var currMines;
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      currCell = gBoard[i][j];

      var location = {
        i: i,
        j: j
      };

      //   console.log("cell", "i", i, "j", j);
      currMines = countCellNegs(currCell, location);
      gBoard[i][j].minesAroundCount = currMines;
      //   console.log("mines = " ,currMines);
    }
  }
}

function countCellNegs(cell, location) {
  var currCell;
  var mineCouner = 0;
  //goes 3X3 matrix of the center cell
  for (var i = location.i - 1; i <= location.i + 1; i++) {
    for (var j = location.j - 1; j <= location.j + 1; j++) {
      //ignore cells that are out of the bounderies
      if (i < 0 || j < 0 || i >= gBoard.length || j >= gBoard[0].length)
        continue;

      //if it's the same cell (center) continue
      if (i === location.i && j === location.j) continue;

      currCell = gBoard[i][j];
      if (currCell.isMine) mineCouner++;

      //console.log(currCell.isMine);
    }
  }
  return mineCouner;
}

function renderBoard(board) {
  var lineStr = "";
  var currCell;
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      currCell = gBoard[i][j];
      //   console.log(currCell.minesAroundCount)

      lineStr += "" + currCell.minesAroundCount + "   ";
    }
    console.log(lineStr);
    lineStr = "";
  }

  var htmlStr = "";
  var currMines;
  htmlStr += "<table>";
  for (var i = 0; i < board.length; i++) {
    htmlStr += "<tr>";
    for (var j = 0; j < board.length; j++) {
      currCell = gBoard[i][j];

      currMines = currCell.minesAroundCount;
      htmlStr += renderCell(currCell, i, j);
    }
    htmlStr += "</tr>";
  }
  htmlStr += "</table>";
  //   console.log(htmlStr);
  var gameContainerEl = document.querySelector(".gameContainer");
  gameContainerEl.innerHTML = htmlStr;
}

function cellClicked(elCell, i, j) {
  console.log("clicked", i, j);
  var currCell = gBoard[i][j];

  if (currCell.isShown) return;
  if (currCell.isMine) {
    gameOver("game over: you hit a mine");
    return;
  }

  if (currCell.minesAroundCount === 0) {
    expandShown(gBoard, elCell, i, j);
  } else {
    revealOneCell(elCell, i, j);
  }

  renderBoard(gBoard);
}

function revealOneCell(elCell, i, j) {
  var currCell = gBoard[i][j];
  currCell.isShown = true;

  console.log("reveal only one cell");
}

function gameOver(msg) {
  console.log(msg);
}
function cellMarked(elCell, i, j) {
  var currCell = gBoard[i][j];
  if (currCell.isShown) return;

  currCell.isMarked = !currCell.isMarked;
  console.log("marked cell action", i, j, currCell.isMarked);
  return false;
  e.preventDefault();
}

function eventcellMarkedFunc(event) {
  if (event.which === 3) {
    console.log("this is a right click");
    var currObj = event.target;
    console.log("dataset ", "i", currObj.dataset.i, "j", currObj.dataset.j);
    cellMarked(currObj, currObj.dataset.i, currObj.dataset.j);

    event.preventDefault();
  }
}

function checkGameOver() {
  var currCell;
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      currCell = gBoard[i][j];

      if (!currCell.isShown) return false;

      if (currCell.isMine === true && !currCell.isMarked) return false;
      console.log(currCell);
    }
  }
  return true;
}

//if mindesAroundCount ===0 , set isShown true to all cells near him
function expandShown(board, elCell, i, j) {
  console.log("empty cell, reveal all serroundings");
  //if it's not empty cell, return
  if (board[i][j].minesAroundCount !== 0) {
    return;
  }

  //helper object
  var location = { i: i, j: j };

  //goes 3X3 matrix of the center cell
  for (var iIdx = location.i - 1; iIdx <= location.i + 1; iIdx++) {
    for (var jIdx = location.j - 1; jIdx <= location.j + 1; jIdx++) {
      //ignore cells that are out of the bounderies
      if (
        iIdx < 0 ||
        jIdx < 0 ||
        iIdx >= gBoard.length ||
        jIdx >= gBoard[0].length
      )
        continue;

      console.log("reveal", "i", iIdx, "j", jIdx);

      gBoard[iIdx][jIdx].isShown = true;
    }
  }
}

function expandShownREGULAR(board, elCell, i, j) {
  var currCell = board[i][j];
  var mineCouner = 0;

  var location = { i: i, j: j };
  //goes 3X3 matrix of the center cell
  for (var iIdx = location.i - 1; iIdx <= location.i + 1; iIdx++) {
    for (var jIdx = location.j - 1; jIdx <= location.j + 1; jIdx++) {
      //ignore cells that are out of the bounderies
      if (
        iIdx < 0 ||
        jIdx < 0 ||
        iIdx >= gBoard.length ||
        jIdx >= gBoard[0].length
      )
        continue;

      //if it's the same cell (center) continue
      if (iIdx === location.i && jIdx === location.j) continue;

      currCell = gBoard[iIdx][jIdx];
      console.log("check", "i", iIdx, "j", jIdx);
      if (currCell.isMine) {
        console.log("ismine!", "i", iIdx, "j", jIdx);
        mineCouner++;
      }
    }
  }
}

function renderCell(cell, i, j) {
  var elmToPresent = EMPTY;

  //if hidden , return cell with nothing inside
  if (!cell.isShown)
    return `<td class="mine" onclick="cellClicked(this,${i},${j})" onmousedown="eventcellMarkedFunc(event)" data-i="${i}" data-j="${j}"></td>`;

  // //if NOT hidden, can be mine,flag,empty,number
  // switch (elmToPresent) {
  //     case :
  // }

  if (cell.isShown) {
    console.log("cell shown!", i, j);
    return `<td class="mine"         onclick="cellClicked(this,${i},${j})" onmousedown="eventcellMarkedFunc(event)" data-i="${i}" data-j="${j}">${cell.minesAroundCount}</td>`;
  }
}
