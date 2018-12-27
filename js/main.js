
document.addEventListener("DOMContentLoaded", start, false);
const bankImages = 3;
const loseImages = 5;
const winGifs = 3;

var score = 0;
var pids = [];
var pid, shot, size, imageURL, name, designer, description, price, randomNumbers;

let lives = 3;
let turn = 0;

const left = 'left';
const right = 'right';
const bank = 'bank';
const slideDistance = -442;
const numberOfProducts = 11;
const ticker = document.getElementById("ticker-wrapper");
let overlayText = document.getElementById('overlay-text');

function start() {
	// resetProducts();
	const offset = _getRandomOffset();

	getNewProducts(offset)
	// getNewMockProducts();
}

function getNewMockProducts() {
	// debugger check 
	const summariesData = JSON.parse(summaries);
	processProductData(summariesData);

	// Let processProductData handle checking for what products have been set.
}

function getNewProducts(offset) {
	// TODO: Change this to just get data from summaries api

	fetch(`http://lad-api.net-a-porter.com:80/NAP/GB/en/60/${offset}/summaries?priceMin=100000&visibility=visible`)
		.then((response) => {
			if (response.status !== 200) {
				console.log('fetch failed', response.status);
				return;
			}
			return response.json();
		})
		.then((jsonProductData) => {
			processProductData(jsonProductData)
		})
		.catch(error => {
			console.log(error)
		});
}

function processProductData(productData) {
	// Set 10 different products data with random numbers. Random numbers used to select array positions
	let pids = [];
	let uniquePids = [];

	while (uniquePids.length < numberOfProducts) { // make sure none of the pids are the same
		pids = setRandomArray(numberOfProducts);
		uniquePids = [...new Set(pids)];
	}

	// map over pids array to fire off setDOM function
	pids.map((productNumber, count) => {
		// productNumber 23,35,53
		// count 0,1,2,3		
		setProductDetailsInDom(productData.summaries[productNumber], count);
	})
}

function setRandomArray(iterations) {
	let tempPids = [];
	for (var i = 0; i < iterations; i++) {
		tempPids.push(_getRandomNumber(0, 59))
	}
	return tempPids;
}

function setProductDetailsInDom(productDetails, productNumber) {
	const product = document.getElementById(`product${productNumber}`);

	pid = productDetails.id;
	shot = productDetails.images.shots[0];
	size = productDetails.images.sizes[0];

	// // TODO: Uncomment this line when online
	imageURL = "http://cache.net-a-porter.com/images/products/" + pid + "/" + pid + "_" + shot + "_" + size + ".jpg";

	// Comment for offline
	// imageURL = `./images/sample${_getRandomNumber(1, 4)}.jpg`;

	price = productDetails.price.amount;

	product.setAttribute('src', imageURL);
	product.setAttribute('data-price', price);
}

function processAnswer(selection) {
	// Store current product being tested in window or localstorage?
	if (turn === (numberOfProducts - 1)) { console.log('No more products - this shouldnt be shown') }

	var leftProductPrice = document.getElementById(`product${turn}`).dataset.price / 100;
	var rightProductPrice = document.getElementById(`product${turn + 1}`).dataset.price / 100;

	let overlay = document.getElementById('overlay');

	// TODO: Change this to a switch
	if (selection === bank) {
		bankPoints();
	}
	else if (selection === left && leftProductPrice > rightProductPrice) {
		overlay.innerHTML = (`<div id="img-container"><img src='./images/win/${_getRandomNumber(1, winGifs + 1)}.gif'/></div><span id="overlay-text"><br/<b>Correct!</b><br/><br/> Product A: £${leftProductPrice}<br/>Product B: £${rightProductPrice}<br/><br/></span>`);
		addToScore();
		nextTurn();
	}
	else if (selection === right && leftProductPrice < rightProductPrice) {
		overlay.innerHTML = (`<div id="img-container"><img src='./images/win/${_getRandomNumber(1, winGifs + 1)}.gif'/></div><span id="overlay-text"><br/><b>Correct!</b><br/><br/> Product A: £${leftProductPrice}<br/>Product B: £${rightProductPrice}<br/><br/></span>`);
		addToScore();
		nextTurn();
	}
	else if (leftProductPrice === rightProductPrice) {
		overlay.innerHTML = ('Same price!<br/><br/> No points though sorry. Product A: £' + leftProductPrice + '<br/>Product B: £' + rightProductPrice + '<br/><br/></span>');
		nextTurn();
	}
	else {
		overlay.innerHTML = (`<div id="img-container"><img src='./images/lose/${_getRandomNumber(1, loseImages + 1)}.jpg'/></div><span id="overlay-text"><br/><b>Incorrect!</b><br/><br/> Product A: £${leftProductPrice}<br/>Product B: £${rightProductPrice}<br/><br/></span>`);
		loseALife();
	}

	toggleOverlayMessage()
	setTimeout(function () { toggleOverlayMessage(); }, 1500);
	// Reload the page to start a new game
	// getNewProducts(); // Get new products again
}

