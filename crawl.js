var request = require('request');
var cheerio = require('cheerio');
var robots = require('robots'), robotsParser = new robots.RobotsParser();
var queueManager = require('./queueManager');
var urlManipulator = require('./urlManipulator');

var Crawler = function() {};

Crawler.prototype.crawlNext = function()
{
	var url = queueManager.nextPage();

	if (typeof url !== "string")
		return;
	
	var that = this;
	request(urlManipulator.getRobotsTxtPath(url), function(error, response, body)
	{
		if (!error && (response.statusCode === 200 || response.statusCode === 404))
		{
			//parse and canFetch still work if the robots.txt does not exist.
			robotsParser.parse(body);
			robotsParser.canFetch("*", urlManipulator.getPath(url), function(access)
			{
				if (access)
				{
					request(url, function(error, response, body)
					{	
						if (!error && response.statusCode === 200)
						{
							console.log(url);
							queueManager.addVisited(url);
							$ = cheerio.load(body);
							var aTags = $('a');
							for (var i = 0; i < aTags.length; i++)
							{
								var tag = aTags[i];
								var link = $(tag).attr('href');
								var newUrl = link && urlManipulator.resolve(url, link);
								if (newUrl) queueManager.addToQueue(newUrl);
							}
						}
						else
						{
							console.log("failed to fetch page: " + url);
							queueManager.addFailed(url);
						}
						
						that.crawlNext();
					});
				}
				else
				{
					console.log("disallowed in robots.txt: " + url);
					queueManager.addDisallowed(url);
					that.crawlNext();
				}
			});
		}
		else
		{
			console.log("Unexpected response for /robots.txt: " + url);
			queueManager.addFailed(url);
			that.crawlNext();
		}
	});
};

var crawler = new Crawler();
seeds = process.argv.slice(2);
if (seeds.length === 0) seeds.push("http://google.com");
queueManager.initialize(seeds);
crawler.crawlNext();
