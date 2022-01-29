"use strict";
const EMPTY = " ";
const MARK = "🚩";
// const MINE = "💣";
const MINE = `<div class="mineDiv"><img class="mineBomb" src="img/mine.png" /></div>`;
console.log("test");

var gTimerID = null;
var gHintMode = false;
var gHintCellTryCount = 0;
var gTimer = null;
var gFirstClick = 0;
var gBoard = [];
var gLives = [];
var gBestScore;
var gSafeCount
var gSevenBoomStatus = false;
var gManualGamePutMines = false
var gManualGame = false;

var gActions = [];
var gLevel = {
  SIZE: 5,
  MINES: 3
};
var gGame = {
  isOn: true,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0
};



function initGame() {
  console.log("game loaded");
  disableMenuDisplay();
  gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
  };
  if (gSevenBoomStatus !== true) {
    gFirstClick = 0;
  }

  gLives = 3;
  gTimer = null;
  gTimerID = null;
  gSafeCount = 3;
  updateSmiley("happy");

  updateLivesCounter();
  gActions = [];
  if (gManualGame !== true) {
  gBoard = buildBoard();
}
  // updateTimerEl(0)
  // console.table(gBoard);

  renderBoard(gBoard);
  updateScoreEl();
}

function sevenBoomMode() {
  gSevenBoomStatus = !gSevenBoomStatus;

  if (gSevenBoomStatus) {
    gSevenBoomStatus = true;
    gFirstClick = 1;

    initGame();
    putMinesSevenBoom(gBoard);
    setMinesNegsCount(gBoard);
  } else {
    gSevenBoomStatus = false;
  }
  console.log("seven boom mode clicked!");
  toggleSevenBoomEl();
}
function setBoardLevel(size, mines) {
  gLevel = {
    SIZE: size,
    MINES: mines
  };

  initGame();

  console.log(
    "set board size to",
    size,
    " * ",
    size,
    " with ",
    mines,
    " mines"
  );
}

function toggleSevenBoomEl() {
  var sevenBoomButton = document.querySelector(".sevenBoomButton");
  var buttonText;
  if (gSevenBoomStatus) buttonText = "SevenBoom on";
  else buttonText = "SevenBoom off";

  console.log(buttonText);
  sevenBoomButton.innerText = buttonText;
  console.log("seven boom status is", gSevenBoomStatus);
}

function pushAction(action,i,j,cellEl) {

  var actionHelp = {
    action: action,
    i: i,
    j: j,
    cellEl:cellEl,
  }
  gActions.push(actionHelp);

}

function undoLastAction() {

  if (gActions.length === 0) return

  var lastAction = gActions.pop();
  var currCellEl;
  var currI;
  var currJ;
  var currCell;
  if (lastAction.action === 'press') {

    currI = lastAction.i;
    currJ = lastAction.j;
    // currCellEl = getCellElByLocation({currI,currJ})

    currCellEl = lastAction.cellEl;

    console.log(currCellEl);
    if (currCellEl === null) return
    
    
    currCell = gBoard[currI][currJ];

    currCell.isShown = false;

    if (currCell.isMine) gLives++;

    renderCellbyElm(currCellEl,currI,currJ)
  }

}

function putMinesSevenBoom(board) {
  var currShuffledCell;
  var mineI;
  var mineJ;
  var counter = 0;
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      if (counter % 7 === 0) {
        gBoard[i][j].isMine = true;
      }
      counter++;
    }
  }
}

function putMines(board, PosNotToPlace) {
  var shuffledCells = randomMatCells(board);
  // console.log({ shuffledCells });
  var currShuffledCell;
  var mineI;
  var mineJ;
  for (var i = 0; i < gLevel.MINES; i++) {
    // console.log("pop", i);

    //get out a cell
    currShuffledCell = shuffledCells.pop();

    // console.log({ currShuffledCell });

    //set the x y
    mineI = currShuffledCell.i;
    mineJ = currShuffledCell.j;

    //check if the place where we want to put mine is the place
    //of the first click position, if yes, we iterate again
    if (PosNotToPlace.i === mineI && PosNotToPlace.j === mineJ) {
      // console.log("found pos, will not put mine here", PosNotToPlace);
      continue;
    }

    //put mine
    gBoard[mineI][mineJ].isMine = true;
    // }
  }
}

