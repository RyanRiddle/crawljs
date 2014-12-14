var seedPages;
var pagesQueue, visitedPages, failedPages, disallowedPages;
var alreadyVisited = function(url)
{
	return visitedPages.indexOf(url) > -1;
};

pagesQueue = visitedPages = failedPages = disallowedPages = [];

module.exports = {
	initialize:  function(seedValues)
	{
		seedPages = seedValues;
		pagesQueue = seedPages.slice(0).reverse();   //slice(0).reverse() copies the array.
	},

	nextPage: function()
	{
		//remove page from top of the pages to visit queue
		//and return it
		var page = pagesQueue.shift();
		return page;
	},

	addToQueue: function(url)
	{
		if (!alreadyVisited(url))
			pagesQueue.push(url);
	},

	addVisited: function(url)
	{
		visitedPages.push(url);
	},

	addFailed: function(url)
	{
		failedPages.push(url);
	},

	addDisallowed: function(url)
	{
		disallowedPages.push(url);
	}
};
