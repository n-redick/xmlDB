/**
 * @param {Handler} onSaveHandler
 * @returns {SaveInterface}
 */
function SaveInterface( onSaveHandler ) {
	var div, form;
	this.onSaveHandler = onSaveHandler;
	
	this.node = DOM.create("div", {"class": 'im_parent'});
	
	form = DOM.create( 'form', {'action': 'javascript:'});
	Listener.add(form,"submit",this.__onSave,this,[]);

	this.nameInput = DOM.create( 'input', {'class': 'input im_sa_in'});
	this.descInput = DOM.create( 'input', {'class': 'input im_sa_in'});
	this.submitButton = DOM.create('input', {'type': 'submit', 'value': 'Save'});
	

	DOM.createAt( form, 'div', {'class': 'content_header im_header','text':'Save the current profile'});
	
	div = DOM.createAt(form, 'div', {'class': 'im_sa_r'});
	DOM.createAt(div, 'div', {'class': 'im_sa_left', 'text': locale['S_ProfileName']});
	DOM.append(DOM.createAt(div, 'div', {'class': 'im_sa_right'}), this.nameInput);
	DOM.clear(div);
	
	div = DOM.createAt(form, 'div', {'class': 'im_sa_r'});
	DOM.createAt(div, 'div', {'class': 'im_sa_left', 'text': locale['S_CharacterDescription']});
	DOM.append(DOM.createAt(div, 'div', {'class': 'im_sa_right'}), this.descInput);
	DOM.clear(div);

	DOM.append(DOM.createAt(form, 'div', {'class': 'im_sa_b'}), this.submitButton);
	
	DOM.append(DOM.createAt( this.node, "div", {'class': 'im_sa_inputs'}), form);
}

SaveInterface.prototype = {
	node: null,
	onSaveHandler: null,
	nameInput: null,
	descInput: null,
	submitButton: null,
	__onSave: function() {
		this.onSaveHandler.notify([this.nameInput.value, this.descInput.value]);
	}
};