function isBestScoreUpdated() {
  var bestScore = parseInt(getBestScore());

  var timerEl = document.querySelector(".timer");

  var playerScore = parseInt(timerEl.innerText);

  console.log("bestScore playerScore ", bestScore, playerScore);
  if (playerScore === 0) return false;

  if (bestScore < playerScore) return false;

  console.log("found better (smaller) score than ", bestScore);
  console.log("found!!", playerScore);

  alert("You set a record for this level! :)");
  setBestScore(playerScore);
  updateScoreEl();
}

function hintPressed(hintEl) {
  if (!gGame.isOn) return;
  if (gFirstClick === 0) return;

  gHintCellTryCount = 0;
  gHintMode = true;

  hintEl.src = 'img/bulb-off.png'
  console.log(
    "hint mode on, your next move on unrevealed cell will show the content of the cells next to him"
  );
}
function setBestScore(score) {
  console.log("score=", score);
  const scoreObj = {
    best: score
  };
  console.log("scoreObj", scoreObj);
  console.log("gLevel.SIZE", gLevel.SIZE);
  window.localStorage.setItem("Level" + gLevel.SIZE, JSON.stringify(scoreObj));
}
function updateScoreEl() {
  var scoreEl = document.querySelector(".bestScore")

  var bestScore = getBestScore();
  if (!bestScore) return;
  scoreEl.innerText = "Best Score for Level " + gLevel.SIZE + " is " + bestScore;
}
function getBestScore() {
  var level = gLevel.SIZE;
  var bestScore;
  var parsedObj;
  //stringified object
  var storedLevel = window.localStorage.getItem("Level" + level);
  // console.log("storedLevel", storedLevel);
  if (storedLevel) {
    //make it object from stringify
    parsedObj = JSON.parse(storedLevel);

    // console.log("parsedObj", parsedObj);

    bestScore = parsedObj.best;
    // console.log("bestScore", bestScore);
    return bestScore;
  }

  return null;
}

function startTimer() {
  if (gTimerID !== null) return;
  console.log("timer is not set, this is the first time");
  gTimer = 0;
  gTimerID = setInterval(updateTimerEl, 1000);
}

function stopTimer() {
  clearInterval(gTimerID);
}

function updateTimerEl(time) {
  var timerEl = document.querySelector(".timer");
  if (!time) {
    gTimer += 1;
  }

  if (time === 0) {
    console.log("inside timer 2");
    gTimer = 0;
  }

  timerEl.innerText = gTimer;
}

function disableMenuDisplay() {
  document.oncontextmenu = function (e) {
    var evt = new Object({ keyCode: 93 });
    e.preventDefault();
  };
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
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = [];
    for (var j = 0; j < gLevel.SIZE; j++) {
      // currCell = mat[i][j];
      // console.log("i j ", i, j);
      board[i].push({
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
      });
    }
  }
  // console.log("board.length", board.length);
  return board;
}

function randomMatCells(board) {
  var allCells = [];
  var shuffledCells = [];
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      allCells.push({
        i: i,
        j: j
      });
    }
  }

  shuffledCells = shuffleArray(allCells);

  return shuffledCells;
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

function updateSmiley(mood) {
  var smileyStatusEl = document.querySelector(".smileyStatus");

  // console.log(`img/${mood}.png`);
  smileyStatusEl.src = `img/${mood}.png`;
}
//in the end, to show win (including bombs)
function setAllCellsToShown(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      board[i][j].isMarked = false;
      board[i][j].isShown = true;
    }
  }
  renderBoard(board);
}
function renderBoard(board) {
  var lineStr = "";
  var currCell;
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      currCell = gBoard[i][j];
      //   console.log(currCell.minesAroundCount)

      lineStr += "" + currCell.minesAroundCount + "   ";
    }
    // console.log(lineStr);
    lineStr = "";
  }

  var htmlStr = "";
  var currMines;
  htmlStr += "<table>";
  for (var i = 0; i < board.length; i++) {
    htmlStr += "<tr>";
    for (var j = 0; j < board[0].length; j++) {
      currCell = gBoard[i][j];

      currMines = currCell.minesAroundCount;
      htmlStr += getCellHtmlBySymbol(i, j);
    }
    htmlStr += "</tr>";
  }
  htmlStr += "</table>";
  //   console.log(htmlStr);
  var gameContainerEl = document.querySelector(".gameContainer");
  gameContainerEl.innerHTML = htmlStr;
}

