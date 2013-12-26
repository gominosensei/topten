// ==UserScript==
// @name       TopTen
// @version    0.5
// @description  Block URLs to top ten lists and other such nonsense
// @include    *
// ==/UserScript==

console.log("TopTen loaded");

Array.prototype.contains = function(string)
{
	if (!this) { return false; }
	//console.log('contains: ' + string + ' - ' + this.indexOf(string));
	if (this.indexOf(string) > -1)
	{ return true; }
	else { return false; }
}

// ==================================
// == Define the patterns to match ==
// ==================================

// These aren't in an external config file because Greasemonkey can't access local files, and getting something over the Internet would take too long.  

// 10 TIPS on how to waste your time
//    This pattern looks for the words specified here after a number at the beginning of the link text.
var patternNumber = [
	'cool',
	'amazing',
	'sports',
	'very',
	'tips',
	'ideas',
	'most',
	'least',
	'reasons',
	'ways to'
	]

// 10 really stupid things YOU WILL READ ANYWAY
//    This pattern looks for link text with a number, one to three other words, and then the word or words specified here.
var patternNumberPlusThree = [
	'that',
	'who',
	'stories',
	'you missed',
	'stocks',
	'moments'
	]
	
// Specifically defined patterns (regex)
var patterns = [
	'!',
	'best.*worst',
	'worst.*best',
	'the problem with',
	'^watch this',
	'worst\.? [A-Z\.]+? ever',
	'you won\'t believe',
	'save you from',
	'most shared',
	'slideshow',
	'celebrit',
	'craziest',
	
	'top.*(in)?(of)? 20[0-9]{2}',
	'top.*of 20[0-9]{2}',
	'top [0-9]+',
	
	'kardashian',
	'jersey shore',
	'miley',
	'war on christmas',
	'duck dynasty',
	'obamacare',
	'santa',
	'tiger woods',
	'biggest mistake'
	];
	
// Make all patterns case insensitive	
for (var i = 0; i < patterns.length; i++)
{
	patterns[i] = new RegExp(patterns[i], "ig");
}

// Add constructed patterns to list
for (var i = 0; i < patternNumber.length; i++)
{
	patterns.push(new RegExp('^(The )?[0-9]+ ([A-Z]+ ){,3}' + patternNumber[i], "ig"));	
}	

for (var i = 0; i < patternNumberPlusThree.length; i++)
{
	patterns.push(new RegExp('^(The )?[0-9]+ ([A-Z]+ ){1,3}' + patternNumberPlusThree[i], "ig"));	
}	

// Site whitelist.  Links to or from these sites won't be blocked.
var whiteList = [
	'stackoverflow.com',
	'www.ebay.com',
	'www.google.com'
	];
	
var blackList = [
	];

	
// ======================================
// == Check if the site is whitelisted ==
// ======================================

// Check if a URL is in a whitelisted domain
function checkWhiteList(url)
{
	var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
	var domain = matches && matches[1]; 

	return (whiteList.contains(domain));	
}

var url = document.URL;
if (checkWhiteList(url))
{
	console.log(url + ' is whitelisted, so no links from it will be blocked.');
	return;
}

// ===========================================
// == Block all links to specified patterns ==
// ===========================================

// Replace the text and URL in a link so it cannot be followed
function blockLink(link, pattern)
{
	console.log('Blocking ' + link.innerHTML + ' (' + link.href);
	var blocked = 'Blocked by TopTen';
	if (link.innerHTML.indexOf(blocked) > -1)
	{
		console.log('Already blocked');
		return;
	}
	link.href = 'javascript:void(' + link.innerText + ')';
	link.innerHTML = blocked + ' (' + pattern + ')';
	link.onclick = 'return false;';
}

// Check if a link should be blocked, and block it if so
function checkLink(link, patterns, badLinks)
{
	var linkText = link.innerHTML;
	console.log('Checking ' + linkText);
	
	if (checkWhiteList(link.href)) { return; }
		
	for(var j = 0; j < patterns.length; j++)
	{
		// Check if the link text matches a pattern
		if (linkText.match(patterns[j]))
		{
			console.log ('==> ' + linkText + ' matches ' + patterns[j]);
			badLinks.push(link.href);
			blockLink(link, patterns[j]);
			break;
		}
	}
}


var links = document.getElementsByTagName('a');
var badLinks = [];    // this will store known bad links so they can be cleaned up later

// First pass: loop over links in the page and check them against the patterns
for(var i=0; i<links.length; i++)
{
	checkLink(links[i], patterns, badLinks);
}

// Second pass: loop over the links again and remove any with the same URL that matched a pattern in the first pass
for(var i=0; i<links.length; i++)
{
	var thisLink = links[i];
	if (badLinks.contains(thisLink.href))
	{
		blockLink(links[i], "known bad link");
	}
}
