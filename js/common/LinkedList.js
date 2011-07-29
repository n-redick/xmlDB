/**
 * Constructs a new double linked list element, may only be called by {@link LinkedList}
 * @constructor
 * @param {Object} value
 * @returns {ListElement}
 */
function ListElement ( value ) {
	this.next = null;
	this.prev = null;
	this.value = value;
}

ListElement.prototype.next = new ListElement(null);
ListElement.prototype.prev = new ListElement(null);
ListElement.prototype.isLast = false;
ListElement.prototype.isFirst = false;
ListElement.prototype.value = null;

/**
 * Removes this element from the parent list
 * @returns {boolean} <code>true</code>, if successful, false if the element is not removable (start/end padding element)
 */
ListElement.prototype.remove = function() {
	if( this.isFirst || this.isLast ) {
		return false;
	}

	this.prev.next = this.next;
	this.next.prev = this.prev;
	return true;
};

/**
 * Constructs a new double linked list
 * @constructor
 * @returns {LinkedList}
 */
function LinkedList (){
	this.first = new ListElement(null);
	this.last = new ListElement(null);
	
	this.last.prev = this.first;
	this.first.next = this.last;
	this.last.isLast = true;
	this.first.isFirst = true;
};

LinkedList.prototype.first = new ListElement(null);
LinkedList.prototype.last = new ListElement(null);

/**
 * Adds a new element to the end of the list
 * @param value
 * @returns {ListElement} addedElement
 */
LinkedList.prototype.push = function( value ) {
	var e = new ListElement( value );
	e.next = this.last;
	e.prev = this.last.prev;
	this.last.prev.next = e;
	this.last.prev = e;
	return e;
};

/**
 *	Removes all Elements
 */
LinkedList.prototype.clear = function(){
	this.first.next = this.last;
	this.last.prev = this.first;
};