//render only one cell using HTML Element
function renderCellbyElm(cellEl, i, j) {
  var elmToPresentHtmlStr;

  elmToPresentHtmlStr = getCellHtmlBySymbol(i, j);
  //   console.log({ elmToPresent });

  cellEl.innerHTML = elmToPresentHtmlStr;
}

//return html string for Rendertable and Rendercell by symbol of model
function getCellHtmlBySymbol(i, j) {
  var elmToPresent;

  elmToPresent = getCellSymbol(i, j);
  //   console.log({ elmToPresent });
  return `<td class="cell" id="${i},${j}" onclick="cellClicked(this,${i},${j})" onmousedown="eventCellMarkedFunc(event)" data-i="${i}" data-j="${j}">${elmToPresent}</td>`;
}

//return which symbol is on top, by order
//first mark should be shown
//then isshown=true
//then mine
//then number
//then empty
function getCellSymbol(i, j) {
  var currCell = gBoard[i][j];

  // console.log("currCell.isShown",currCell.isShown)

  //if gHintMode true we must show him anyway by his type
  if (currCell.isMarked && !gHintMode) return MARK;

  if (!currCell.isShown) return "";

  if (currCell.isMine) return MINE;

  if (!isNaN(currCell.minesAroundCount)) return currCell.minesAroundCount;
}

function toggleHintCells(i, j) {
  var currentLocation;
  var currCellEl;
  var marked;
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

      console.log("bla");
      currentLocation = { i: iIdx, j: jIdx };
      currCellEl = getCellElByLocation(currentLocation);

      if (currCellEl) {
        if (gBoard[iIdx][jIdx].isShown === false) {
          //reveal cell for 1 sec
          console.log("reveal only one cell ", iIdx, jIdx);
          var currCell = gBoard[iIdx][jIdx];

          currCell.isShown = true;

          renderCellbyElm(currCellEl, iIdx, jIdx);

          //timer to hide the cell again , after 1 sec
          if (currCell.isMarked) hideCellOneSec(currCellEl, iIdx, jIdx, marked);
          else hideCellOneSec(currCellEl, iIdx, jIdx, marked);
        }
      }
    }
  }
}

//timer to hide the cell again , after 1 sec (and keep it's marked status)
function hideCellOneSec(currCellEl, i, j, marked) {
  setTimeout(function () {
    console.log("test");
    console.log("hide only one cell ", i, j);
    var currCell = gBoard[i][j];

    currCell.isShown = false;

    currCell.isMark = marked;

    renderCellbyElm(currCellEl, i, j);
  }, 1000);
}

function safeClick(buttonEl) {
  if (!gGame.isOn) return;
  if (gFirstClick === 0) return;
  if (gSafeCount === 0) return

  
  var location = getRandSafeClickCell();
  var cellEl;
  if (location === null){
    console.log("no more uncovered cells that are not mines")
    return;
  } 
  cellEl = getCellElByLocation(location);

  if (cellEl === null) return;
  cellEl.classList.toggle("marked");

  gSafeCount--;

  setTimeout(function () {
    cellEl.classList.toggle("marked");
  }, 3000);
}

//return an cell with no mine in it , that you can click on
//does not return mine,marked or shown cell
//else return null

