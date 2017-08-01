const hsp = "hopscotch-toolbox-"; // Hopscotch prefix (for id seperation)

let toolbox = (function() {
	/*
		components:
			Contains references to all useful parts of the toolbox. Some DOM elements
			have been injected with other functions - buttons, for example, contain
			and activation and deactivation function.
	*/
	let components = {};

	/*
		currentMenu:
			Contains a string indicating which menu is currently being displayed. This
			variable will contain the last active menu if the menu has been closed.

			Also see: isOpen()
	*/
	let currentMenu = 'browser';

	/*
		menuOpen:
			Contains a boolean indicating whether or not the menu is currently open.

			Also see: isOpen()
	*/
	let menuOpen = false;

	/*
		widgetVisible:
			Contains a boolean indicating whether or not the attention widget is
			currently visible.
	*/
	let widgetVisible = false;

	/*
		hovered:
			True when the mouse is hovered over the hopscotch frame.
	*/
	let hovered = false;

	/*
		buildFrame():
			Creates a document fragment and populates it with the DOM structure.
			Contains two structures; button and panel. These provide functionality
			for the small icons in the toolbox tool & chin bars, and the ability for
			page selection.
	*/
	function buildFrame() {
		let button = (name, callback, /*optional callback param*/id) => {
			if(id === undefined) id = name; // If id is not provided, use name instead
			let elem = createElement('div', {class: `${hsp}button ${hsp}button-${name}`});
			elem.addEventListener('click', () => {
				if(elem.classList.contains(`${hsp}disabled`)) return; // We don't care.
				callback(id);
			});

			elem.activate = () => {
				elem.classList.toggle(`${hsp}active`, true);
				return elem;
			}

			elem.deactivate = () => {
				elem.classList.toggle(`${hsp}active`, false);
				return elem;
			}

			return elem;
		}

		let panel = (names, callback) => {
			let buttons = [];

			let cb = id => {
				buttons.forEach((elem, index) => {
					elem.classList.toggle(`${hsp}active`, id === index);
				});

				callback(names[id], id);
			};

			buttons = names.map((name, iter) => { return button(name, cb, iter); });
			if(buttons[0]) buttons[0].activate();

			return {
				appendTo: parent => {
					buttons.forEach(elem => { parent.appendChild(elem); });
				}
			};
		}

		// Initialize components
		components.docfrag = document.createDocumentFragment();

		components.wrapper = createElement('span');

		components.frame = createElement('div', {id: `${hsp}frame`});
		components.widget = createElement('div', {id: `${hsp}attention-widget`});

		components.sandwich = createElement('div', {id: `${hsp}sandwich`});

		components.slices = ['browser', 'settings'];
		components.browser = createElement('div', {class: `${hsp}slice ${hsp}browser ${hsp}active`});
		components.settings = createElement('div', {class: `${hsp}slice ${hsp}settings`});

		components.toolbar = createElement('div', {class: `${hsp}bar`, id: `${hsp}toolbar`});
		components.chinbar = createElement('div', {class: `${hsp}bar`, id: `${hsp}chinbar`});

		components.toolbar.buttons = panel(components.slices, switchMenu);
		components.chinbar.buttonNames = ['backstep', 'add', 'remove', 'resolve'];
		components.chinbar.buttons = components.chinbar.buttonNames.map(name => {
			return button(name, chinbarButtonPressed);
		});
		components.chinbar.buttons[components.chinbar.buttonNames.indexOf('resolve')]
			.classList.toggle(`${hsp}disabled`);

		// Assemble structure
		components.docfrag.appendChild(components.wrapper);
		components.wrapper.appendChild(components.widget);
		components.wrapper.appendChild(components.frame);
		components.frame.appendChild(components.toolbar);
		components.frame.appendChild(components.sandwich);
		components.frame.appendChild(components.chinbar);
		components.sandwich.appendChild(components.browser);
		components.sandwich.appendChild(components.settings);
		components.toolbar.buttons.appendTo(components.toolbar);
		components.toolbar.appendChild(button('reload', () => {
			loadLinks();
		}));
		components.chinbar.buttons.forEach(button => { components.chinbar.appendChild(button); });
	}

	/*
		injectToolbox():
			Injects the assembled toolbox DOM into the document body. If the page isn't quite loaded,
			it creates an event listener to call itself when the page is ready.
	*/
	function injectToolbox() {
		let inject = function() {
			document.body.appendChild(components.docfrag);
		}

		if(document.readyState === 'complete') {
			inject();
		} else {
			document.addEventListener('DOMContentLoaded', () => {
				inject();
			});
		}
	}

	/*
		bindToolbox():
			Attaches event handlers relating to the operation of the toolbox and the
			attention widget.
	*/
	function bindToolbox() {
		bindShortcut({keys: ['Escape'], callback: () => {
			if(isOpen()) {
				toggle(false);
			}
		}});

		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			switch(message.action) {
				case 'launchWidget':
					toggleWidget(true);
					break;
				case 'reload':
					loadLinks();
					break;
			}

			if(message.requirement) {
				switch(message.requirement) {
					case 'resolveLocation':
						components.browser.resolve = true;
						components.chinbar.buttons[components.chinbar.buttonNames.indexOf('resolve')]
							.classList.toggle(`${hsp}disabled`, false);
						break;
				}
			}
		});

		components.widget.addEventListener('click', () => {
			toggleWidget(false);
			toggle(true);
		});

		document.addEventListener('click', () => {
			if(!hovered && menuOpen) toggle(false);
		});

		components.frame.addEventListener('mouseenter', e => {
			hovered = true;
			document.body.style.overflowY = 'hidden';
		});

		components.frame.addEventListener('mouseleave', e => {
			hovered = false;
			document.body.style.overflowY = 'auto';
		});
	}

	/*
		loadRoots():
			Retrieves a list of root nodes and installs them into the 'root' tab.
	*/
	function loadRoots() {

	}

	/*
		loadLinks():
			Deletes existing links and reloads them from hopscotch.
	*/
	function loadLinks() {
		let link = (name, url) => {
			let elem = createElement('div', {class: `${hsp}link`});

			let shorten = (text, len) => {
				let strlength = text.length;
				if(strlength > len)
					text = text.substring(0, len / 2 - 3) + "..." + text.substring(strlength - len / 2, strlength);
				return text;
			}

			let fixedName = shorten(name, 64);
			let fixedUrl = shorten(url, 40);

			elem.appendChild(createElement('p').setTextContent(fixedName));
			elem.appendChild(createElement('p').setTextContent(fixedUrl));

			elem.addEventListener('click', event => {
				if(elem.classList.contains(`${hsp}active`)) {
					chrome.runtime.sendMessage({action: 'stepinto', handle: url});
					loadLinks();
					return;
				}
				chrome.runtime.sendMessage({action: 'navigate', handle: url});
				toggle();
			});

			elem.addEventListener('contextmenu', event => {
				event.preventDefault();

				elem.classList.toggle(`${hsp}active`);

				// If this is off now, we've just right clicked on the active link again.
				// That means the user is opting out of action mode, and we need to disable it.
				if(!elem.classList.contains(`${hsp}active`)) {
					components.browser.actionMode = false;
					components.browser.selection = undefined;
					return false;
				}

				if(components.browser.selection) { // If something was selected before this
					// Then we want to disable it to avoid duplicate selection
					components.browser.selection.elem.classList.toggle(`${hsp}active`, false);
				}

				components.browser.selection = {elem: elem, url: url};
				components.browser.actionMode = true;

				return false;
			});

			return elem;
		};

		chrome.runtime.sendMessage({action: 'fetchLinks'}, reply => {
			let fragment = document.createDocumentFragment();
			components.browser.links = [];

			if(reply.links) {
				reply.links.forEach((elem, index) => {
					components.browser.links.push(link(elem.name, elem.url));
					fragment.appendChild(components.browser.links[index]);
				});
			}

			let backstep = components.chinbar.buttons[components.chinbar.buttonNames.indexOf('backstep')];

			backstep.classList.toggle(`${hsp}disabled`, !reply.canRecede);

			while(components.browser.firstChild) {
				components.browser.removeChild(components.browser.firstChild);
			}

			components.browser.appendChild(fragment);
		});
	}

	/*
		toggle(state):
			Toggles the menu's visibility. If a boolean is provided, the menu enter the
			corresponding state.
	*/
	function toggle(state) {
		if(state === undefined) state = !menuOpen;
		components.frame.classList.toggle(`${hsp}active`, state);
		menuOpen = state;
		if(state) {
			hovered = true;
			if(widgetVisible) toggleWidget(false);
		} else {
			components.browser.actionMode = false;
			if(components.browser.selection) {
				components.browser.selection.elem.classList.toggle(`${hsp}active`, false);
				components.browser.selection = undefined;
			}
		}
	}

	/*
		toggleWidget(state):
			Toggles the widget's visibility.

			Also see: toggle(state)
	*/
	function toggleWidget(state) {
		if(state === undefined) state = !widgetVisible;
		components.widget.classList.toggle(`${hsp}active`, state);
		widgetVisible = state;
	}

	/*
		isOpen():
			Returns the state of the menu.
	*/
	function isOpen() {
		return menuOpen;
	}

	/*
		switchMenu(name):
			The callback used for toolbar button presses. switchMenu is responsible
			for enabling and disabling buttons in the chinbar (in settings, for example).
	*/
	function switchMenu(name) {
		components.slices.forEach(elem => {
			components[elem].classList.toggle(`${hsp}active`, elem === name);
		});

		currentMenu = name;

		let activeButtons = [];

		if(name === 'root') {
			activeButtons = ['add', 'remove'];
		} else if(name === 'browser') {
			activeButtons = components.chinbar.buttonNames;
			activeButtons.splice(activeButtons.indexOf('resolve'), 1)
		}

		if(components.browser.resolve)
			activeButtons.push('resolve');

		components.chinbar.buttonNames.forEach((name, iter) => {
			components.chinbar.buttons[iter].classList
				.toggle(`${hsp}disabled`, activeButtons.indexOf(name) === -1);
		});
	}

	/*
		chinbarButtonPressed(name):
			Provides a button handler callback for the chinbar.
	*/
	function chinbarButtonPressed(name) {
		switch(name) {
			case 'backstep':
				chrome.runtime.sendMessage({action: 'backstep'}, reply => {
					if(reply.success)
						loadLinks();
				});
				break;
			case 'resolve':
				if(components.browser.actionMode) {
					chrome.runtime.sendMessage({action: 'resolve', handle: components.browser.selection.url});
				}
				break;
			case 'remove':
				if(components.browser.actionMode) {
					chrome.runtime.sendMessage({action: 'remove', handle: components.browser.selection.url});
					loadLinks();
				}
				break;
		}
	}

	/*
		getConfig(callback):
			Contacts the background script and requests the config information.
	*/
	function getConfig(callback) {
		chrome.runtime.sendMessage({action: 'getConfig'}, callback);
	}

	/*
		onConfigLoaded(config):
			callback for getConfig.
	*/
	function onConfigLoaded(config) {
		if(document.body) {
			document.body.classList.toggle(`${hsp}remove-scrollbar`, config.scrollbarHiding);
		} else {
			document.addEventListener('DOMContentLoaded', () => {
				document.body.classList.toggle(`${hsp}remove-scrollbar`, config.scrollbarHiding);
			});
		}


		bindShortcut({keys: config.shortcut, callback: toggle});
	}

	return {
		start: function() {
			buildFrame();
			loadLinks(); // This will run asynchronously.
			injectToolbox();
			bindToolbox();
			getConfig(onConfigLoaded);
		},

		toggle: toggle,
		isOpen: isOpen,
		toggleWidget: toggleWidget
	};
})();

