var url = require('url');

module.exports = {
	getRobotsTxtPath: function(address)
	{
		var parsedUrl = url.parse(address);
		var robotsTxtPath = parsedUrl.protocol + (parsedUrl.slashes ? "//" : "") + parsedUrl.host + "/robots.txt";
		return robotsTxtPath;
	},

	resolve: function(address, resource)
	{
		return url.resolve(address, resource);
	},

	getPath: function(address)
	{
		return url.parse(address).path;
	},
};
