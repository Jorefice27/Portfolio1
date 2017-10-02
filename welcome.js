function navigate(difficulty)
{
	localStorage.setItem("difficulty", difficulty);
	window.location.href = "sudoku.html";
}