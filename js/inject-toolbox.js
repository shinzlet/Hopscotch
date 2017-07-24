const hsp = "hopscotch-toolbox-"; // Hopscotch prefix (for id seperation)

let toolbox = (function() {
	let components = {};
	function buildFrame() {
		// Create the document fragment
		components.docfrag = document.createDocumentFragment();

		// Create elements
		components.frame = createElement('div', {id: `${hsp}frame`})
		components.toolbar = createElement('div', {class: `${hsp}bar`, id: `${hsp}toolbar`});
		components.sandwich = createElement('div', {id: `${hsp}sandwich`});
		components.browser = createElement('div', {class: `${hsp}slice ${hsp}active`}).setTextContent("Here's Trash!");
		components.chinbar = createElement('div', {class: `${hsp}bar`, id: `${hsp}chinbar`});

		let button = name => {
			let elem = createElement('div', {class: `${hsp}button ${hsp}button-${name}`});
			elem.addEventListener('click', () => { buttonPressed(name); });

			elem.activate = function() {
				elem.classList.toggle(`${hsp}active`, true);
				return elem;
			}

			elem.deactivate = function() {
				elem.classList.toggle(`${hsp}active`, false);
				return elem;
			}

			return elem;
		}

		components.buttons = {};

		components.buttons['add'] = button('add');
		components.buttons['root'] = button('root');
		components.buttons['view'] = button('view').activate();

		// Assemble structure
		components.docfrag.appendChild(components.frame);

		components.frame.appendChild(components.toolbar);
		components.frame.appendChild(components.sandwich);
		components.frame.appendChild(components.chinbar);

		components.sandwich.appendChild(components.browser);

		components.toolbar.appendChild(components.buttons['view']);
		components.toolbar.appendChild(components.buttons['root']);
		components.toolbar.appendChild(components.buttons['add']);
	}

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

	function bindToolbox() {
		bindShortcut({keys: ['AltLeft', 'AltRight'], callback: toggle});
	}

	function loadLinks() {

	}

	function toggle() {
		components.frame.classList.toggle(`${hsp}active`);
	}

	function isOpen() {
		return components.frame.offsetWidth !== 0;
	}

	function buttonPressed(name) {
		Object.keys(components.buttons).forEach(key => {components.buttons[key].deactivate()});
		components.buttons[name].activate();
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
	createElement:
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
	bindShortcut:
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
