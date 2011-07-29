function AbstractDeserializer() {}

AbstractDeserializer.prototype = {
	deserialize: function( data ) {
		throw new Error("ListBackendProxy::update was not overwritten!");
	},
	getSortLink: function( list, title, order ) {
		var a = document.createElement("a");
		a.innerHTML = title + ( order == list.order ? ( list.orderDirection == List.ORDER_DESC ? ' ▼' : ' ▲') : "" );
		a.className = 'li_sort_link'+( order == list.order ? '_active' : '' );
		Listener.add(a, 'click', list.order, this, [order]);
		return a;
	}
};