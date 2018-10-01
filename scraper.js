const cheerio = require('cheerio');
const rp = require('request-promise');
const fs = require('fs');
const csv = require('fast-csv');
const json2csv = require('json2csv');

const tShirts = [];
const urls = [];
const today = new Date();

const currentDate = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;

const entryPoint = 'http://shirts4mike.com/shirts.php';

const csvTableHeaders = ['Title', 'Price', 'Image URL', 'URL', 'Time of Entry'];
const Json2csvParser = require('json2csv').Parser;

//Function which creates the data folder
function createDataFolder(){
	if(!fs.existsSync('./data')){
	fs.mkdirSync('./data');
	}
}


//Making a call towards the entry point
const options = {
	url: entryPoint,
	json: true,
	transform: function(body){
		return cheerio.load(body);
	}
}

//Obtaining the urls for further search
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
		logError(error);
	})

//Function that synchronously goes through all urls to obtain the shirt data
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

						//Creating the shirt object and pushing it into the shirt array
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
						logError(error);
					})
			} else {
				//Creating the data folder and writing the requested csv file
				createDataFolder();
				writeToCsvFile(tShirts);
			}
		}
		return next();
		
}			

function writeToCsvFile(data){
	try {
	  const parser = new Json2csvParser({csvTableHeaders});
	  const csvData = parser.parse(data);
	  
	  fs.writeFileSync(`./data/${currentDate}.csv`, csvData);
	  console.log('Successfuly written to file!');
	} catch (error) {		
		logError(error);
	}
}

function logError(error){
	fs.appendFile('./scraper-error.log', '\r\n' + `[${today.toString()}] ${error.message} ` + '\r\n', function(err){
		if(err) throw err;
		console.log('Written to error log file');
		});
}

