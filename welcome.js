function navigate(difficulty)
{
	localStorage.setItem("difficulty", difficulty);
	console.log(localStorage.getItem('difficulty'));
	// window.location.href = "sudoku.html";
}