toolbox.start(); // 🎉

/*
	createElement(type, attributes, style):
		A more robust function for creating DOM elements. Allows for the addition of
		styling, tag properties (like id), and data-attributes. Also appends the
		function "setTextContent" to the return element, allowing chaining.

		Ex:
			createElement('div', {id: "createdobject", "data-info": "info"}, {width: "4em"});
			createElement('p', {class: "caption"});
			createElement('h1', {class: "red"}).setTextContent("Headline!"); // This will still return the element.
*/
function createElement(type, attributes, style) {
	let elem = document.createElement(type);

	elem.setTextContent = function(text) {
		this.textContent = text;
		return this;
	};

	if(!attributes) attributes = {};
	if(!style) style = {};

	Object.keys(attributes).forEach((attr) => {
		elem.setAttribute(attr, attributes[attr]);
	});

	Object.keys(style).forEach((key) => {
		elem.style[key] = style[key];
	});

	return elem;
}

/*
	bindShortcut(ops):
		I'm not writing this a third time so I'm just borrowing it from Shrub.

		takes an array of key event codes and a callback function. When all the keys are pressed,
		the function is called.

		Ex:
			bindShortcut({keys: ['KeyA', 'AltLeft'], callback: () => {console.log("triggered");}});
			document.addEventListener('keydown', e=>{console.log(e.code)}); // Prints key code names
*/
function bindShortcut(ops) {
	if(!ops.callback || !ops.keys) return -1;
	({
		keystates: [],
		toggleKey: function(code, state) {
			let index = ops.keys.indexOf(code);
			if(index === -1) return false;
			this.keystates[index] = state;
			return true;
		},
		init: function() {
			this.keystates = ops.keys.map(() => false); // Fills 'keystates' with false, and makes it's length equal to the key count
			let ctx = this; // We need a reference to this context

			document.addEventListener('keydown', function(e) {
				if(ctx.toggleKey(e.code, true) && ctx.keystates.every(elem => elem) && ctx.keystates[0]) {
					ops.callback();
				}
			});

			document.addEventListener('keyup', function(e) {
				ctx.toggleKey(e.code, false);
			});
		}
	}).init();
}
