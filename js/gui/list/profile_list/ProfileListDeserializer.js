/**
 * @constructor
 * @returns {ProfileListDeserializer}
 */
function ProfileListDeserializer() {
	AbstractDeserializer.call( this );
}

ProfileListDeserializer.prototype = new AbstractDeserializer();
/**
 * @param {ItemList} list
 * @param data
 */
ProfileListDeserializer.prototype.deserialize = function( list, data ) {
	var i;
	var tmp;
	var a, span;
	var grid;
	var column = 0;
	var cellStyle;
	
	if( ! (list instanceof ProfileList ) ) {
		throw new Error("Expecting an instance of ItemList, found "+list+"!");
	}
	
	//var cmpItemScore = this.compareItem ? this.compareItem.getStatWeightBasedScore( this.statWeights ) : 0;
	if( data.length < 2 ) {
		list.gui.setContent(null);
		list.setMaxPage(0);
	}
	else {
		grid = new StaticGrid(
				1 ,
				4
			);
		grid.node.cellSpacing = "0px";
		grid.node.width = "100%";
		grid.node.className = "pl_content_t";
		grid.rows[0].className = "pl_header";
		//
		list.setMaxPage( Math.ceil( data[0][0]/data[0][1] ) );
		
		// skip icon
		//grid.cols[column].width = "26px";
		//column++;
		
		grid.cols[column].width = "30px";
		column++;
		
		grid.cols[column].width = "34px";
		column++;
		
		grid.cols[column].width = "34px";
		column++;
		
		grid.cols[column].width = (940 - 30 - 34 -34) +"px";
		column++;
		
		
		for( i=0; i<column; i++ ) {
			grid.cells[0][i].className = "pl_header_cell";
		}
		
		for( i = 1; i < data.length; i++ ) {
			column = 0;

			cellStyle = "pl_cell "+ ( i%2 == 0 ? "pl_cell_bg0" : "pl_cell_bg1");

			
			row = grid.addJoinedRow();

			grid.cells[row][0].className = cellStyle + " pl_inline_header";
			
			a = document.createElement("a");
			a.innerHTML = ( data[i][2] ? data[i][2] : "Profile #"+data[i][0] );
			a.href = "?profile="+data[i][0];
			a.target = "_blank";
			a.className = "pl_link";
			
			if( data[i][3] ) {
				a.onmouseout = function(){Tooltip.hide();};
				a.onmousemove = function(){Tooltip.move();};
				//Listener.add(a,"mouseover",Tooltip.showText,Tooltip,[data[i][3]]);
			}
			grid.cells[row][0].appendChild(a);
			
			span = document.createElement("span");
			span.innerHTML = "&nbsp;Created: "+data[i][7]+"&nbsp;";
			grid.cells[row][0].appendChild(span);
			
			if( this.onclickHandler ) {
				a = document.createElement("a");
				a.innerHTML = "[Import]";
				a.className = "pl_import_link";
//				Listener.add( a, "click", function(serializedProfile){ this.onclickHandler.notify([serializedProfile]); }, this, [data[i][0]]);
				grid.cells[row][0].appendChild(a);
			}
			
			if( g_settings.userId == data[i][1] ) {
				a = document.createElement("a");
				a.innerHTML = "[x]";
				a.className = 'pl_delete_link';
//				Listener.add( a, "click", this.onProfileDelete,this, [data[i][0]]);
				grid.cells[row][0].appendChild(a);
			}

			row = grid.addRow();
			
			grid.cells[row][column].className = cellStyle + " pl_level_p";
			grid.cells[row][column++].innerHTML = data[i][6];
			
			grid.cells[row][column].className = cellStyle;
			grid.cells[row][column++].innerHTML = "<div style='background-image:url(images/site/race_class/half/chr_race_" + data[i][4] + ".png)' class='li_icon' ></div>";
			
			grid.cells[row][column].className = cellStyle;
			grid.cells[row][column++].innerHTML = "<div style='background-image:url(images/site/race_class/half/" + data[i][5] + ".png)' class='li_icon' ></div>";
			
			grid.cells[row][column].className = cellStyle;
		}
		list.gui.setContent(grid.node);
	}
};