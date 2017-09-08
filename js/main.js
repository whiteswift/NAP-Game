// (function(){ // When page is ready, run this code.
// 	getNewProducts(); // Start new game
// })();

document.addEventListener("DOMContentLoaded", getNewProducts, false);

var score = 0;
var pids = [];
var pid,shot,size,imageURL,name,designer,description,price,randomNumbers;

function getNewProducts(){

	var offset = _getRandomOffset();

	fetch(`http://lad-api.net-a-porter.com:80/NAP/GB/60/${offset}/pids?priceMin=100000&visibility=visible`)
	.then((pidsResponse) => {
		if (pidsResponse.status !== 200) {
			console.log('ʕノ•ᴥ•ʔノ ︵ ┻━┻ fetch failed',pidsResponse.status);
			return;
		}

		pidsResponse.json().then((pidData) => {
			// Clear the pids array
			randomNumbers = []; // [345435, 543545]

			// Get two randomNumbers from data
			randomNumbers[0] = _getRandomNumber(0,59);
			randomNumbers[1] = _getRandomNumber(0,59);

			// Make sure they are not the same
			while(randomNumbers[0] === randomNumbers[1]) {
					randomNumbers[0] = _getRandomNumber(0,59);
			}

			pids[0] = pidData.pids[randomNumbers[0]];
			pids[1] = pidData.pids[randomNumbers[1]];

			// set off product 1 promise
			fetch(`http://lad-api.net-a-porter.com:80/NAP/GB/en/detail/${pids[0]}`)
			.then((productDataResponse) => {
				if (productDataResponse.status !== 200) {
					console.log('ʕノ•ᴥ•ʔノ ︵ ┻━┻ fetch failed',productDataResponse.status);
					return;
				}

				productDataResponse.json()
				.then((productData) => {
					processProductData(1, productData);
				});
			});

			// set off product 2 promise
			fetch(`http://lad-api.net-a-porter.com:80/NAP/GB/en/detail/${pids[1]}`)
			.then((productDataResponse) => {
				if (productDataResponse.status !== 200) {
					console.log('ʕノ•ᴥ•ʔノ ︵ ┻━┻ fetch failed',productDataResponse.status);
					return;
				}

				productDataResponse.json().then((productData) => {
					processProductData(2, productData);
				});
			});
		});
	});
}

function processProductData(productNumber, productData) {
	pid = productData.id;
	shot = productData.images.shots[0];
	size = productData.images.sizes[0];
	imageURL = "http://cache.net-a-porter.com/images/products/"+pid+"/"+pid+"_"+shot+"_"+size+".jpg";
	name = productData.name;
	designer = productData.brand.name;
	description = productData.editorsComments;
	price = btoa(productData.price.amount);

	document.getElementById('productName' + productNumber).innerHTML = '<p><b>'+designer+'</b></p><p>'+name+'</p>';
	document.getElementById('productImage' + productNumber).setAttribute('src',imageURL);
	document.getElementById('productPrice' + productNumber).setAttribute('data-price',price);
	document.getElementById('productDescription' + productNumber).innerHTML = description;
}

function processAnswer(selection) {
	
	var price1 = atob(document.getElementById('productPrice1').dataset.price)/100;
	var price2 = atob(document.getElementById('productPrice2').dataset.price)/100;

	if(selection === 'A' && price1 > price2) {
		document.getElementById('overlay-text').innerHTML = ('✨ʕ^ᴥ^ʔ✨<br/><br/>Correct!<br/><br/> Product A: £'+ price1 +' Product B: £'+ price2 + '<br/><br/>');
		_addToScore();
	}
	else if(selection === 'B' && price1 < price2) {
		document.getElementById('overlay-text').innerHTML = ('✨ʕ^ᴥ^ʔ✨<br/><br/>Correct!<br/><br/> Product A: £'+ price1 +'. Product B: £'+ price2 + '<br/><br/>');
		_addToScore();
	}
	else if (price1 === price2) {
		document.getElementById('overlay-text').innerHTML = ('Same price!<br/><br/> No points though sorry. Product A: £'+ price1 +'. Product B: £'+ price2 + '<br/><br/>');
	}
	else {
		document.getElementById('overlay-text').innerHTML = ('⚡️ ʕノ•ᴥ•ʔノ ︵ ┻━┻ <br/><br/>Incorrect!<br/><br/> Product A: £'+ price1 +'. Product B: £'+ price2 + '<br/><br/>');
	}

	overlayMessage();
	getNewProducts(); // Get new products again
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

function _addToScore(){
	score++;
	document.getElementById('score').innerHTML = score;
}

function overlayMessage() {
	el = document.getElementById("overlay");
	el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
}

function isOverlayVisible() {
	el = document.getElementById("overlay");
	return el.style.visibility;
}

//////////////////////
// Event listeners
//////////////////////

[].forEach.call(document.getElementsByClassName('high-low'), (element) => {
	element.addEventListener('click', () => { 
		let selection = element.getAttribute('id');
		processAnswer(selection); 
	});
});

document.getElementById('overlay').addEventListener('click', () => { overlayMessage(); });

window.addEventListener('keydown', (event) => {
	if(event.keyCode === 37 || event.keyCode === 65) { // Left, A
		// Check if overlay is present - then return if so
		if (isOverlayVisible() !== 'visible') {
			processAnswer('A');
		}
	}
	if(event.keyCode === 39 || event.keyCode === 66) { // Right, B
		if (isOverlayVisible() !== 'visible') {
			processAnswer('B');
		}
	}
	if(event.keyCode === 32 && isOverlayVisible()) { // Spacebar
		overlayMessage()
	}
});
