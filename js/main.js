document.addEventListener("DOMContentLoaded", getNewProducts, false);

//////////////////////
// Your code goes here
//////////////////////

function getNewProducts() {

}

//////////////////////
// Helper functions
//////////////////////

function _getRandomOffset(){
	var offset = _getRandomNumber(0,1000);
	return offset;
}

function _getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

//////////////////////
// Event listeners
//////////////////////

[].forEach.call(document.getElementsByClassName('high-low'), (element) => {
	element.addEventListener('click', () => { 
		let selection = element.getAttribute('id'); // 'A' or 'B'
		// Do something with selection
	});
});
