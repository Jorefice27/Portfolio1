function init()
{
	//probably make this [row][col] => [actual, [potential]]
	var sudoku = [[], [], [], [], [], [], [], [], []];
	generateSudoku(sudoku);
}

function generateSudoku(sudoku)
{
	
	initializeSudoku(sudoku);
	fillFirstGrid(sudoku);
	fillSecondGrid(sudoku);
	fillThirdGrid(sudoku);
	
	
	console.log(sudoku);
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
			updateSudoku(sudoku, i, j, vals[index]);
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
			updateSudoku(sudoku, i, j, val);
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
			updateSudoku(sudoku, i, j, val);
		}
	}
}


//Cell object to represent each cell in the Sudoku board
function cell(value, input, options)
{
	this.val = value;
	this.input = input;
	this.options = options;
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

function updateSudoku(sudoku, row, col, val)
{
	updateRow(sudoku, row, val);
	updateCol(sudoku, col, val);
	updateGrid(sudoku, row, col, val);
}

function updateRow(sudoku, row, val)
{
	for(var i = 0; i < 9; i++)
	{
		// if(sudoku[row][i] == val)
		// {
		// 	return false;
		// }
		removeValue(sudoku[row][i].options, val);
	}

	return true;
}

function updateCol(sudoku, col, val)
{
	for(var i = 0; i < 9; i++)
	{
		// if(sudoku[i][col] == val)
		// {
		// 	return false;
		// }
		removeValue(sudoku[i][col].options, val);
	}

	return true;
}

function updateGrid(sudoku, row, col, val)
{
	//sorry for this but I just didn't want like 20 lines to set 2 variables
	var r = (row < 3)? 0 : (row < 6)? 3 : 6;
	var c = (col < 3)? 0 : (col < 6)? 3 : 6;

	for(var i = 0; i < 3; i++)
	{
		for(var j = 0; j < 3; j++)
		{
			// if(sudoku[i][j] == val)
			// {
			// 	return false;
			// }
			removeValue(sudoku[i][j].options, val);
		}
	}
	return true;
}