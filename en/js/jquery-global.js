const jQuery = window.jQuery || window.$;

if (typeof jQuery !== "function") {
	throw new Error("jQuery did not initialize as a function");
}

window.jQuery = jQuery;
window.$ = jQuery;

export default jQuery;

