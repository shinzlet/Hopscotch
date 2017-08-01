/*
	configReady:
		Will be true after the config file has been successfully loaded.
*/
let configReady = false;

/*
	config:
		An object containing config kv pairs. Comes preloaded with default data. In the event
		that the config cannot (or takes absurdly long to) load, these will be defaulted to.
*/
let config = {
	"scrollbarHiding": false,
	"newTabAction": "newBranch",
	"attemptStitching": true,
	"stitchFallback": "newBranch",
	"treeSimplification": true,
	"urlTypedAction": "subBranch",
	"browserNavigation": "tracked"
};

/*
	This code block loads the config.json and stores it in the variable 'config'.
*/
{
	let request = new XMLHttpRequest();

	request.onreadystatechange = () => {
	  if (request.readyState === 4 && request.status === 200) {
			if(request.status === 200) {
	    	config = JSON.parse(request.responseText);
				configReady = true;
			} else {
				console.log(`config.json could not be loaded. XMLHttpRequest status was ${request.status}`);
			}
	  }
	};

	request.onTimeout = () => {
		configReady = true;
	}

	request.open('GET', chrome.runtime.getURL('config.json'));
	request.send();
}


/*
	createNode(parent, data):
		Returns an object containing exposed node functions. Each node has a data object
		containing any relevant information to the node. This allows future expansion
		of what properties are recorded on each page. noAppend is an optional boolean
		that when set to true will prevent this node from being appened to the specified
		parent.

		As of now, 'data' should contain a node's name and path.
		E.g. {name: 'title', path: 'https://google.com'}
*/
function createNode(parent, data, noAppend) {
	let rootDistance = 0;
	let children = [];

	if(!data) data = {};

	/*
		getRootDistance():
			Returns the length of the path connecting this node to root. (how many
			times you can call .getParent() before getting to root)
	*/
	let getRootDistance = () => {
		return rootDistance;
	};

	/*
		appendChild(node):
			Pushes a child node onto the child array.
	*/
	let appendChild = node => {
		children.push(node);
	};

	/*
		getChildren():
			Returns the children array.
	*/
	let getChildren = () => {
		return children;
	};

	/*
		getParent():
			returns the node's parent (or undefined, if this node is root).
	*/
	let getParent = () => {
		return parent;
	};

	/*
		get(key):
			Returns the responding value from the data object for the provided key.
	*/
	let get = key => {
		return data[key];
	};

	/*
		getData():
			Returns the data object.
	*/
	let getData = () => {
		return data;
	};

	/*
		set(key, value):
			Assigns the value of data.key to the provided value parameter.
	*/
	let set = (key, value) => {
		data[key] = value;
	};

	let node = {
		appendChild: appendChild,
		getParent: getParent,
		getChildren: getChildren,
		getRootDistance: getRootDistance,
		get: get,
		getData: getData,
		set: set
	};

	if(parent) {
		rootDistance = parent.getRootDistance() + 1;
		if(!noAppend) parent.appendChild(node);
	}

	return node;
}

/*
	root:
		The root node from which all components of the histree originate.
*/
let root = createNode(undefined, {name: 'root', path: 'n/a'});

/*
	tabs:
		A kv binding each active tab ID to it's corresponding node on the tree.
		This is used as an anchor set to tie different tabs to their locations on the tree.

		'tabs' may also contain various tab flags relating to user experience.
		E.g. 1135: {node: object, flags: ['lost']}
			   tabId  pointer
*/
let tabs = {};

/*
	createTab(id, node, flags, tree):
		A method to create a hopscotch tab object and append it to 'tabs'.
		The only manditory parameter is 'id', but without a node this function is
		more or less useless.

		If the tab is lost (The user has not yet anchored the tab to the tree), the
		temporary tracking tree root can also be specified so that although the tab is lost,
		the browsing done in it will not be discarded (unless the tab is closed).
*/
function createTab(id, node, flags, root) {
	tabs[id] = {node: node, watching: node, flags: flags, root: root};
}

