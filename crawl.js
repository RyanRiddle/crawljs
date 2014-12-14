var request = require('request');
var cheerio = require('cheerio');
var urlManipulator = require('url');

var Crawler = function(seedValues)
{
	this.seedValues = seedValues || ["http://ryanriddle.info"];
	this.pagesQueue = this.seedValues.slice(0).reverse();	//slice(0).reverse() copies the array.
	this.url = this.pagesQueue.shift();
	this.pagesVisited = [];
	this.pagesFailed = [];
};

Crawler.prototype.requestAndHandle = function()
{
	if (typeof this.url !== "string")
		return;
	
	if (this.pagesVisited.indexOf(this.url) < 0)
	{
		var that = this;
		request(this.url, function(error, response, body)
		{	
			if (!error && response.statusCode === 200)
			{
				console.log(that.url);
				$ = cheerio.load(body);
				var aTags = $('a');
				for (var i = 0; i < aTags.length; i++)
				{
					var tag = aTags[i];
					var link = $(tag).attr('href');
					var newURL = link && urlManipulator.resolve(that.url, link);
					if (newURL) that.pagesQueue.push(newURL);
				}
				that.pagesVisited.push(that.url);
			}
			else
			{
				console.log("failed to fetch page");
				that.pagesFailed.push(that.url);
			}

			that.url = that.pagesQueue.shift();
			that.requestAndHandle();
		});
	}
	else
	{
		console.log("already visited this page");
		this.url = this.pagesQueue.shift();
		this.requestAndHandle();
	}
};

var crawler = new Crawler(["http://stadiumfanatic.com"]);
crawler.requestAndHandle();
