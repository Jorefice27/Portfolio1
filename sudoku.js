function init()
{
	//probably make this [row][col] => [actual, [potential]]
	createHTMLForSudoku();
	generateSudoku();
	getSolution();
}

//generates a complete sudoku which is stored in solution
//as well as an incomplete sudoku which uniquely solves to the solution, stored in sudoku
function generateSudoku(sudoku, solution)
{
	console.log('starting');
	var difficulty = localStorage.getItem("difficulty");
	var numHints = (difficulty == 'easy')? 5 : (difficulty == 'medium')? 3 : 0;
	localStorage.setItem('hint', numHints);
	var sudokus = [];
	while(sudokus.length == 0)
	{
		var sudoku = [[], [], [], [], [], [], [], [], []];
		var solution = [[], [], [], [], [], [], [], [], []];
		initializeSudoku(sudoku);
		fillTopBand(sudoku);
		backtrack(sudoku, sudokus);
	}
	sudoku = sudokus[0];
	solution = copy(sudoku);
	makeUniquePuzzle(sudoku, difficulty);
	localStorage.setItem('solution', JSON.stringify(solution));
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

//fills out the top 3 rows of the sudoku and the first column
function fillTopBand(sudoku)
{
	fillFirstGrid(sudoku);
	fillSecondGrid(sudoku);
	fillThirdGrid(sudoku);
	fillFirstCol(sudoku);
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
			//update the options for other cells
			updateSudoku(sudoku, row, col, val, true);
			//check that we have at least one options for all other cells
			if(validateSudoku(sudoku))
			{
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
		while(!removed && cells.length > 0)
		{
			var arr = [];
			//clear random cell
			var cell = cells.pop();
			var row = cell[0];
			var col = cell[1];
			var val = sudoku[row][col].val;

			arr.push([row, col, val]);
			sudoku[row][col].val = null;
			updateSudoku2(sudoku, row, col, val, false);
			valid = true;

			//if we have exactly one solution then we can take more cells away, otherwise we need to retry
			var cop = copy(sudoku);
			var results = backtrack(cop, [], false);
			if(results.length == 1)
			{
				i ++;
				removed = true;
			}
			else
			{
				sudoku[arr[0][0]][arr[0][1]].val = arr[0][2]; //clean this up
				// sudoku[arr[1][0]][arr[1][1]].val = arr[1][2];
			}
		}
	}
	console.log('________________________________Final Sudoku__________________________________________')
	printSudoku(sudoku);
  	addValuesToInputs(sudoku);
}

//finds the empty cell with the fewest number of possible values
//used to implement the min conflicts approach for the CSP
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

//returns true if val is found in the array, else false
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

//returns a shuffeled array of all possible cells ([0,0] through [8,8])
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

//removes the item at the given index from an array
function remove(array, index)
{
	if(index < array.length && index >= 0)
	{
		array.splice(index, 1);
	}
}

//searches vals for the given value and removes it if found
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

//updates the options for the row, column, and subgrid that [row][col] is found in
//if adding is true, we are adding a value to the board so each cell should lose an option
//if adding is false, we are removing a value from the board so each cell can now take on that value and it is added to options
function updateSudoku(sudoku, row, col, val, adding)
{
	updateRow(sudoku, row, val, adding);
	updateCol(sudoku, col, val, adding);
	updateGrid(sudoku, row, col, val, adding);
}

//updates the options in the row
//used for backtracking
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

//updates the options in the column
//used for backtracking
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

//updates the options for the subgrid
//used for backtracking
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

//updates the options for all cells in the same row, column, and subgrid as [row][col]
//slightly different from the above methods since this one is used to check for uniqueness rather than a solution
//used for backtracking
function updateSudoku2(sudoku, row, col, val)
{
	updateRow2(sudoku, row, val);
	updateCol2(sudoku, col, val);
	updateGrid2(sudoku, row, col, val);
}

//updates the options for the row
//used for backtracking
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

//updates the options in the column
//used for backtracking
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

//updates the options for the subgrid
//used for backtracking
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

//Checks if val is already found in the same row, column, or grid as [row][col]
function checkSudoku(sudoku, row, col, val)
{
	return (checkRow(sudoku, row, val) && checkCol(sudoku, col, val) && checkGrid(sudoku, row, col, val));
}

//checks if val is already in the row
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

//checks if val is already in the column
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

//checks if val is already in the sub grid
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

//ensures that every empty cell has at least one possible value
//used for backtracking
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

//prints the given sudoku to the console
//used for testing
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

//returns a deep copy of the given sudoku
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

function getSolution()
{
	var temp = localStorage.getItem('solution');
	var solution = JSON.parse(temp);
  return solution;
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

function checkBoard()
{
	var solution = getSolution();
	var score = 0;
	for(var i = 0; i < 9; i++)
	{
		for(var j = 0; j < 9; j++)
		{
			var id = "" + i + j;
			var val = document.getElementById(id).value;
			var sol = solution[i][j].val;
			if(val != "")
			{
				if(val != solution[i][j].val)
				{
					document.getElementById(id).style.color = 'red';
				}
				else
				{
					score++;
				}
			}
		}
	}

	if(score == 81)
	{
		console.log('You win!');
	}
}

function findErrors(sudoku, solution)
{
	var errors = [];
	for(var i = 0; i < 9; i++)
	{
		for(var j = 0; j < 9; j++)
		{
			if(sudoku[i][j].val != null && sudoku[i][j].val != solution[i][j].val)
			{
				errors.push([i, j]);
			}
		}
	}
	console.log(errors);
}

function addValuesToInputs(sudoku){
  var row = 0;
  for(var i = 0; i < 9; i++){

    var col = 0;

    for(var j = 0; j < 9; j++){
      var val = sudoku[i][j].val;
      var s = "" + row + col;

      if(val == null){
        document.getElementById(s).value = "";
      }
      else{
        document.getElementById(s).value = val;
        document.getElementById(s).readOnly = true;
        document.getElementById(s).style.fontWeight = '900';
      }
      col++;
    }
    row++;
  }

}

function getHint(){
  var hintsLeft = localStorage.getItem('hints');
  if(hintsLeft == 0){
    return;
  }
  document.getElementById("hint").innerText = "Hint" + hintsLeft;
  var cells = shuffledCells();
  while(true){
    var cell = cells.pop();
    if(cells == null){
      return;
    }
    var row = cell[0];
    var col = cell[1];
    var s = "" + row + col;
    if(document.getElementById(s).value == ""){
      var solution = getSolution();
      document.getElementById(s).value = solution[row][col].val;
      document.getElementById(s).readOnly = true;
      document.getElementById(s).style.fontWeight = '900';
      break;
    }
  }
  localStorage.setItem('hint', hintsLeft--);
}

function createHTMLForSudoku(){
  let row = 0;
  let col = 0;
  let s = "";

  s+="<table id=\"game\" style=\"border-collapse: collapse;\">";
  for(let k = 0; k < 9; k++){
    s+="<tr class=\"row\">";
    for(let l = 0; l < 9; l++){
      s += "<td class=\"cell\"><input type=\"text\" maxlength=\"1\" id=\"" + row + col + "\" class=\"inputvalue\" style=\"border-bottom: 0px;\"></td>";
      col++;
    }
    s+="</tr>";
    row++;
    col = 0;
  }
  s+="</table>";
  document.getElementById("sudoku").innerHTML += s;

}