/*
	pointTab(id, location):
		This function changes where a tab by an id is pointing. This is called, for example,
		when a link is pressed and the tab is now somewhere else. This function must be used
		as opposed to simply reassigning tab.node, because that will cause the behaviour of
		browserNavigation: sticky, even if the user specified tracked.
*/
function pointTab(id, location) {
	// 'tracked' means to keep the browser current with where the user has navigated,
	// while sticky means that the browser will just continue showing the user where they
	// last navigated.

	tabs[id].node = location;
	if(config.browserNavigation === 'tracked') {
		tabs[id].watching = location;
	}
}

/*
	newTabRegex:
		A RegEx string used to identify new tab urls.
		E.g: https://www.google.ca/_/chrome/newtab?blahblahblah
		chrome://newtab/
		not:
		internet.com/chrome://newtab
*/
let newTabRegex = /^([a-z]+:\/\/www\.google\.\w+\/_\/)?chrome(:\/\/)?(\/)?newtab/;

/*
	validate(tabId, callback):
		This function checks if the tab is already being tracked. If not, it will attempt
		to stich it to the existing tree via it's history. If the user has disabled this
		or the branch cannot be found, config will be checked for the stitching fallback.
		After this process has been completed, the callback will be run.
*/
function validate(tabId, callback) {
	if(tabs[tabId]) { // No action needs to be taken; the tab is tracked.
		callback();
	} else {
		chrome.tabs.get(tabId, tab => {
			let stitched = false;
			if(config.attemptStitching) stitched = stitchToRoot();

			if(!stitched) {
				switch(config.stitchFallback) {
					case 'prompt':
						let tempRoot = createNode(undefined, {name: tab.title, url: tab.url}); // We don't know where this is connected, so we can't specify the parent.
						createTab(tabId, tempRoot, ['lost'], tempRoot);
						break;
					case 'newBranch':
						let node = createNode(root, {name: tab.title, url: tab.url});
						createTab(tabId, node);
						break;
				}
			}
			callback();
		});
	}
}

/*
	stitchToRoot(handle):
		This function takes the root node of a lost tree and attempts to stitch it onto
		a possible parent node on the main tree. Returns the operation's success as a boolean.
*/
function stitchToRoot(handle) {
	return false;
}

/*
	tabQueue:
		This variable will contain a length 2 array storing the current active tab,
		and the last active tab. This information is used if hopscotch's config is
		set to attach new tabs as nodes onto the last active tab.
*/
let tabQueue = undefined;

/*
	Callback is fired when a tab is created.
	Functionality:
		If the user has specified that all new tabs should be appended to the tree's root ('newBranch'),
		create a branch for this new tab. If the setting is 'subBranch', append the new tab's root onto
		the active node of the tab that invoked it's creation. If the user has specified to prompt them
		about this action, create a lost tab.
*/
chrome.tabs.onCreated.addListener(tab => {
	let newNode = {};
	switch(config.newTabAction) {
		case 'newBranch':
			newNode = createNode(root, {name: tab.title, url: tab.url});
			createTab(tab.id, newNode);
			break;
		case 'subBranch':
			chrome.tabs.get(tab.openerTabId || tab.id, opener => {
				validate(opener.id, () => {
					// This event happens before onCommitted will be called, so by pointing
					// this tab to it's invoker's node, onCommitted will still point this
					// to the right node, but it'll avoid node duplication.
					createTab(tab.id, tabs[opener.id].node);
				});
			});
			break;
		case 'prompt':
			newNode = createNode(undefined, {name: tab.title, url: tab.url});
			createTab(tab.id, newNode, ['lost', 'stall'], newNode);
			break;
	}
});

/*
	Callback is fired when a tab is removed/deleted.
	Functionality:
		When the tab is deleted, it becomes pointeless to attempt to track it,
		so this deletes the reference.
*/
chrome.tabs.onRemoved.addListener((tabId, details) => {
	if(tabs[tabId]) {
		delete tabs[tabId];
	}
});

/*
	Callback is fired when a tab's data is updated.
	Functionality:
		This is primarily used to change the names of nodes whose titles
		have not been set or have been changed.
*/
chrome.tabs.onUpdated.addListener((tabId, details) => {
	if(details.title && tabs[tabId]) {
		tabs[tabId].node.set('name', details.title);
	}
});

chrome.webNavigation.onBeforeNavigate.addListener(details => {

});