function getRandSafeClickCell() {
  var currCell = 0;

  var goodCells = [];
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {

      currCell = gBoard[i][j];

      if (currCell.isMine || currCell.isShown || currCell.isMark) continue;

      
      var location = { i: i, j: j };

      goodCells.push(location);
    }
  }
  goodCells = shuffleArray(goodCells)
  currCell = goodCells.pop()

  return currCell
}
function setMinesManual(buttonEl) {
  gManualGamePutMines = true;
  initGame();
  gBoard = buildBoard();
  gManualGame = true;
  
}
function playManualGame(buttonEl) {
  gManualGamePutMines = false;
  setMinesNegsCount(gBoard);
  gFirstClick = 1;
}
function cellClicked(elCell, i, j) {
  if (!gGame.isOn) return;
  console.log("clicked", i, j);
  var currCell = gBoard[i][j];


  if (gManualGame === true && gManualGamePutMines === true) {
    currCell.isMine = true;
    return
  }
  if (gFirstClick === 0 && gManualGame === false) {
    startTimer();
    var PosNotToPlace;
    console.log("first click");
    //where not to put mine, becuase it's the first click
    PosNotToPlace = { i: i, j: j };

    gFirstClick = 1;
    putMines(gBoard, PosNotToPlace);
    setMinesNegsCount(gBoard);
  }

  if (gHintMode && gHintCellTryCount === 0) {
    gHintCellTryCount++;
    toggleHintCells(i, j);
    gHintMode = false;
    return;
  }
  if (currCell.isMarked) {
    cellMarked(elCell, i, j);
    return;
  }
  if (currCell.isShown) {
    console.log("already shown!");
    return;
  }
  if (currCell.isMine) {
    if (gLives === 0) {
      gameOver("no more lives, game over!");
      updateSmiley("mad");
      return;
    }
    console.log({ gLives });
    gLives--;
    updateLivesCounter();
    revealOneCell(elCell, i, j)
    // renderCellbyElm(elCell, i, j);
    console.log("you hit a mine ,only ", gLives, " lives left");

    if (checkGameOver()) {
      goodGameOver();
    }
    return;
  }

  //if mines = 0
  if (currCell.minesAroundCount === 0) {
    console.log("expand cell!!");
    expandShown(gBoard, elCell, i, j);
  }
  //if mines > 0
  revealOneCell(elCell, i, j);

  if (checkGameOver()) {
    goodGameOver();
  }
}

function hideOneCell(elCell, i, j) {
  var currCell = gBoard[i][j];

  currCell.isShown = false;

  renderCellbyElm(elCell, i, j);
  console.log("hide only one cell");
}
function updateLivesCounter() {
  var liveCounterEl = document.querySelector(".liveCounter");
  var counter = 0;
  for (var i = 0; i < gLives; i++) {
    counter++;
  }
  liveCounterEl.innerText = counter;
  return counter;
}
function revealOneCell(elCell, i, j) {
  var currCell = gBoard[i][j];

  currCell.isShown = true;

  renderCellbyElm(elCell, i, j);
  console.log("reveal only one cell");

  pushAction("press",i,j,elCell)
}

function gameOver(msg) {
  gGame.isOn = false;
  stopTimer();

  setAllCellsToShown(gBoard);
  console.log(msg);
  setGameMassage(msg);
}


// function copyMat(source,target) {
//   var mat = [];

//   for(var i=0;i<source.length;i++) {
//     mat[i].push([])

//     for (var j=0;j<)
//   }
// }

function cellMarked(elCell, i, j) {
  if (gFirstClick === 0) return;

  if (!gGame.isOn) return;

  var currCell = gBoard[i][j];

  if (currCell.isShown) return;

  currCell.isMarked = !currCell.isMarked;
  console.log("marked cell action", i, j, currCell.isMarked);

  renderCellbyElm(elCell, i, j);
  if (checkGameOver()) {
    goodGameOver();
  }
}

function goodGameOver() {
  updateSmiley("won");
  if (isBestScoreUpdated()) {
    alert(
      "you have the best score! we put you in the hall of fame for this level"
    );
    console.log(
      "you have the best score! we put you in the hall of fame for this level"
    );
  }
  gameOver("you won!");
}

//check if right mouse is clicked and call "cellmarked"
function eventCellMarkedFunc(event) {
  if (!gGame.isOn) return;
  if (gFirstClick === 0) {
    startTimer();
    return;
  }
  if (event.which === 3) {
    var currObj = event.target;
    // console.log("dataset ", "i", currObj.dataset.i, "j", currObj.dataset.j);

    var i = currObj.dataset.i;
    var j = currObj.dataset.j;
    cellMarked(currObj, i, j);

    event.preventDefault();
  }
}