function nextTurn() {
	++turn;

	console.log(`TURN ${turn}`);
	// Do something with turn
	if (turn === (numberOfProducts - 1)) { //if turn = 10
		winGame();
	}

	slideLeft()
	document.getElementById(`product${turn}`).setAttribute('data-is-active', 'true') // set data-is-active on .product img
}

function slideLeft() {
	ticker.style.transform = `translateX(${turn * -442}px)`
}

//////////////////////
// Game functions
//////////////////////

function addToScore() {
	score++;
	document.getElementById('score').innerHTML = score;
}

function loseALife() {
	const livesDisplay = document.getElementById('lives');

	switch (lives) {
		case 3:
			livesDisplay.innerHTML = '❤️️❤️️🖤️️';
			break;
		case 2:
			livesDisplay.innerHTML = '❤️️🖤️️🖤️️';
			break;
		case 1:
			livesDisplay.innerHTML = '🖤️️🖤️️🖤️️';
			gameOver();
			break;
		default:
			break;
	}

	lives = --lives;
}

function bankPoints() {
	saveScore(score);
	document.getElementById('end-game-overlay').innerHTML = `<img src='./images/bank/${_getRandomNumber(1, bankImages + 1)}.jpg'/><div class='outcome'>BANK!</div><button id='new-game' onClick=location.reload()>NEW GAME</button>`;
	toggleEndGameOverlayMessage();
}

function winGame() {
	saveScore(score);
	document.getElementById('end-game-overlay').innerHTML = `<img src='./images/bank/${_getRandomNumber(1, bankImages + 1)}.jpg'/><div class='outcome'>YOU WIN!</div><button id='new-game' onClick=location.reload()>NEW GAME</button>`;
	toggleEndGameOverlayMessage();
}

function gameOver() { // modal and gif with score
	saveScore(0);
	document.getElementById('score').innerHTML = 0;
	document.getElementById('end-game-overlay').innerHTML = `<img src='./images/lose/${_getRandomNumber(1, loseImages + 1)}.jpg'/><div class='outcome'>YOU LOSE!</div><button id='new-game' onClick=location.reload()>NEW GAME</button>`;
	toggleEndGameOverlayMessage()
}

function saveScore(points) { // Save score in localStorage
	// get team scores array from localStorage if any
	let scores;
	try {
		scores = JSON.parse(window.localStorage.getItem('scores'));
	} catch (error) { }


	if (!scores) scores = [];
	// make team object to scores array
	scores.push(points)
	// push new score to array

	try {
		window.localStorage.setItem('scores', JSON.stringify(scores));
	} catch (error) { }
}

