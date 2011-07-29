/**
 * @constructor
 * @param events
 * @returns {EventManager}
 */
function EventManager( events ) {
	this.eventHandler = {};
	this.registerEvents(events);
	this.silent = false;
}
EventManager.prototype = {
/** @type {Object} */
	eventHandler: new Object(),
	silent: false,
	/**
	 * @param {string} event
	 * @param {Handler} handler
	 */
	addListener: function( event, handler ) {
		if( ! this.eventHandler[event] ) {
			throw "Unknown event "+event+" tried to listen to";
		}
		this.eventHandler[event].push(handler);
	},
	/**
	 * @param {string} event
	 * @param {Array} args
	 */
	fire: function( event, args ) {
		if( ! this.eventHandler[event] ) {
			throw "Unknown event "+event+" fired!";
		}
		if( this.silent ) {
			return;
		}
		for( var i in this.eventHandler[event] ) {
			this.eventHandler[event][i].notify( args ? args : [] );
		}
	},
	/**
	 * @param {Array} events
	 */
	registerEvents: function( events ) {
		for( var i in events ) {
			this.eventHandler[events[i]] = [];
		}
	},
	clear: function() {
		this.eventHandler = {};
	},
	silent: function( b ) {
		this.silent = b;
	},
	detachAllListeners: function() {
		for( var event in this.eventHandler ) {
			this.eventHandler[event] = [];
		}
	}
};