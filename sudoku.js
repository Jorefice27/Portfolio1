function init()
{
	//probably make this [row][col] => [actual, [potential]]
	var sudoku = [[], [], [], [], [], [], [], [], []];
	generateSudoku(sudoku);
}

function generateSudoku(sudoku)
{
	console.log('starting');
	var difficulty = localStorage.getItem("difficulty");
	initializeSudoku(sudoku);
	fillFirstGrid(sudoku);
	fillSecondGrid(sudoku);
	fillThirdGrid(sudoku);
	fillFirstCol(sudoku);
	console.log('backtracking...');
	var sudokus = [];
	backtrack(sudoku, sudokus);//, 3, 1);
	sudoku = sudokus[0];
	var solution = copy(sudoku);
	console.log("________________________________Solution__________________________________________");
	printSudoku(solution)
	makeUniquePuzzle(sudoku, difficulty);
	printSudoku(sudoku);
}

function initializeSudoku(sudoku)
{
	// var vals = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	for(var i = 0; i < 9; i++)
	{
		for(var j = 0; j < 9; j++)
		{
			sudoku[i][j] = new cell(null, null, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
		}
	}
}


function fillFirstGrid(sudoku)
{
	var vals = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	var i, j;
	for(i = 0; i < 3; i++)
	{
		for(j = 0; j < 3; j++)
		{
			var index = randomInt(vals.length - 1);
			//spacing because the chrome debug thing is stupid

			sudoku[i][j].val = vals[index];
			//will actually have to update the constraints for every cell after each new one is added
			//probably change check row/col/grid to update and then since we'll only be pulling
			//values from options we shouldn't have to check if it's valid or not
			// removeValue(sudoku[i][j+3].options, vals[index])
			updateSudoku(sudoku, i, j, vals[index], true);
			remove(vals, index);
		}
	}
}

//Apparently we COULD have already fucked up here so check that we actually have 3 values for the last row
//before adding something
function fillSecondGrid(sudoku)
{
	for(var i = 0; i < 3; i++)
	{
		for(var j = 3; j < 6; j++)
		{
			var options = sudoku[i][j].options;
			var val = options[randomInt(options.length - 1)];
			sudoku[i][j].val = val;
			updateSudoku(sudoku, i, j, val, true);
			var temp = sudoku[2][3];
			if(i < 2 && sudoku[2][3].options.length < 3)
			{
				console.log("fixed a thing?");
				sudoku[i][j].val = null;
				updateSudoku(sudoku, i, j, val, false);
				removeValue(sudoku[i][j].options, val);
				j--;
			}
		}
	}
}

//which apparently I did fuck up cuz I only filled 26/27 cells when I ran it
function fillThirdGrid(sudoku)
{
	for(var i = 0; i < 3; i++)
	{
		for(var j = 6; j < 9; j++)
		{
			var options = sudoku[i][j].options;
			var val = options[randomInt(options.length - 1)];
			sudoku[i][j].val = val;
			updateSudoku(sudoku, i, j, val, true);
		}
	}
}

function fillFirstCol(sudoku)
{
	for(var i = 3; i < 9; i++)
	{
		sudoku[i][0].val = sudoku[i][0].options[randomInt(8-i)];
		updateSudoku(sudoku, i, 0, sudoku[i][0].val, true);
	}
}

//Instead of going top to bottom, find the element with the fewest optinos and fill that in
function backtrack(sudoku, list, print)
{
	if(print)
	{
		printSudoku(sudoku);
	}
	if(list.length > 1)
	{
		return list;
	}
	var cell = findCell(sudoku)
	var row = cell[0];
	var col = cell[1];
	if(row == null)
	{
		list.push(sudoku);
		return list;
	}
	else
	{
		var options = sudoku[row][col].options;
		var origOptions = [];
		for(var i = 0; i < options.length; i++)
		{
			origOptions[i] = options[i];
		}
		for(var i = 0; i < options.length; i++)
		{
			//get all the possible options for this cell
			val = sudoku[row][col].options[randomInt(options.length - 1)];
			sudoku[row][col].val = val;
			// printSudoku(sudoku);
			//update the options for other cells
			updateSudoku(sudoku, row, col, val, true);
			//check that we have at least one options for all other cells
			if(validateSudoku(sudoku))
			{
				// printSudoku(sudoku);
				list = backtrack(copy(sudoku), list, print);
			}
			else
			{
				//if the sudoku wasn't validated or leads to an incomplete board later on, try the next value
				updateSudoku(sudoku, row, col, val, false);
				sudoku[row][col].val = null;
				removeValue(sudoku[row][col].options, val);
				removeValue(options, val);
			}
			sudoku[row][col].options = origOptions;
			options = origOptions;
		}

		// sudoku[row][col].options = origOptions;
	}
	return list;
}

function makeUniquePuzzle(sudoku, difficulty)
{
	var num = (difficulty == 'easy')? 30 : (difficulty == 'medium')? 40 : 55;
	var  i = 0;
	var cells = shuffledCells();
	while((i < num) && cells.length > 0)
	{
		var removed = false;
		printSudoku(sudoku);
		while(!removed && cells.length > 0)
		{
			var arr = [];
			//clear a pair of cells
			//randomly clear one cell
			// var row = randomInt(8);
			// var col = randomInt(8);
			var cell = cells.pop();
			var row = cell[0];
			var col = cell[1];
			var val = sudoku[row][col].val;

			arr.push([row, col, val]);
			sudoku[row][col].val = null;
			updateSudoku2(sudoku, row, col, val, false);
			valid = true;
		
			//if we have exactly one solution then we can take more cells away, otherwise we need to retry
			// printSudoku(cop);
			var cop = copy(sudoku);
			var results = backtrack(cop, [], false);
			if(results.length == 1)
			{
				i ++;
				removed = true;
			}
			else
			{
				sudoku[arr[0][0]][arr[0][1]].val = arr[0][2];
				// sudoku[arr[1][0]][arr[1][1]].val = arr[1][2];
			}
		}	
	}
	console.log('________________________________Final Sudoku__________________________________________')
	printSudoku(sudoku);
}

function findCell(sudoku)
{
	var min = 10;
	var row = null, col = null;

	for(var i = 0; i < 9; i++)
	{
		for(var j = 0; j < 9; j++)
		{
			if(sudoku[i][j].val == null)
			{
				var options = sudoku[i][j].options;
				if(options.length < min && options.length > 0)
				{
					min = options.length;
					row = i;
					col = j;
				}
			}
		}
	}

	return [row, col];
}

//Cell object to represent each cell in the Sudoku board
function cell(value, input, options)
{
	this.val = value;
	this.input = input;
	this.options = options;
}

function contains(array, val)
{
	for(var i = 0; i < array.length; i++)
	{
		if(array[i] == val)
		{
			return true;
		}
	}

	return false;
}

function shuffledCells()
{
	//create an array with all 81 cell positions
	var positions = [];
	for(var i = 0; i < 9; i++)
	{
		for(var j  = 0; j < 9; j++)
		{
			positions.push([i, j]);
		}
	}
	//shuffle the array
	var shuff = [];
	for(var i = 0; i < 81; i++)
	{
		var index = randomInt(positions.length - 1);
		shuff.push(positions[index]);
		remove(positions, index);
	}
	return shuff;
}

function remove(array, index)
{
	if(index < array.length && index >= 0)
	{
		array.splice(index, 1);
	}
}

function removeValue(vals, value)
{
	for(var i = 0; i < vals.length; i++)
	{
		if(vals[i] == value)
		{
			vals.splice(i, 1);
			return vals;
		}
	}
}

//Returns a random number [0, max], inclusive
function randomInt(max)
{
	return Math.floor(Math.random() * (max + 1));
}

function updateSudoku(sudoku, row, col, val, adding)
{
	updateRow(sudoku, row, val, adding);
	updateCol(sudoku, col, val, adding);
	updateGrid(sudoku, row, col, val, adding);
}

function updateRow(sudoku, row, val, adding)
{
	for(var i = 0; i < 9; i++)
	{
		if(adding)
		{
			removeValue(sudoku[row][i].options, val);
		}
		else if(!contains(sudoku[row][i].options, val))
		{
			sudoku[row][i].options.push(val);
		}
	}

	return true;
}

function updateCol(sudoku, col, val, adding)
{
	for(var i = 0; i < 9; i++)
	{
		if(adding)
		{
			removeValue(sudoku[i][col].options, val);
		}
		else if(!contains(sudoku[i][col].options, val))
		{
			sudoku[i][col].options.push(val);
		}
	}

	return true;
}

function updateGrid(sudoku, row, col, val, adding)
{
	//sorry for this but I just didn't want like 20 lines to set 2 variables
	var r = (row < 3)? 0 : (row < 6)? 3 : 6;
	var c = (col < 3)? 0 : (col < 6)? 3 : 6;

	for(var i = 0; i < 3; i++)
	{
		for(var j = 0; j < 3; j++)
		{
			if(adding)
			{
				removeValue(sudoku[r+i][c+j].options, val);
			}
			else if(!contains(sudoku[r+i][c+j].options, val))
			{
				sudoku[r+i][c+j].options.push(val);
			}
		}
	}
	return true;
}

function updateSudoku2(sudoku, row, col, val)
{
	printSudoku(sudoku);
	updateRow2(sudoku, row, val);
	updateCol2(sudoku, col, val);
	updateGrid2(sudoku, row, col, val);
}

function updateRow2(sudoku, row, val)
{
	for(var i = 0; i < 9; i++)
	{
		if(checkSudoku(sudoku, row, i, val) && !contains(sudoku[row][i].options, val))
		{
			sudoku[row][i].options.push(val);	
		}
	}

	return true;
}

function updateCol2(sudoku, col, val)
{
	for(var i = 0; i < 9; i++)
	{
		if(checkSudoku(sudoku, i, col, val) && !contains(sudoku[i][col].options, val))
		{
			sudoku[i][col].options.push(val);
		}
	}

	return true;
}

function updateGrid2(sudoku, row, col, val)
{
	//sorry for this but I just didn't want like 20 lines to set 2 variables
	var r = (row < 3)? 0 : (row < 6)? 3 : 6;
	var c = (col < 3)? 0 : (col < 6)? 3 : 6;

	for(var i = 0; i < 3; i++)
	{
		for(var j = 0; j < 3; j++)
		{
			if(checkSudoku(sudoku, r+i, c+j, val) && !contains(sudoku[r+i][c+j].options, val))
			{
				sudoku[r+i][c+j].options.push(val);
			}
		}
	}

	return true;
}

function checkSudoku(sudoku, row, col, val)
{
	return (checkRow(sudoku, row, val) && checkCol(sudoku, col, val) && checkGrid(sudoku, row, col, val));
}

function checkRow(sudoku, row, val)
{
	for(var i = 0; i < 9; i++)
	{
		if(sudoku[row][i].val == val)
		{
			return false;
		}
	}

	return true;
}

function checkCol(sudoku, col, val)
{
	for(var i = 0; i < 9; i++)
	{
		if(sudoku[i][col].val == val)
		{
			return false;
		}
	}

	return true;
}

function checkGrid(sudoku, row, col, val)
{
	//sorry for this but I just didn't want like 20 lines to set 2 variables
	var r = (row < 3)? 0 : (row < 6)? 3 : 6;
	var c = (col < 3)? 0 : (col < 6)? 3 : 6;

	for(var i = 0; i < 3; i++)
	{
		for(var j = 0; j < 3; j++)
		{
			if(sudoku[r+i][c+j].val == val)
			{
				return false;
			}
		}
	}
	return true;
}

function validateSudoku(sudoku)
{
	for(var i = 0; i < 9; i++)
	{
		for(var j = 0; j < 9; j++)
		{
			// var temp = sudoku[i][j];
			//if we don't already have a value in a location and we have no potential values there, we have na invalid board
			if(sudoku[i][j].val == null && sudoku[i][j].options.length == 0)
			{
				return false;
			}
		}
	}

	return true;
}

function printSudoku(sudoku)
{
	for(var i = 0; i < 9; i++)
	{
		var row = "";
		for(var j = 0; j < 9; j++)
		{
			var val = sudoku[i][j].val;
			if(val == undefined)
			{
				row += "_ ";
			}
			else
			{
				row += val.toString() + " ";
			}

			if(j % 3 == 2)
			{
				row += " | ";
			}
		}

		console.log(row);
		if(i % 3 == 2)
		{
			console.log("---------------------------");
		}
	}
	console.log(' ');
}

// function backtrack(sudoku)
// {

// 	var cell = findCell(sudoku)
// 	var row = cell[0];
// 	var col = cell[1];
// 	if(row == null)
// 	{
// 		return true;
// 	}
// 	// if(sudoku[row][col].val == null)
// 	else
// 	{
// 		var options = sudoku[row][col].options;
// 		var origOptions = [];
// 		for(var i = 0; i < options.length; i++)
// 		{
// 			origOptions[i] = options[i];
// 		}
// 		for(var i = 0; i < options.length; i++)
// 		{
// 			//get all the possible options for this cell
// 			val = sudoku[row][col].options[randomInt(options.length - 1)];
// 			sudoku[row][col].val = val;
// 			// printSudoku(sudoku);
// 			//update the options for other cells
// 			updateSudoku(sudoku, row, col, val, true);
// 			//check that we have at least one options for all other cells
// 			if(validateSudoku(sudoku))
// 			{
// 				//fill the next cell
// 				var ret = backtrack(sudoku)//, row, col+1);
// 				//if this returns true, then we successfully filled the board so we can return it
// 				if(ret)
// 				{
// 					return true;
// 				}
// 			}
// 			//if the sudoku wasn't validated or leads to an incomplete board later on, try the next value
// 			updateSudoku(sudoku, row, col, val, false);
// 			sudoku[row][col].val = null;
// 			removeValue(sudoku[row][col].options, val);
// 			removeValue(options, val);
// 		}

// 		sudoku[row][col].options = origOptions;
// 		return false;
// 	}
// }

function copy(sudoku)
{
	var copy = [[], [], [], [], [], [], [], [], []];
	for(var i = 0; i < 9; i++)
	{
		for(var j = 0; j < 9; j++)
		{
			copy[i][j] = new cell(null, null, []);
			copy[i][j].val = sudoku[i][j].val;
			var options = sudoku[i][j].options;
			for(var k = 0; k < options.length; k++)
			{
				copy[i][j].options.push(options[k]);
			}
		}
	}

	return copy;
}

function setDifficulty(sudoku)
{
	var difficulty = localStorage.getItem("difficulty");
	var num = (difficulty == 'easy')? 30 : (difficulty == 'medium')? 40 : 55;
	for(var i = 0; i < num; i++)
	{
		var set = false;
		while(!set)
		{
			var row = randomInt(8);
			var col = randomInt(8);
			if(sudoku[row][col].val != null)
			{
				updateSudoku(sudoku, row, col, sudoku[row][col], false);
				sudoku[row][col].val = null;
				set = true;
				printSudoku(sudoku);
			}	
		}
	}
	console.log("__________________________________" + difficulty + "________________________________________");
}

function addToSudoku(sudoku, row, col, val)
{
	if(sudoku[row][col].val != null)
	{
		updateSudoku(sudoku, row, col, sudoku[row][col].val, false);
		Sudoku[row][col] = null;
	}

	sudoku[row][col].val = val;
	updateSudoku(sudoku, row, col, val, true);
}

function findErrors(sudoku)
{
	var errors = [];
	for(var i = 0; i < 9; i++)
	{
		for(var j = 0; j < 9; j++)
		{

		}
	}
	console.log(errors);
}

function createHTMLForSudoku(){
  createHTMLForInputs();
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  ctx.lineWidth = 1;
  let x = 0;
  let y = 0;

  ctx.beginPath();
  //create vertical lines
  for(var i = 0; i < 9; i++){
    ctx.moveTo(x,y);
    ctx.lineTo(x,y+450);
    x += 50;
  }
  x = 0;
  //create horizontal lines
  for(var i = 0; i < 9; i++){
    ctx.moveTo(x,y);
    ctx.lineTo(x+450,y);
    y += 50;
  }
  ctx.stroke();
  x = 0;
  y = 0;
  ctx.lineWidth = 3;
  ctx.beginPath();
  //creates Darker lines
  ctx.moveTo(150,0);
  ctx.lineTo(150,450);
  ctx.moveTo(300,0);
  ctx.lineTo(300,450);
  ctx.moveTo(0,150);
  ctx.lineTo(450,150);
  ctx.moveTo(0,300);
  ctx.lineTo(450,300);

  ctx.stroke();
}

function createHTMLForInputs(){
  let row = 0;
  let col = 0;
  let left = 418;
  let top = 178;
  let s = "";

  for(let k = 0; k < 9; k++){
    for(let l = 0; l < 9; l++){
      s += "<input type=\"number\" style=\"position:absolute;left:" + left +"px;top:" + top + "px;width:25px; id=\"" + row + col + "/>";
      col++;
      left += 50;
    }
    row++;
    left = 418;
    col = 0;
    top += 50;
  }
  document.getElementById("sudoku").innerHTML += s;
}