
document.addEventListener("DOMContentLoaded", getNewProducts, false);

var score = 0;
var pids = [];
var pid, shot, size, imageURL, name, designer, description, price, randomNumbers;
const higher = 'higher';
const lower = 'lower';
const bank = 'bank';

function getNewProducts() {

	resetProducts();
	var offset = _getRandomOffset();

	fetch(`http://lad-api.net-a-porter.com:80/NAP/GB/60/${offset}/pids?priceMin=100000&visibility=visible`)
		.then((response) => {
			if (response.status !== 200) {
				console.log('ʕノ•ᴥ•ʔノ ︵ ┻━┻ fetch failed', response.status);
				return;
			}
			return response.json();
		})
		.then((pidData) => {
			// Clear the pids array
			randomNumbers = [];

			for (var i = 0; i < 2; i++) {

				do {
					// Get two randomNumbers from data
					randomNumbers[i] = _getRandomNumber(0, 59);
				}
				while (randomNumbers[0] === randomNumbers[1]); // Make sure they are not the same

				pids[i] = pidData.pids[randomNumbers[i]];
			}

			return pids;
		})
		.then((pids) => {
			// promise.all to functions

			let fetchPidDetailsPromises = [];
			for (var i = 0; i < 2; i++) {
				fetchPidDetailsPromises.push(fetch(`http://lad-api.net-a-porter.com:80/NAP/GB/en/detail/${pids[i]}`));
			}

			Promise.all(fetchPidDetailsPromises)
				.then(responses => {
					responses.forEach((response) => {
						response.json()
							.then((jsonProductData) => {
								processProductData(jsonProductData)
							});
					});
				})
				.catch(error => {
					console.log(error)
				});
		});
}

function processProductData(productData) {
	pid = productData.id;
	shot = productData.images.shots[0];
	size = productData.images.sizes[0];
	imageURL = "http://cache.net-a-porter.com/images/products/" + pid + "/" + pid + "_" + shot + "_" + size + ".jpg";
	// name = productData.name;
	// designer = productData.brand.name;
	// description = productData.editorsComments;
	// price = btoa(productData.price.amount);
	price = productData.price.amount;

	let firstProduct = document.getElementById('productImage1')

	if (firstProduct.getAttribute('data-is-set') !== 'true') {
		setProductDetailsInDom(1, productData); // set the first product
		firstProduct.setAttribute('data-is-set', 'true'); // set the data-is-set attribute
	} else {
		setProductDetailsInDom(2, productData);
		// Not actually needed, but this would be set here
		// secondProduct.setAttribute('data-is-set', 'true'); // set the data-is-set attribute
	}
}

function setProductDetailsInDom(productNumber) {
	// document.getElementById(`productName${productNumber}`).innerHTML = `<p><b>${designer}</b></p><p>${name}</p>`;
	document.getElementById(`productImage${productNumber}`).setAttribute('src', imageURL);
	document.getElementById(`productPrice${productNumber}`).setAttribute('data-price', price);
	// document.getElementById(`productDescription${productNumber}`).innerHTML = description;
}

function processAnswer(selection) {

	// var price1 = atob(document.getElementById('productPrice1').dataset.price) / 100;
	// var price2 = atob(document.getElementById('productPrice2').dataset.price) / 100;
	var price1 = document.getElementById('productPrice1').dataset.price / 100;
	var price2 = document.getElementById('productPrice2').dataset.price / 100;
	let overlayText = document.getElementById('overlay-text');

	if (selection === 'bank') {
		overlayText.innerHTML = ('<br/><br/>BANK!<br/><br/>');
	}
	else if (selection === higher && price1 > price2) {
		overlayText.innerHTML = ('✨ʕ^ᴥ^ʔ✨<br/><br/>Correct!<br/><br/> Product A: £' + price1 + ' Product B: £' + price2 + '<br/><br/>');
		_addToScore();
	}
	else if (selection === lower && price1 < price2) {
		overlayText.innerHTML = ('✨ʕ^ᴥ^ʔ✨<br/><br/>Correct!<br/><br/> Product A: £' + price1 + '. Product B: £' + price2 + '<br/><br/>');
		_addToScore();
	}
	else if (price1 === price2) {
		overlayText.innerHTML = ('Same price!<br/><br/> No points though sorry. Product A: £' + price1 + '. Product B: £' + price2 + '<br/><br/>');
	}
	else {
		overlayText.innerHTML = ('⚡️ ʕノ•ᴥ•ʔノ ︵ ┻━┻ <br/><br/>Incorrect!<br/><br/> Product A: £' + price1 + '. Product B: £' + price2 + '<br/><br/>');
	}

	toggleOverlayMessage();
	getNewProducts(); // Get new products again
}

//////////////////////
// Helper functions
//////////////////////

function _getRandomOffset() {
	var offset = _getRandomNumber(0, 1000);
	return offset;
}

function _getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

function _addToScore() {
	score++;
	document.getElementById('score').innerHTML = score;
}

function toggleOverlayMessage() {
	el = document.getElementById("overlay");
	el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
}

function isOverlayVisible() {
	el = document.getElementById("overlay");
	return el.style.visibility;
}

function resetProducts() {
	let products = document.querySelectorAll('.product');
	products.forEach((product) => {
		product.setAttribute('data-is-set', 'false');
	});
}

//////////////////////
// Event listeners
//////////////////////

[].forEach.call(document.getElementsByClassName('high-low'), (element) => {
	element.addEventListener('click', () => {
		let selection = element.getAttribute('id'); // 'A' or 'B'
		processAnswer(selection);
	});
});

document.getElementById('overlay').addEventListener('click', () => { toggleOverlayMessage(); });

window.addEventListener('keydown', (event) => {
	if (event.keyCode === 38) { // Up
		// Check if overlay is present - then return if so
		if (isOverlayVisible() !== 'visible') {
			processAnswer(higher);
		}
	}
	if (event.keyCode === 40) { // Right, B
		if (isOverlayVisible() !== 'visible') {
			processAnswer(lower);
		}
	}
	if (event.keyCode === 32 && isOverlayVisible()) { // Spacebar
		toggleOverlayMessage()
	}
});