/*
	Callback is fired when a web navigation process reaches the stage where it is 'committed'
	(no going back).
	Functionality:
		This is where the majority of history tracking takes place. It checks if the navigation
		is going to an existing node (the current node's parent or child), and prevents duplication
		(unless the config prohibits it.)
*/
chrome.webNavigation.onCommitted.addListener(details => {
	validate(details.tabId, () => {
		if(details.frameId === 0) {
			// If the stall flag is present, we need to delete the flag and return.
			let stallIndex = (tabs[details.tabId].flags || []).indexOf('stall');
			if(stallIndex !== -1) {
				tabs[details.tabId].flags.splice(stallIndex, 1);
				return;
			}

			if((details.transitionQualifiers || []).indexOf('forward_back') === -1) {
				// forward_back events sometimes say they are a reload even though they are real navigation
				if(details.transitionType === 'reload') {
					// If this is just a reload of an existing page, we don't care. If it wasn't being
					// tracked, though, we don't want to return yet.
					if(tabs[details.tabId].node.get('url') === details.url)
						return;
				}
			}

			if(details.transitionType === 'typed' || details.transitionType === 'auto_bookmark') {
				let newNode = {};
				switch(config.urlTypedAction) {
					case 'prompt': // It's easiest just to reassign the tab to a new tree.
						newNode = createNode(undefined, {name: details.url, url: details.url});
						createTab(details.tabId, newNode, ['lost'], newNode);
						break;
					case 'subBranch':
						return; // This is the default behaviour.
					case 'newBranch':
						newNode = createNode(root, {name: details.url, url: details.url});
						pointTab(details.tabId, newNode);
						break;
				}
			}

			let currentNode = tabs[details.tabId].node;
			let shouldReturn = false;

			if(config.treeSimplification) {
				if(currentNode.getParent()) {
					// If the parent node was just a new tab
					if(newTabRegex.test(currentNode.getParent().get('url'))) {
						// Overwrite it with this node's data and don't repoint
						console.log("Active");
						asphalt.printTree(root);
						currentNode.getParent.set('url', details.url);
						asphalt.printTree(root);
						// The name will be updated by onUpdated after this, so we don't change it
						return;
					}

					if(currentNode.getParent().get('url') === details.url) {
						pointTab(details.tabId, currentNode.getParent());
						return;
					}
				}

				currentNode.getChildren().forEach(child => {
					if(child.get('url') === details.url) {
						pointTab(details.tabId, child);
						shouldReturn = true;
						return;
					}
				});

				if(shouldReturn) return;
			}

			qualifiers = details.transitionQualifiers || [];

			let newNode = createNode(currentNode, {name: details.url, url: details.url});
			pointTab(details.tabId, newNode);
		} else {
			// TODO: Do stuff? Maybe?
			// Note for future me: I think that this won't be needed if you can
			// get onUpdated to capture in-page reloads (like on google when you type
			// a query and it does some sneaky stuff that doesn't fire onCommitted)
		}
	});
});

/*
	Callback is fired when the DOM content of a page finishes loading.
	Functionality:
		This is used to trigger events that cannot be done until the page's content has been loaded.
		For example, the attention widget cannot be pulled up if the page isn't yet loaded, so it
		must be done here.
*/
chrome.webNavigation.onDOMContentLoaded.addListener(details => {
	validate(details.tabId, () => {
		if(details.frameId === 0) {
			if(tabs[details.tabId].flags &&
				 tabs[details.tabId].flags.indexOf('lost') !== -1) {
				chrome.tabs.sendMessage(details.tabId, {
					action: 'launchWidget',
					requirement: 'resolveLocation'
				});
			}
		}
	});
});

