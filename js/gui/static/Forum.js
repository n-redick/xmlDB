/**
 * @constructor
 * @param posts
 * @returns {Forum}
 */
function Forum( posts ) {
	var e;
	for( var k in posts ) {
		e = new PostEditable();
		new PostEditableObserver(posts[k]['PostID'], posts[k]['Data'], e);
		DOM.set('p'+posts[k]['PostID']+'_content', e.node);
	}
}

function PostEditableObserver( postId, data, editable ) {
	GenericObserver.call( this, ['change'], new Handler( this.__onChange, this )); 
	this.postId = postId;
	this.data = data;
	this.editable = editable;
	this.editable.setData(this.data);
	this.editable.addObserver(this);
}

PostEditableObserver.prototype = GenericObserver.prototype;
PostEditableObserver.prototype.postId = "";
PostEditableObserver.prototype.data = null;
PostEditableObserver.prototype.editable = null;
PostEditableObserver.prototype.__onChange = function( e ) {
	if( e.is('change') ) {
		Ajax.post(
			'php/interface/forum/forum.php', {
				'action': 'edit',
				'post': this.postId,
				'content': e.get('data')
			}, 
			new Handler(Chardev.__checkEdit_callback, Chardev), 
			null
		);
	}
};
PostEditableObserver.prototype.__saveCallback = function( response ) {
	try {	
		var newVal = Ajax.getResponseObject(response);
		this.data = newVal == null ? "" : newVal;			
	}
	catch( e ) {
		Tooltip.showError(e);
	}
	
	this.editable.setData(this.data);
};