function checkGameOver() {
  var currCell;
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      currCell = gBoard[i][j];

      if (!currCell.isShown && !currCell.isMine) return false;

      if (!currCell.isShown && currCell.isMine && !currCell.isMarked)
        return false;

      //   if (currCell.isMine === true && !currCell.isMarked) return false;
      //   console.log(currCell);
    }
  }
  return true;
}

//if mindesAroundCount ===0 , set isShown true to all cells near him
function expandShownOLDGOOD(board, elCell, i, j) {
  console.log("empty cell, reveal all serroundings");
  var currentLocation;
  var currCellEl;
  //if it's not empty cell, return
  if (board[i][j].minesAroundCount !== 0) {
    console.log("there are bombs around him");
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

      console.log("------reveal", "i", iIdx, "j", jIdx);

      currentLocation = { i: iIdx, j: jIdx };
      currCellEl = getCellElByLocation(currentLocation);

      if (currCellEl) {
        console.log(currCellEl);
        revealOneCell(currCellEl, iIdx, jIdx);
      }
      // gBoard[iIdx][jIdx].isShown = true;
      // console.log("shown=",gBoard[iIdx][jIdx].isShown)
      // console.log(elCell)
      // renderCellbyElm(elCell,iIdx, jIdx);
    }
  }
}

function expandShown(board, elCell, i, j) {
  console.log("empty cell, reveal all serroundings");
  var currentLocation;
  var currCellEl;
  //if it's not empty cell, return
  if (board[i][j].minesAroundCount !== 0) {
    console.log("there are bombs around him");
    return;
  }

  //make the main cell shown an show him
  board[i][j].isShown = true;
  revealOneCell(elCell, i, j);

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

      console.log("---reveal cell next to him", "i", iIdx, "j", jIdx);

      currentLocation = { i: iIdx, j: jIdx };
      currCellEl = getCellElByLocation(currentLocation);

      if (currCellEl) {
        //do again expandShown on the current cell if it is ZERO
        if (
          gBoard[iIdx][jIdx].minesAroundCount === 0 &&
          gBoard[iIdx][jIdx].isShown === false
        ) {
          //revealOneCell(currCellEl, iIdx, jIdx);
          //console.log("the cell next to him is 0 too and not shwon!...lets start expandShown on him",iIdx,jIdx)

          // renderBoard(gBoard)
          expandShown(board, currCellEl, iIdx, jIdx);
        } else {
          //reveal the current cell which is not ZERO, it's a regular number
          revealOneCell(currCellEl, iIdx, jIdx);
        }
      }
    }
  }
}

function getCellElByLocation(location) {
  var searchStr = "" + location.i + "," + location.j;

  // console.log("searchStr", searchStr);
  var targetCell = document.querySelector(`[id='${searchStr}']`);
  return targetCell;
}
function getCellByLocationOLD(location) {
  var cellElements = document.querySelectorAll(".cell");

  console.log("all found td=", cellElements.length);
  var currCellEl;

  console.log("looking for", location);
  for (var i = 0; i < cellElements.length; i++) {
    // if (confirm("bla")) {
    // } else {
    //   return;
    // }
    currCellEl = cellElements[i];
    console.log("current data set", currCellEl.dataset.i, currCellEl.dataset.j);

    //current i j from current cell element
    var iIdx = +currCellEl.dataset.i;
    var jIdx = +currCellEl.dataset.j;

    //console.log("current iIdx jIdx", iIdx, jIdx);

    if (iIdx === location.i && jIdx === location.j) {
      console.log("found");
      console.log(currCellEl);
      return currCellEl;
    }
  }
  console.log("not found element !");
  return null;
}

function setGameMassage(msg) {
  var massageEl = document.querySelector(".gameMassage");

  massageEl.innerText = msg;
}

function getRegularNumbersArray(num) {
  var numbers = [];
  for (var i = 1; i < num; i++) {
    numbers.push(i);
  }
  return numbers;
}

//return shuffled array
//V
function shuffleArray(arr) {
  var newArr = [];
  var randNum;
  var currValue;
  var oldLength = arr.length;
  for (var i = 0; i < oldLength; i++) {
    randNum = getRandomIntInclusive(0, arr.length - 1);
    currValue = arr[randNum];

    arr.splice(randNum, 1);
    newArr.push(currValue);
  }
  return newArr;
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}