function clearScores() {
	try {
		window.localStorage.removeItem('scores');
	} catch (error) { console.log }
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

function toggleOverlayMessage() {
	el = document.getElementById("overlay");
	el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
}

function toggleEndGameOverlayMessage() {
	el = document.getElementById("end-game-overlay");
	el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
}

function isOverlayVisible() {
	el = document.getElementById("overlay");
	return el.style.visibility;
}

//////////////////////
// Event listeners
//////////////////////

[].forEach.call(document.getElementsByClassName('product'), (element) => {
	element.addEventListener('click', () => {
		let selection = !!element.dataset.isActive ? 'left' : 'right';
		processAnswer(selection);
	});
});

// document.getElementById('overlay').addEventListener('click', () => { toggleOverlayMessage(); });
document.getElementById('bank').addEventListener('click', () => { processAnswer('bank'); });

// TODO: Make a switch
window.addEventListener('keydown', (event) => {

	if (event.keyCode === 37) { // Left
		event.preventDefault();
		// Check if overlay is present - then return if so
		if (isOverlayVisible() !== 'visible') {
			processAnswer(left);
		}
	}
	if (event.keyCode === 39) { // Right
		event.preventDefault();
		if (isOverlayVisible() !== 'visible') {
			processAnswer(right);
		}
	}
	if (event.keyCode === 66) { // B
		event.preventDefault();
		if (isOverlayVisible() !== 'visible') {
			processAnswer(bank);
		}
	}
	if (event.keyCode === 32 && isOverlayVisible()) { // Spacebar
		event.preventDefault();
		toggleOverlayMessage()
	}
});

// TODO: remove this mock product respnose
var summaries = '{"summaries":[{"name":"Domino leather shoulder bag","visible":true,"saleableStandardSizeIds":[],"price":{"currency":"GBP","divisor":100,"amount":164000},"leafCategoryIds":[5998,21383,32379,6007,36939,37146,37866],"onSale":false,"analyticsKey":"Domino leather shoulder bag","id":1085220,"brandId":1442,"colourIds":[2],"images":{"shots":[" in ","ou","bk","cu","e1","e2"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image / jpeg","urlTemplate":"{ { scheme } }//cache.net-a-porter.com/images/products/1085220/1085220_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Sulpice small quilted leather shoulder bag","visible":true,"saleableStandardSizeIds":[],"price":{"currency":"GBP","divisor":100,"amount":155500},"leafCategoryIds":[6007,13040,5998,37866,21383],"onSale":false,"analyticsKey":"Sulpice small quilted leather shoulder bag","id":1067581,"brandId":1442,"colourIds":[2],"images":{"shots":["in","ou","bk","cu","e1"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1067581/1067581_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Drew Bijou mini embroidered leather shoulder bag","visible":true,"saleableStandardSizeIds":[],"price":{"currency":"GBP","divisor":100,"amount":161500},"leafCategoryIds":[5998,13040,24191,32379,6007],"onSale":false,"analyticsKey":"Drew Bijou mini embroidered leather shoulder bag","id":1060165,"brandId":122,"colourIds":[98],"images":{"shots":["in","ou","bk","cu","e1","e2"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1060165/1060165_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Faye medium glossed-leather shoulder bag","visible":true,"saleableStandardSizeIds":[],"price":{"currency":"GBP","divisor":100,"amount":146000},"leafCategoryIds":[5998,37452,37866,32379],"onSale":false,"analyticsKey":"Faye medium glossed-leather shoulder bag","id":1060181,"brandId":122,"colourIds":[53],"images":{"shots":["in","ou","bk","cu","e1","e2"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1060181/1060181_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Liriope hooded quilted glossed-shell down jacket","visible":true,"saleableStandardSizeIds":["00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing","00008_XXL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":116000},"leafCategoryIds":[552,36768,13392],"onSale":false,"analyticsKey":"Liriope hooded quilted glossed-shell down jacket","id":1055822,"brandId":2091,"colourIds":[37],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1055822/1055822_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Rajah embellished leather shoulder bag","visible":true,"saleableStandardSizeIds":[],"price":{"currency":"GBP","divisor":100,"amount":177000},"leafCategoryIds":[5998,13040,37866],"onSale":false,"analyticsKey":"Rajah embellished leather shoulder bag","id":1084983,"brandId":578,"colourIds":[43],"images":{"shots":["in","ou","bk","cu","e1"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1084983/1084983_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Rajah small embellished leather shoulder bag","visible":true,"saleableStandardSizeIds":[],"price":{"currency":"GBP","divisor":100,"amount":177000},"leafCategoryIds":[5998,13040,37866,37146,37452],"onSale":false,"analyticsKey":"Rajah small embellished leather shoulder bag","id":1084984,"brandId":578,"colourIds":[19],"images":{"shots":["in","ou","bk","cu","e1"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1084984/1084984_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Thiara embellished printed leather shoulder bag ","visible":true,"saleableStandardSizeIds":[],"price":{"currency":"GBP","divisor":100,"amount":205000},"leafCategoryIds":[5998,19673,6009,6007,36651,27878],"onSale":false,"analyticsKey":"Thiara embellished printed leather shoulder bag ","id":1061510,"brandId":578,"colourIds":[37,2],"images":{"shots":["in","ou","bk","cu","e1","e2","e3","e4","e5"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1061510/1061510_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Hooded velvet-paneled quilted shell down jacket","visible":true,"saleableStandardSizeIds":["00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing","00008_XXL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":116000},"leafCategoryIds":[552,6565,20078,36777],"onSale":false,"analyticsKey":"Hooded velvet-paneled quilted shell down jacket","id":1055826,"brandId":2091,"colourIds":[2],"images":{"shots":["in","ou","fr","bk","cu","e1"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1055826/1055826_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Crystal-embellished wool and cashmere-blend scarf","visible":true,"saleableStandardSizeIds":[],"price":{"currency":"GBP","divisor":100,"amount":124000},"leafCategoryIds":[5160,37884,5179,21383,36831,5181],"onSale":false,"analyticsKey":"Crystal-embellished wool and cashmere-blend scarf","id":1061019,"brandId":578,"colourIds":[2],"images":{"shots":["in","ou","fr","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1061019/1061019_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Quilted metallic shell down jacket","visible":true,"saleableStandardSizeIds":["00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing","00008_XXL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":150000},"leafCategoryIds":[552,6565,36777],"onSale":false,"analyticsKey":"Quilted metallic shell down jacket","id":1055830,"brandId":2091,"colourIds":[66],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1055830/1055830_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Rylee cutout snake-effect leather ankle boots","visible":true,"saleableStandardSizeIds":["00003_34_Shoes","00005_35_Shoes","00006_35.5_Shoes","00007_36_Shoes","00008_36.5_Shoes","00009_37_Shoes","00010_37.5_Shoes","00011_38_Shoes","00012_38.5_Shoes","00013_39_Shoes","00014_39.5_Shoes","00015_40_Shoes","00016_40.5_Shoes","00017_41_Shoes","00018_41.5_Shoes","00019_42_Shoes"],"price":{"currency":"GBP","divisor":100,"amount":109500},"leafCategoryIds":[18995,38169,549,35994,36240,36390,37506,36822,37329],"onSale":false,"analyticsKey":"Rylee cutout snake-effect leather ankle boots","id":1082574,"brandId":122,"colourIds":[124,1],"images":{"shots":["in","fr","ou","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1082574/1082574_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Fringed macramé-trimmed floral-print silk-twill scarf","visible":true,"saleableStandardSizeIds":[],"price":{"currency":"GBP","divisor":100,"amount":107000},"leafCategoryIds":[5160,5178,5181],"onSale":false,"analyticsKey":"Fringed macramé-trimmed floral-print silk-twill scarf","id":1084848,"brandId":578,"colourIds":[2],"images":{"shots":["in","ou","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1084848/1084848_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Wool coat ","visible":true,"saleableStandardSizeIds":["00001_XXXS_Clothing","00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":169000},"leafCategoryIds":[608,36921,36574,36777,32025],"onSale":false,"analyticsKey":"Wool coat ","id":1096075,"brandId":2593,"colourIds":[29],"images":{"shots":["in","ou","fr","bk","cu","e1"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1096075/1096075_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Sequined chunky-knit sweater","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":158000},"leafCategoryIds":[6142,36786,6383],"onSale":false,"analyticsKey":"Sequined chunky-knit sweater","id":1090703,"brandId":2338,"colourIds":[1],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1090703/1090703_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Belted double-breasted checked woven blazer","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing","00008_XXL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":179500},"leafCategoryIds":[6622,10790,36912,15037],"onSale":false,"analyticsKey":"Belted double-breasted checked woven blazer","id":1084944,"brandId":122,"colourIds":[6],"images":{"shots":["in","ou","fr","bk","cu","e1"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1084944/1084944_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Ruffled cotton-twill trench coat","visible":true,"saleableStandardSizeIds":["00001_XXXS_Clothing","00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":108000},"leafCategoryIds":[19817,609,30895,37137,35255,36921],"onSale":false,"analyticsKey":"Ruffled cotton-twill trench coat","id":1105130,"brandId":290,"colourIds":[1],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1105130/1105130_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Lisa leather-trimmed logo-jacquard over-the-knee boots","visible":true,"saleableStandardSizeIds":["00005_35_Shoes","00006_35.5_Shoes","00007_36_Shoes","00008_36.5_Shoes","00009_37_Shoes","00010_37.5_Shoes","00011_38_Shoes","00012_38.5_Shoes","00013_39_Shoes","00014_39.5_Shoes","00015_40_Shoes","00016_40.5_Shoes","00017_41_Shoes","00018_41.5_Shoes"],"price":{"currency":"GBP","divisor":100,"amount":124000},"leafCategoryIds":[3105,36240,549,37329],"onSale":false,"analyticsKey":"Lisa leather-trimmed logo-jacquard over-the-knee boots","id":1059858,"brandId":578,"colourIds":[1],"images":{"shots":["in","fr","ou","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1059858/1059858_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Ruffled silk crepe de chine midi dress","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing","00008_XXL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":179500},"leafCategoryIds":[6040,36795,36885,6656],"onSale":false,"analyticsKey":"Ruffled silk crepe de chine midi dress","id":1084941,"brandId":122,"colourIds":[37],"images":{"shots":["in","ou","fr","bk","cu","e1"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1084941/1084941_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Floral-print silk crepe de chine wrap midi dress","visible":true,"saleableStandardSizeIds":["00001_XXXS_Clothing","00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing","00008_XXL_Clothing","00009_XXXL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":196500},"leafCategoryIds":[6040,6656,36696,18092,32214,34848,27194],"onSale":false,"analyticsKey":"Floral-print silk crepe de chine wrap midi dress","id":1059877,"brandId":137,"colourIds":[93,31],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1059877/1059877_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Marlow cold-shoulder crepe jumpsuit","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing","00008_XXL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":159500},"leafCategoryIds":[4909,15316,36624,19835],"onSale":false,"analyticsKey":"Marlow cold-shoulder crepe jumpsuit","id":1091669,"brandId":401,"colourIds":[79],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1091669/1091669_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Rose 18-karat rose gold diamond necklace","visible":true,"saleableStandardSizeIds":[],"price":{"currency":"GBP","divisor":100,"amount":865000},"leafCategoryIds":[29861,20807,30230],"onSale":false,"analyticsKey":"Rose 18-karat rose gold diamond necklace","id":1020358,"brandId":2869,"colourIds":[127],"images":{"shots":["in","ou","bk","cu","e1"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1020358/1020358_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Possession 18-karat rose gold diamond necklace","visible":true,"saleableStandardSizeIds":[],"price":{"currency":"GBP","divisor":100,"amount":585000},"leafCategoryIds":[29861,30230,30059,37911],"onSale":false,"analyticsKey":"Possession 18-karat rose gold diamond necklace","id":1029385,"brandId":2869,"colourIds":[127],"images":{"shots":["in","ou","bk","cu","e1","e2"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1029385/1029385_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Zarda double-breasted alpaca coat","visible":true,"saleableStandardSizeIds":["00001_XXXS_Clothing","00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing","00008_XXL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":189000},"leafCategoryIds":[19817,19898,20501,32335,36777],"onSale":false,"analyticsKey":"Zarda double-breasted alpaca coat","id":1075842,"brandId":2530,"colourIds":[93],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1075842/1075842_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Reversible shearling gilet","visible":true,"saleableStandardSizeIds":["00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":109500},"leafCategoryIds":[608,6563,32335,36777],"onSale":false,"analyticsKey":"Reversible shearling gilet","id":1079970,"brandId":52,"colourIds":[2],"images":{"shots":["in","ou","fr","bk","cu","e1","e2"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1079970/1079970_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Printed silk crepe de chine wrap dress","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing","00008_XXL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":115000},"leafCategoryIds":[6040,2856,6656],"onSale":false,"analyticsKey":"Printed silk crepe de chine wrap dress","id":1099181,"brandId":513,"colourIds":[2],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1099181/1099181_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Draped checked woven trench coat","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":233000},"leafCategoryIds":[609,19898,21410,35255,36921,36777,37137,36601],"onSale":false,"analyticsKey":"Draped checked woven trench coat","id":1084939,"brandId":122,"colourIds":[6],"images":{"shots":["in","ou","fr","bk","cu","e1"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1084939/1084939_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Satin-trimmed crepe straight-leg pants","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":134000},"leafCategoryIds":[605,19853],"onSale":false,"analyticsKey":"Satin-trimmed crepe straight-leg pants","id":1099938,"brandId":424,"colourIds":[2],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1099938/1099938_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Printed silk-crepe shirt dress","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":132000},"leafCategoryIds":[6028,2856,6656,15673],"onSale":false,"analyticsKey":"Printed silk-crepe shirt dress","id":1084942,"brandId":122,"colourIds":[21],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1084942/1084942_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Azul one-shoulder wool-crepe gown","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing","00008_XXL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":209500},"leafCategoryIds":[6046,32214,19835,25469,11194],"onSale":false,"analyticsKey":"Azul one-shoulder wool-crepe gown","id":1050604,"brandId":401,"colourIds":[73],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1050604/1050604_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Double-breasted wool-blend coat","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":233000},"leafCategoryIds":[608,19898,36574,36777,21410,36921],"onSale":false,"analyticsKey":"Double-breasted wool-blend coat","id":1084940,"brandId":122,"colourIds":[2,18],"images":{"shots":["in","ou","fr","bk","cu","e1"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1084940/1084940_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Possession 29mm 18-karat rose gold, satin and diamond watch","visible":true,"saleableStandardSizeIds":[],"price":{"currency":"GBP","divisor":100,"amount":1290000},"leafCategoryIds":[29888,20807,30185],"onSale":false,"analyticsKey":"Possession 29mm 18-karat rose gold, satin and diamond watch","id":1029398,"brandId":2869,"colourIds":[127,43],"images":{"shots":["in","ou","fr","bk","cu","e1","e2","e3"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1029398/1029398_{{shot}}_{{size}}.jpg"},"badges":["Low_Stock"]},{"name":"Cropped leopard-print denim jacket","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":115500},"leafCategoryIds":[552,15565,2797,10790],"onSale":false,"analyticsKey":"Cropped leopard-print denim jacket","id":1107206,"brandId":171,"colourIds":[6,91],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1107206/1107206_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Reversible double-breasted shearling coat","visible":true,"saleableStandardSizeIds":["00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":182000},"leafCategoryIds":[608,6563,19898,32335,36777],"onSale":false,"analyticsKey":"Reversible double-breasted shearling coat","id":1079968,"brandId":52,"colourIds":[58],"images":{"shots":["in","ou","fr","bk","cu","e1","e2"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1079968/1079968_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"+ 6 Noir Kei Ninomiya cropped appliquéd quilted shell down jacket","visible":true,"saleableStandardSizeIds":["00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":192500},"leafCategoryIds":[15493,17930],"onSale":false,"analyticsKey":"+ 6 Noir Kei Ninomiya cropped appliquéd quilted shell down jacket","id":1065903,"brandId":3269,"colourIds":[2],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1065903/1065903_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Printed silk-crepe maxi dress","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing","00008_XXL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":222500},"leafCategoryIds":[4987,2856,6656],"onSale":false,"analyticsKey":"Printed silk-crepe maxi dress","id":1107454,"brandId":513,"colourIds":[2,36],"images":{"shots":["in","ou","fr","bk","cu","e1"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1107454/1107454_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"18-karat white gold diamond necklace ","visible":true,"saleableStandardSizeIds":[],"price":{"currency":"GBP","divisor":100,"amount":1197500},"leafCategoryIds":[29861,30230,36624],"onSale":false,"analyticsKey":"18-karat white gold diamond necklace ","id":1087399,"brandId":2048,"colourIds":[133],"images":{"shots":["in","ou","bk","cu","e1"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1087399/1087399_{{shot}}_{{size}}.jpg"},"badges":["Low_Stock"]},{"name":"18-karat gold diamond bracelet ","visible":true,"saleableStandardSizeIds":[],"price":{"currency":"GBP","divisor":100,"amount":475000},"leafCategoryIds":[29870,30248],"onSale":false,"analyticsKey":"18-karat gold diamond bracelet ","id":1087397,"brandId":2048,"colourIds":[17,37],"images":{"shots":["in","ou","bk","cu","e1"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1087397/1087397_{{shot}}_{{size}}.jpg"},"badges":["Low_Stock"]},{"name":"Possession 18-karat rose gold, diamond and malachite necklace","visible":true,"saleableStandardSizeIds":[],"price":{"currency":"GBP","divisor":100,"amount":1050000},"leafCategoryIds":[29861,30059,30230],"onSale":false,"analyticsKey":"Possession 18-karat rose gold, diamond and malachite necklace","id":1076573,"brandId":2869,"colourIds":[127,19],"images":{"shots":["in","ou","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1076573/1076573_{{shot}}_{{size}}.jpg"},"badges":["Low_Stock"]},{"name":"Cashmere turtleneck sweater","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":109500},"leafCategoryIds":[6136,2857,36786,6383,14677],"onSale":false,"analyticsKey":"Cashmere turtleneck sweater","id":1103165,"brandId":45,"colourIds":[37],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1103165/1103165_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Printed cotton and flax-blend midi dress","visible":true,"saleableStandardSizeIds":["00001_XXXS_Clothing","00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":116000},"leafCategoryIds":[6040,2856,32214],"onSale":false,"analyticsKey":"Printed cotton and flax-blend midi dress","id":1055063,"brandId":128,"colourIds":[19],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1055063/1055063_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Flower Strass crystal-embellished velvet pumps","visible":true,"saleableStandardSizeIds":["00003_34_Shoes","00005_35_Shoes","00007_36_Shoes","00008_36.5_Shoes","00009_37_Shoes","00010_37.5_Shoes","00011_38_Shoes","00012_38.5_Shoes","00013_39_Shoes","00014_39.5_Shoes","00015_40_Shoes","00017_41_Shoes","00018_41.5_Shoes","00019_42_Shoes"],"price":{"currency":"GBP","divisor":100,"amount":120000},"leafCategoryIds":[6351,37437,36240,21824],"onSale":false,"analyticsKey":"Flower Strass crystal-embellished velvet pumps","id":1061392,"brandId":2755,"colourIds":[2],"images":{"shots":["in","fr","ou","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1061392/1061392_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Crochet-knit mini dress","visible":true,"saleableStandardSizeIds":["00001_XXXS_Clothing","00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":101000},"leafCategoryIds":[6028,2856,32214,6168],"onSale":false,"analyticsKey":"Crochet-knit mini dress","id":1058388,"brandId":78,"colourIds":[1],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1058388/1058388_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Hooded shearling-lined cotton-canvas parka","visible":true,"saleableStandardSizeIds":["00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":278000},"leafCategoryIds":[598,6563,32335,6629],"onSale":false,"analyticsKey":"Hooded shearling-lined cotton-canvas parka","id":1068148,"brandId":2004,"colourIds":[60],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1068148/1068148_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Cracked glossed-shearling coat","visible":true,"saleableStandardSizeIds":["00001_XXXS_Clothing","00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":225000},"leafCategoryIds":[598,6563,36777,28049,2770,32335],"onSale":false,"analyticsKey":"Cracked glossed-shearling coat","id":1085217,"brandId":2651,"colourIds":[6],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1085217/1085217_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Striped metallic crochet-knit maxi dress","visible":true,"saleableStandardSizeIds":["00001_XXXS_Clothing","00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":157000},"leafCategoryIds":[6040,2856,32214,6656,6168],"onSale":false,"analyticsKey":"Striped metallic crochet-knit maxi dress","id":1058379,"brandId":78,"colourIds":[37],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1058379/1058379_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Lenskee metal-trimmed leather knee boots","visible":true,"saleableStandardSizeIds":["00005_35_Shoes","00007_36_Shoes","00009_37_Shoes","00013_39_Shoes","00015_40_Shoes"],"price":{"currency":"GBP","divisor":100,"amount":115000},"leafCategoryIds":[19037,566,38169,32817,36822,37302,37506],"onSale":false,"analyticsKey":"Lenskee metal-trimmed leather knee boots","id":1081804,"brandId":661,"colourIds":[2],"images":{"shots":["in","fr","ou","bk","cu","rw"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1081804/1081804_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Striped knitted sweater ","visible":true,"saleableStandardSizeIds":["00001_XXXS_Clothing","00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":110000},"leafCategoryIds":[6136,6383,10627,32269],"onSale":false,"analyticsKey":"Striped knitted sweater ","id":1066969,"brandId":1349,"colourIds":[18],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1066969/1066969_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Pleated Lurex gown","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing","00008_XXL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":186000},"leafCategoryIds":[6046,26186,6656,19835,37488,32214],"onSale":false,"analyticsKey":"Pleated Lurex gown","id":1058377,"brandId":78,"colourIds":[17],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1058377/1058377_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Laura 85 leather knee boots","visible":true,"saleableStandardSizeIds":["00003_34_Shoes","00007_36_Shoes","00008_36.5_Shoes","00009_37_Shoes","00010_37.5_Shoes","00011_38_Shoes","00012_38.5_Shoes","00013_39_Shoes","00014_39.5_Shoes","00015_40_Shoes","00018_41.5_Shoes","00019_42_Shoes"],"price":{"currency":"GBP","divisor":100,"amount":111000},"leafCategoryIds":[19037,36372,36399,549,38196,37479,36381,36822,37329],"onSale":false,"analyticsKey":"Laura 85 leather knee boots","id":1057491,"brandId":1474,"colourIds":[2],"images":{"shots":["in","fr","ou","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1057491/1057491_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Lenskee metal-trimmed leather knee boots","visible":true,"saleableStandardSizeIds":["00005_35_Shoes","00007_36_Shoes","00009_37_Shoes","00013_39_Shoes","00015_40_Shoes"],"price":{"currency":"GBP","divisor":100,"amount":115000},"leafCategoryIds":[19037,549,32817,37329],"onSale":false,"analyticsKey":"Lenskee metal-trimmed leather knee boots","id":1081811,"brandId":661,"colourIds":[100],"images":{"shots":["in","fr","ou","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1081811/1081811_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Joplin studded leather ankle boots","visible":true,"saleableStandardSizeIds":["00005_35_Shoes","00008_36.5_Shoes","00011_38_Shoes","00012_38.5_Shoes","00013_39_Shoes","00014_39.5_Shoes","00015_40_Shoes","00017_41_Shoes","00019_42_Shoes"],"price":{"currency":"GBP","divisor":100,"amount":147000},"leafCategoryIds":[18995,31958,21833,549,36642,37329],"onSale":false,"analyticsKey":"Joplin studded leather ankle boots","id":1082405,"brandId":1442,"colourIds":[2],"images":{"shots":["in","fr","ou","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1082405/1082405_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Jyoti floral-print cotton-blend jacquard midi dress","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":156500},"leafCategoryIds":[6034,2856,18092,25469,32214],"onSale":false,"analyticsKey":"Jyoti floral-print cotton-blend jacquard midi dress","id":1057928,"brandId":470,"colourIds":[3,19],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1057928/1057928_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Umbra ruffled fil coupé silk-blend maxi dress","visible":true,"saleableStandardSizeIds":["00001_XXXS_Clothing","00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":119000},"leafCategoryIds":[4987,2856,36651],"onSale":false,"analyticsKey":"Umbra ruffled fil coupé silk-blend maxi dress","id":1079361,"brandId":2770,"colourIds":[77],"images":{"shots":["in","ou","fr","bk","cu","e1"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1079361/1079361_{{shot}}_{{size}}.jpg"},"badges":["In_Stock"]},{"name":"Wrap-effect embellished hammered-satin dress","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":157000},"leafCategoryIds":[6040,6656,29318,18092,2856,32214],"onSale":false,"analyticsKey":"Wrap-effect embellished hammered-satin dress","id":1055788,"brandId":513,"colourIds":[2],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1055788/1055788_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Asymmetric Prince of Wales checked wool-blend coat","visible":true,"saleableStandardSizeIds":["00001_XXXS_Clothing","00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":286000},"leafCategoryIds":[608,19898,32335,36777,36601],"onSale":false,"analyticsKey":"Asymmetric Prince of Wales checked wool-blend coat","id":1057679,"brandId":523,"colourIds":[18],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1057679/1057679_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Belted alpaca and wool-blend coat","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing","00008_XXL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":226500},"leafCategoryIds":[608,32335,36921,36777,32025],"onSale":false,"analyticsKey":"Belted alpaca and wool-blend coat","id":1072735,"brandId":1805,"colourIds":[33,77],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1072735/1072735_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Xen floral-print silk-satin blouse","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":113500},"leafCategoryIds":[6228,26213,2855,6070],"onSale":false,"analyticsKey":"Xen floral-print silk-satin blouse","id":1050566,"brandId":470,"colourIds":[2,37],"images":{"shots":["in","ou","fr","bk","cu","ou2","e1"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1050566/1050566_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Wrap-effect striped metallic crochet-knit midi dress  ","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00008_XXL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":136000},"leafCategoryIds":[6040,2856,32214],"onSale":false,"analyticsKey":"Wrap-effect striped metallic crochet-knit midi dress  ","id":1058376,"brandId":78,"colourIds":[36,3],"images":{"shots":["in","ou","fr","bk","cu"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1058376/1058376_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]},{"name":"Wrap-effect printed crepe de chine midi dress","visible":true,"saleableStandardSizeIds":["00002_XXS_Clothing","00003_XS_Clothing","00004_S_Clothing","00005_M_Clothing","00006_L_Clothing","00007_XL_Clothing"],"price":{"currency":"GBP","divisor":100,"amount":149000},"leafCategoryIds":[6040,2856,32214,6656,29318],"onSale":false,"analyticsKey":"Wrap-effect printed crepe de chine midi dress","id":1055790,"brandId":513,"colourIds":[2],"images":{"shots":["in","ou","fr","bk","cu","e1"],"sizes":["dl","l","m","m2","mt","mt2","pp","s","sl","xl","xs","xxl"],"mediaType":"image/jpeg","urlTemplate":"{{scheme}}//cache.net-a-porter.com/images/products/1055790/1055790_{{shot}}_{{size}}.jpg"},"badges":["Seasonal_Pick","In_Stock"]}],"listInfo":{"limit":60,"offset":0,"total":5848}}'