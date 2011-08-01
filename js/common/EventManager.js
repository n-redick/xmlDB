/**
 * @constructor
 * @param events
 * @returns {EventManager}
 */
function EventManager( events ) {
	this.eventHandler = {};
	this.propagators = {};
	this.registerEvents(events);
	this.silent = false;
	this.observers = new Array();
}
EventManager.prototype = {
/** @type {Object} */
	eventHandler: new Object(),
	propagators: new Object(),
	observers: new Array(),
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
	removeListener: function( event, handler ) {
		if( ! this.eventHandler[event] ) {
			throw "Unknown event "+event+" tried to listen to";
		}
		for( var i=0; i<this.eventHandler[event].length; i++ ) {
			if( this.eventHandler[event][i] == handler ) {
				this.eventHandler[event].splice( i, 1 );
				return;
			}
		}
		throw new Error("Unable to remove handler "+handler+"!");
	},
	addObserver: function( observer ) {
		this.observers.push( observer );
	},
	removeObserver: function( observer ) {
		for( var i=0; i<this.observers.length; i++ ) {
			if( this.observers[i] == observer ) {
				this.observers.splice( i, 1 );
				return;
			}
		}
		throw new Error("Unable to remove observer "+observer+"!");
	},
	/**
	 * @param {string} event
	 * @param {EventManager} eventMgr
	 */
	addPropagator: function( event, eventMgr ) {
		if( ! this.propagators[event] ) {
			throw "Unknown event "+event+" tried to listen to";
		}
		this.propagators[event].push(eventMgr);
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
		for( i in this.propagators[event] ) {
			this.propagators[event][i].fire( event, args ? args : [] );
		}
		for( i in this.observers ) {
			this.observers[i].notify.apply( this.observers[i], event, args ? args : [] );
		}
	},
	/**
	 * @param {Array} events
	 */
	registerEvents: function( events ) {
		for( var i in events ) {
			this.eventHandler[events[i]] = [];
			this.propagators[events[i]] = [];
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
			this.propagators[event] = [];
		}
		this.observers = [];
	}
};