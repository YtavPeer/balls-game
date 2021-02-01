'use strict';

const WALL = 'WALL';
const FLOOR = 'FLOOR';
const BALL = 'BALL';
const GAMER = 'GAMER';
const GLUE = 'GLUE';

const GAMER_IMG = '<img src="img/gamer.png" />';
const BALL_IMG = '<img src="img/ball.png" />';
const GLU_IMG = '<img src="img/candy.png" />';

var gBoard;
var gGamerPos;
var gBallCounter;
var ballInterval;
var glueInterval;

var gIsGluel;

//main func to restart all and init the global vars
function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);

	//init the interval for ball and glue 
	clearInterval(ballInterval);
	ballInterval = setInterval(addBall, 5000);
	clearInterval(glueInterval);
	glueInterval = setInterval(addGlue, 5000);

	//update the dom ball counter (model +dom);
	gIsGluel = false;
	gBallCounter = 0;
	var elspan = document.querySelector('.ballCollectCount');
	elspan.innerText = gBallCounter
}

//build the main model board for the game
function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)

	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
				//place floor for the secret passages 
				if ((i === 0 && j === 5) || (i === board.length - 1 && j === 5) ||
					(i === 5 && j === 0) || (i === 5 && j === board[0].length - 1)) {
					cell.type = FLOOR
				}
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;

	console.log(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			// TODO - change to short if statement
			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			//TODO - Change To template string
			strHTML += '\t<td class="cell ' + cellClass +
				'"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			// TODO - change to switch case statement
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}


	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {

	//handle the glue
	if (gIsGluel) return;


	//handle the secret passage
	if (i < 0) {
		i = gBoard.length - 1
	} else if (i > gBoard.length - 1) {
		i = 0
	} else if (j < 0) {
		j = gBoard[0].length - 1;
	} else if (j > gBoard[0].length - 1) {
		j = 0
	}

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

		//handle the glue
		if (targetCell.gameElement === GLUE) {
			gIsGluel = true;

			// //push the pop up 
			// var elDiv = document.querySelector('.popup');
			// elDiv.style.display = 'block';
			// //remove the table
			// var elTbody = document.querySelector('.board');
			// elTbody.style.display = 'none';

			//after 3 sec- put the table and remove the pop up
			setTimeout(function pauseGame() {
				// elDiv.style.display = 'none';
				// elTbody.style.display = 'block';
				gIsGluel = false;
			}, 3000)
		}
		//handle the ball
		if (targetCell.gameElement === BALL) {
			console.log('Collecting!')
			//play sound:
			ballCollectSound();
			//update the model:
			gBallCounter++;
			//update the dom:
			var elspan = document.querySelector('.ballCollectCount');
			elspan.innerText = gBallCounter

			//handle finish game if the user collect 10 balls
			if (gBallCounter === 10) {
				clearInterval(ballInterval);
				clearInterval(glueInterval);
				setTimeout(() => {
					alert('Well done- you collect all the balls, click restart')
				}, 500);
			}
		}
	}

	// MOVING from current position
	// Model:
	gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;

	// Dom:
	renderCell(gGamerPos, '');

	// MOVING to selected position
	// Model:
	gGamerPos.i = i;
	gGamerPos.j = j;
	gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
	// DOM:
	renderCell(gGamerPos, GAMER_IMG);

} // else console.log('TOO FAR', iAbsDiff, jAbsDiff);

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;

	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;

	}

}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

//function to add random glue - get random spot- update model and render the dom
function addGlue() {
	//get random pos for new glue: not include the edge
	var row = getRandomInt(1, 9)
	var col = getRandomInt(1, 11)
	// cheack if we have empty place and update the model:
	if (gBoard[row][col].gameElement === null) {
		gBoard[row][col].gameElement = GLUE;
	}
	//render the dom
	var locationObj = { i: row, j: col };
	renderCell(locationObj, GLU_IMG);

	//set time out to remove to curr glue after 3 sec
	setTimeout(removeGlue, 3000, row, col);
}

function removeGlue(row, col) {
	//update the model:
	gBoard[row][col].gameElement = null;
	//render the dom
	var locationObj = { i: row, j: col };
	renderCell(locationObj, '');

	//handle the gamer in same pos of glue- return the gamer to this pos;
	if (gBoard[gGamerPos.i][gGamerPos.j] === gBoard[row][col]) {
		renderCell(gGamerPos, GAMER_IMG);
	}
}

//update the model with random ball and render the dom
function addBall() {
	//get random pos for new ball: not include the edge
	var row = getRandomInt(1, 9)
	var col = getRandomInt(1, 11)
	// cheack if we have empty place and update the model:
	if (gBoard[row][col].gameElement === null) {
		gBoard[row][col].gameElement = BALL;
	}
	//render the dom
	var locationObj = { i: row, j: col };
	renderCell(locationObj, BALL_IMG);
}
