var request = require('request');
var cheerio = require('cheerio');
var robots = require('robots'), robotsParser = new robots.RobotsParser();

var UrlManipulator = function()
{
	this.url = require('url');
};

UrlManipulator.prototype.getRobotsTxtPath = function(url)
{
	parsedUrl = this.url.parse(url);
	var robotsTxtPath = parsedUrl.protocol + (parsedUrl.slashes ? "//" : "") + parsedUrl.host + "/robots.txt";
	return robotsTxtPath;
};

UrlManipulator.prototype.resolve = function(url, link)
{
	return this.url.resolve(url, link);
};

UrlManipulator.prototype.getPath = function(url)
{
	return this.url.parse(url).path;
};

var Crawler = function(seedValues)
{
	this.seedValues = seedValues || ["http://ryanriddle.info"];
	this.pagesQueue = this.seedValues.slice(0).reverse();	//slice(0).reverse() copies the array.
	this.url = this.pagesQueue.shift();
	this.visitedPages = [];
	this.failedPages = [];
	this.disallowedPages = [];
	this.urlManipulator = new UrlManipulator();
};

Crawler.prototype.getRobotsTxtPath = function(url)
{
	return this.urlManipulator.getRobotsTxtPath(url);
};

Crawler.prototype.requestAndHandle = function()
{
	var url = this.url;

	if (typeof url !== "string")
		return;
	
	if (this.visitedPages.indexOf(url) < 0)
	{
		var that = this;
		robotsParser.setUrl(this.getRobotsTxtPath(url), function(parser, success)
		{
			if (success)
			{
				parser.canFetch("*", that.urlManipulator.getPath(url), function(access)
				{
					if (access)
					{
						request(url, function(error, response, body)
						{	
							if (!error && response.statusCode === 200)
							{
								console.log(url);
								$ = cheerio.load(body);
								var aTags = $('a');
								for (var i = 0; i < aTags.length; i++)
								{
									var tag = aTags[i];
									var link = $(tag).attr('href');
									var newURL = link && that.urlManipulator.resolve(url, link);
									if (newURL) that.pagesQueue.push(newURL);
								}
								that.visitedPages.push(url);
							}
							else
							{
								console.log("failed to fetch page");
								that.failedPages.push(url);
							}

							that.url = that.pagesQueue.shift();
							that.requestAndHandle();
						});
					}
					else
					{
						console.log("disallowed in robots.txt");
						that.disallowedPages.push(url);
						that.url = that.pagesQueue.shift();
						that.requestAndHandle();
					}
				});
			}
			else
			{
				console.log("robots setUrl failed");
				that.failedPages.push(url);
				that.url = that.pagesQueue.shift();
				that.requestAndHandle();
			}
		});
	}			
	else
	{
		console.log("already visited this page");
		this.url = this.pagesQueue.shift();
		this.requestAndHandle();
	}
};

var crawler = new Crawler(["http://reddit.com"]);
crawler.requestAndHandle();
