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
		//Get the URL for every shirt into the URL array
		const $shirtLinks = $('.products').find('li').find('a');
		$shirtLinks.each((index, element) => {
			
			urls[index] = $(element).attr('href');
			console.log(urls[index]);
		});

		// The scraper should get the price, title, url and image url from the product page and save this information into a CSV file.

		for(let i = 0; i < urls.length; i++){
			let optionsII = {
				url: 'http://shirts4mike.com/' + urls[i],
				json: true,
				transform: function(body){
					return cheerio.load(body);
				}
			}
			rp(optionsII)
				.then(($) => {
					const shirtDetails = $('.shirt-details h1').text();
					const price = shirtDetails.split(' ')[0].trim();

					const breadcrumb = $('.breadcrumb').text();
					const title = breadcrumb.split('>')[1].trim();

					const imageUrl = $('.shirt-picture img').attr('src');
					const siteUrl = optionsII.url;



					console.log(title);
					console.log(price);
					console.log(imageUrl);
					console.log(siteUrl);
				})
				.catch((error) => {
					console.log(error);
				})
		}
			
		



	})
	.catch(error => {
		console.log(error);
	})


//The scraper should get the price, title, url and image url from the product page and save this information into a CSV file.