/*
	Callback is fired when a contentscript sends a message of some sort that we need
	to deal with. This is primarily used to send the tab links, but also to carry out
	resolutions.
*/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	let id = sender.tab.id;

	validate(id, () => {
		// I'm not using switch case cause I'm not up for dealing with the dumb scoping
		if(message.action === 'fetchLinks') {
			let watchNode = tabs[id].watching;
			if((tabs[id].flags || []).indexOf('lost') !== -1) watchNode = root;
			let data = [];

			watchNode.getChildren().forEach(child => {
				data.push({name: child.get('name'), url: child.get('url')});
			});

			sendResponse({links: data, canRecede: (watchNode.getParent() !== undefined)});
		} else if(message.action === 'getConfig') {
			sendResponse(config);
		} else if(message.action === 'backstep') {
			let watchNode = tabs[id].watching;
			if(watchNode.getParent()) {
				tabs[id].watching = watchNode.getParent();
			}
			sendResponse({success: (watchNode.getParent() !== undefined)});
		} else if(message.action === 'stepinto') {
			tabs[id].watching.getChildren().forEach(node => {
				if(node.get('url') === message.handle) {
					tabs[id].watching = node;
					return;
				}
			});
		} else if(message.action === 'remove') {
			tabs[id].watching.getChildren().forEach((node, index) => {
				if(node.get('url') === message.handle) {
					// If the node we are deleting is at a lower node level than any of the nodes being navigated,
					// We need to close those tabs.
					let dist = node.getRootDistance();
					Object.keys(tabs).forEach(id => {
						if(tabs[id].node.getRootDistance() > dist) {
							delete tabs[id];
							chrome.tabs.remove(parseInt(id));
						} else if(tabs[id].node.getRootDistance === dist) {
							// If a tab's node is being deleted we have to delete it
							if(node.get('url') === tabs[id].node.get('url')) {
								delete tabs[id];
								chrome.tabs.remove(parseInt(id));
							}
						};
					});
					// Remove the child.
					tabs[id].watching.getChildren().splice(index, 1);
					delete node;
					return;
				}
			});
		} else if(message.action === 'navigate') {
			let watchNode = tabs[id].watching;
			watchNode.getChildren().forEach(child => {
				if(child.get('url') === message.handle) {
					pointTab(id, child);
					(tabs[id].flags || (tabs[id].flags = [])).push('stall');
					chrome.tabs.update(id, {url: child.get('url')});
					return;
				}
			});
		}
	});
});

/*
	asphalt:
		A small debugging utility.
*/
let asphalt = (function() {
	let allowed = [];
	let party = false;

	let bindListeners = () => {
		chrome.tabs.onCreated.addListener(details => {
			if(party || isAllowed('oncreated')) {
				console.log("Tab Created: ", details);
			}
		});

		chrome.tabs.onRemoved.addListener((tabId, details) => {
			if(party || isAllowed('onremoved')) {
				console.log("Tab Removed: ", tabId, details);
			}
		});

		chrome.tabs.onUpdated.addListener((tabId, details) => {
			if(party || isAllowed('onupdated')) {
			console.log("Tab Updated: ", tabId, details);
		}
		});

		chrome.webNavigation.onBeforeNavigate.addListener(details => {
			if(party || isAllowed('onbeforenavigate')) {
				console.log("OnBeforeNavigate Fired: ", details);
			}
		});

		chrome.webNavigation.onCommitted.addListener(details => {
			if(party || isAllowed('oncommitted')) {
				console.log("OnCommitted Fired: ", details);
			}
		});

		chrome.webNavigation.onDOMContentLoaded.addListener(details => {
			if(party || isAllowed('ondomcontentloaded')) {
				console.log("OnDOMContentLoaded Fired: ", details);
			}
		});
	};

	let allow = name => {
		if(allowed.indexOf(name) === -1) allowed.push(name);
	};

	let stop = name => {
		let index = allowed.indexOf(name);
		if(index === -1) return;
		allowed.splice(index, 1);
	};

	let isAllowed = name => {
		return allowed.indexOf(name) !== -1;
	};

	let shh = () => {
		allowed = [];
		party = false;
	};

	let printTree = node => {
		let pname = "(hopscotch)";
		if(node.getParent()) pname = node.getParent().get('name');
		console.log(`${pname} -> ${node.get('name')}`);

		if(node.getChildren()) {
			node.getChildren().forEach(child => {
				printTree(child);
	  	});
		}
	};

	let startParty = () => {
		party = true;
	};

	let show = () => {
		allowed.forEach(e => console.log);
	};

	let list = () => {
		console.log("onCreated\nonRemoved\nonUpdated\nonBeforeNavigate\nonCommitted\nonDOMContentLoaded");
	}

	return {
		start: bindListeners,
		allow: allow,
		stop: stop,
		shh: shh,
		printTree: printTree,
		party: startParty,
		show: show,
		list: list
	};
})();
