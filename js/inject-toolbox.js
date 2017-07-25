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
			elem.addEventListener('click', () => { callback(id); });

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

		components.frame = createElement('div', {id: `${hsp}frame`})

		components.sandwich = createElement('div', {id: `${hsp}sandwich`});

		components.slices = ['browser', 'settings', 'root'];
		components.browser = createElement('div', {class: `${hsp}slice ${hsp}browser ${hsp}active`});
		components.root = createElement('div', {class: `${hsp}slice ${hsp}browser`});
		components.settings = createElement('div', {class: `${hsp}slice ${hsp}settings`});

		components.toolbar = createElement('div', {class: `${hsp}bar`, id: `${hsp}toolbar`});
		components.chinbar = createElement('div', {class: `${hsp}bar`, id: `${hsp}chinbar`});

		components.toolbar.buttons = panel(components.slices, switchMenu);
		components.chinbar.buttons = ['backstep', 'add', 'remove'].map(name => {
			return button(name, chinbarButtonPressed);
		});

		// Assemble structure
		components.docfrag.appendChild(components.frame);
		components.frame.appendChild(components.toolbar);
		components.frame.appendChild(components.sandwich);
		components.frame.appendChild(components.chinbar);
		components.sandwich.appendChild(components.browser);
		components.sandwich.appendChild(components.root);
		components.sandwich.appendChild(components.settings);
		components.toolbar.buttons.appendTo(components.toolbar);
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
			Attaches event handlers relating to the operation of the toolbox.
	*/
	function bindToolbox() {
		bindShortcut({keys: ['AltLeft', 'AltRight'], callback: toggle});
	}

	/*
		loadLinks():

	*/
	function loadLinks() {

	}

	function toggle() {
		components.frame.classList.toggle(`${hsp}active`);
	}

	function isOpen() {
		return components.frame.offsetWidth !== 0;
	}

	function switchMenu(name) {
		components.slices.forEach(elem => {
			components[elem].classList.toggle(`${hsp}active`, elem === name);
		});
	}

	/*
		chinbarButtonPressed(name):
			Provides a button handler callback for the chinbar.
	*/
	function chinbarButtonPressed(name) {

	}

	return {
		start: function() {
			buildFrame();
			loadLinks(); // This will run asynchronously.
			injectToolbox();
			bindToolbox();
		},

		toggle: toggle,
		isOpen: isOpen
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
