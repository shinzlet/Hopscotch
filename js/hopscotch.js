/*
	createNode(parent, data):
		Returns an object containing exposed node functions. Each node has a data object
		containing any relevant information to the node. This allows future expansion
		of what properties are recorded on each page.

		As of now, 'data' should contain a node's name and path.
		E.g. {name: 'title', path: 'https://google.com'}
*/
function createNode(parent, data) {
	let rootDistance = 0;
	let children = [];

	if(parent) {
		rootDistance = parent.getRootDistance() + 1;
	}

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

	return {
		appendChild: appendChild,
		getParent: getParent,
		getChildren: getChildren,
		getRootDistance: getRootDistance,
		get: get,
		getData: getData,
		set: set
	};
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
		E.g. 1135: {node: object, flags: ['resolveLocation']}
			   tabId  pointer
*/
let tabs = {};

/*
	flagNames:
		An object containing the names of various possible tab flags.
*/
let flagNames = {resolveLocation: 'resolveLocation', lost: 'lost'};

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
	tabs[id] = {node: node, flags: flags, root: root};
}

/*
	validate(tabId, callback):
		This function checks if the tab is already being tracked. If not, it will attempt
		to stich it to the existing tree via it's history. If the user has disabled this
		or the branch cannot be found, a lost branch will be created for this tab until
		the user completes the resolution. After this process has been completed, the callback
		will be run.
*/
function validate(tabId, callback) {
	if(tabs[tabId]) { // No action needs to be taken; the tab is tracked.
		callback();
	} else if(!tabs[tabId]) {
		chrome.tabs.get(tabId, tab => {
			// TODO: Implement setting check and stitching operation
			let tempRoot = createNode(undefined, ); // We don't know where this is connected, so we can't specify the parent.
			createTab(tabId, tempRoot, [flagNames.lost], tempRoot);
		});
	}
}

/*
	Callback is fired when a tab is created.
	Functionality:
		If the user has specified that all new tabs should be appended to the tree's root,
		create a branch for this new tab.
*/
chrome.tabs.onCreated.addListener(tab => {

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

chrome.tabs.onUpdated.addListener((tabId, details) => {

});

chrome.webNavigation.onBeforeNavigate.addListener(details => {

});

chrome.webNavigation.onCommitted.addListener(details => {
	validate(details.tabId, () => {

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
				 tabs[details.tabId].flags.indexOf(flagNames.resolveLocation) !== -1) {
				chrome.tabs.sendMessage(details.tabId, {action: 'launchWidget'});
			}
		}
	});
});

/*
	asphalt:
		A small debugging utility. By executing ashphalt.start, useful information
		will start printing when events are fired.
*/
let asphalt = (function() {
	let bindListeners = () => {
		chrome.tabs.onCreated.addListener(details => {
			console.log("Tab Created: ", details);
		});

		chrome.tabs.onRemoved.addListener((tabId, details) => {
			console.log("Tab Removed: ", tabId, details);
		});

		chrome.tabs.onUpdated.addListener((tabId, details) => {
			console.log("Tab Updated: ", tabId, details);
		});

		chrome.webNavigation.onBeforeNavigate.addListener(details => {
			console.log("OnBeforeNavigate Fired: ", details);
		});

		chrome.webNavigation.onCommitted.addListener(details => {
			console.log("OnCommitted Fired: ", details);
		});
	};

	return {
		start: bindListeners
	};
})();
