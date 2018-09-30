const cheerio = require('cheerio');
const rp = require('request-promise');
const fs = require('fs');
const csv = require('fast-csv');
const json2csv = require('json2csv');

const tShirts = [];
const urls = [];
const today = new Date();

const currentDate = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;

const csvTableHeaders = ['Title', 'Price', 'Image URL', 'URL', 'Time of Entry'];
const Json2csvParser = require('json2csv').Parser;

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
		getShirtDetailsAndWriteToCsv();		
	})
	.catch(error => {
		console.log(error);
	})


function getShirtDetailsAndWriteToCsv(){
		let i = 0;
		function next(){
			console.log(i);
			if(i < urls.length){
				let options = {
					url : 'http://shirts4mike.com/' + urls[i],
					json: true,
					transform: function(body){
						return cheerio.load(body);
					}
				}

				rp(options)
					.then(($) => {
						const shirtDetails = $('.shirt-details h1').text();
						const price = shirtDetails.split(' ')[0].trim();

						const breadcrumb = $('.breadcrumb').text();
						const title = breadcrumb.split('>')[1].trim();

						const imageUrl = $('.shirt-picture img').attr('src');
						const pageUrl = options.url;

						let tShirt = {
							title: title,
							price: price,
							imageUrl: imageUrl,
							pageUrl: pageUrl,
							timeOfEntry: new Date().toString()
						};

						tShirts.push(tShirt);
						i = i+1;
						return next();
					})
					.catch(error => {
						console.error(error.message);
					})
			} else {
				writeToCsvFile(tShirts);
			}
		}
		return next();
		
}			

function writeToCsvFile(data){
	console.log('Im here');
	try {
	  const parser = new Json2csvParser({csvTableHeaders});
	  const csvData = parser.parse(data);
	  
	  fs.writeFileSync(`./data/n/${currentDate}.csv`, csvData);
	  console.log('Successfuly written to file!');
	} catch (err) {		
	  logError(err);
	}
}

function logError(error){
	fs.appendFile('./scraper-error.log', '\r\n' + `[${today.toString()}] ${error.message} ` + '\return\n', function(err){
		if(err) throw err;
		console.log('\n' + `[${today.toString()}] ${error.message} ` + '\n');
		console.log('Written to error log file');
		});
}

