function navigate(difficulty)
{
	localStorage.setItem("difficulty", difficulty);
	var numHints = (difficulty == 'easy')? 5 : (difficulty == 'medium')? 3 : 0;
	localStorage.setItem('hint', numHints);
	window.location.href = "sudoku.html";
}