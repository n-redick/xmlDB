/** @const */ var SG_VALIGN_TOP = 'top';
/** @const */ var SG_VALIGN_MIDDLE = 'middle';
/** @const */ var SG_VALIGN_BOTTOM = 'bottom';
/**
 * @constructor
 * @param {number} rows
 * @param {number} cols
 * @returns {StaticGrid}
 */
function StaticGrid( rows, cols ){
	var colGrp = document.createElement('colgroup');
	var i,j;
	// table
	this.node = document.createElement("table");
	this.node.cellSpacing = "0";
	this.node.cellPadding = "0";
	
	this.rows = new Array(rows);
	this.cells = new Array(rows);
	this.cols = new Array(cols);

	this.node.appendChild(colGrp);
	for( j = 0; j < cols; j++ ){
		this.cols[j] = document.createElement('col');
		colGrp.appendChild(this.cols[j]);
	}
	// body
	this.tbody = document.createElement("tbody");
	this.node.appendChild(this.tbody);
    
    for ( i = 0; i < rows; i++) {
		//rows
		this.rows[i] = document.createElement("tr");
		this.tbody.appendChild(this.rows[i]);
		//cells
		this.cells[i] = new Array(cols);
		for( j = 0; j < cols; j++ ){
			this.cells[i][j] = document.createElement("td");
			this.rows[i].appendChild(this.cells[i][j]);
		}
    }
};

StaticGrid.prototype = {
	cells: [], rows: [], cols: [], node: null, tbody: null, vAlign: "",
	setVerticalAlign: function ( vAlign ) {
		var i,j;
		this.vAlign = vAlign;
		for ( i = 0; i < this.cells.length; i++) {
			for( j = 0; j < this.cells[i].length; j++ ){
				this.cells[i][j].vAlign = vAlign;
			}
		}
	},
	addRow: function() {
		var row = this.rows.length, i;
		this.rows[row] = document.createElement("tr");
		this.cells[row] = [];
		for( i=0; i<this.cols.length; i++ ) {
			this.cells[row][i] = document.createElement("td");
			this.cells[row][i].vAlign = this.vAlign;
			this.rows[row].appendChild(this.cells[row][i]);
		}
		this.tbody.appendChild(this.rows[row]);
		return row;
	},
	addJoinedRow: function() {
		var row = this.rows.length, td = null, i;
		this.rows[row] = document.createElement("tr");
		this.cells[row] = [];
		td = document.createElement("td");
		td.colSpan = this.cols.length;
		td.vAlign = this.vAlign;
		this.rows[row].appendChild(td);
		for( i=0; i<this.cols.length; i++ ) {
			this.cells[row][i] = td;
		}
		this.tbody.appendChild(this.rows[row]);
		return row;
	}
};
