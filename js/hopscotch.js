chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
	console.log(details);
});

chrome.webNavigation.onCommitted.addListener(function(details) {
	console.log(details);
});
