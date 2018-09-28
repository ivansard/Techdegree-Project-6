const cheerio = require('cheerio');
const rp = require('request-promise');
const fs = require('fs');

const tShirts = [];
const urls = [];

//Program your scraper to check for a folder called ‘data’. 
//If the folder doesn’t exist, the scraper should create one. If the folder does exist, the scraper should do nothing.

if(!fs.existsSync('./data')){
	fs.mkdirSync('./data');
}
//Enter http://shirts4mike.com/shirts.php as single entry point to scrape information for 8 tee-shirts from the site,
//

const options = {
	url: 'http://shirts4mike.com/shirts.php',
	json: true,
	transform: function(body){
		return cheerio.load(body);
	}
}

rp(options)
	.then(($) => {
		const $shirtLinks = $('.products').find('li').find('a');
		$shirtLinks.each((index, element) => {
			
			urls[index] = $(element).attr('href');
			console.log(urls[index]);
		})

	})
	.catch(error => {
		console.log(error);
	})


//The scraper should get the price, title, url and image url from the product page and save this information into a CSV file.

