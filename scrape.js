//Require modules
var fs = require('fs');
var json2csv = require('json2csv');
var Xray = require('x-ray');
var x = Xray();
var fields = ['Title','Price', 'Image URL', 'URL', 'Time'];
 
var url = 'http://www.shirts4mike.com/'; 
var date = new Date();

//Create a new promise
const getShirtData = new Promise((resolve, reject) => {

//Array to store shirt data
 var shirtArray = [];
       
//Calling the Xray module and specifying that I want all the links under the class 'products'
x(url + 'shirt.php',  '.products', ['a@href'])(function(error, shirtURL) {
    if(error) {return reject(error)};

 shirtURL.forEach(shirtURI => {
 
    x(shirtURI, {
        'Title': '.section h1',
        'Price': '.price',
        'Image URL': '.section img@src'

      })(function(error, data){
        if(error) {return reject(error)};

        data.URL = shirtURI;
        data.Title = data.Title.replace(data.Price + ' ', '');
        data.Time = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        //push the data to the array
        shirtArray.push(data);
        
       // once all of the shirt data has been retrieved, resolve the promise
        switch (true) {
        case shirtArray.length === shirtURL.length:
        return resolve(shirtArray);
        break;
        }

          });
    });
});

});

//Look for a folder called 'data'. If unexistant, then create it.
  if(!fs.existsSync('data')) {
    fs.mkdirSync('data');
    }

//Call .then on my promise
getShirtData.then(data => {  
  // converts data into csv-friendly format using json2csv
  var csv = json2csv({ data: data, fields: fields });

  //build current date
  var day = date.getDate().toString();
  var month = (date.getMonth() + 1).toString();
  var year = date.getFullYear().toString();

    function leadingZero(integer){
    return integer.length === 1 ? '0' + integer : integer;
  }

  // create the output file name string based on the specified project naming convention
  var outputFileName = 'data' + '/' + [leadingZero(day), leadingZero(month), year].join('-') + '.csv';

  // check if files exist in the data folder and remove them
 if (fs.readdirSync('data')) {
  fs.readdirSync('data').forEach(function(file){
    fs.unlinkSync('data' + '/' + file);
  }); 

 };

  //create the CSV
  fs.writeFileSync(outputFileName, csv);
  console.log('Check data folder, the CSV was created!');

}).catch(function(error) {
  var time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  //Catch errors and log them to a file
    if (!fs.existsSync('scraper-error.log')) {
        fs.writeFile('scraper-error.log', time + " " + error, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
    } else {
      fs.appendFileSync('scraper-error.log', '\r\n' + time + " " + error);
      console.log('The error was appended to the file');
    }    
});  


