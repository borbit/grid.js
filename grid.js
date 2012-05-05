(function() {

var Row = this['Row'] || require('row');

function Grid(width, height, placeholder) {
    this.parent = Row.prototype;
    this.parent.constructor.call(this);
    
    if (width && width.length && width.push) {
        for (var i = width.length; i--;) {
            this.set(width[i][0], width[i][1], width[i][2]);
        }
    }
    
    if (!isNaN(width) && !isNaN(height)) {
        for (var y = height; y--;) {
        for (var x = width; x--;) {
            this.set(x, y, placeholder);
        }}
    }
}

-function() {
    function F() {}
    F.prototype = Row.prototype;
    Grid.prototype = new F();
    Grid.prototype.constructor = Grid;
}();

function getRelatedCoords(x, y) {
    return [
        [x-1, y-1], [x, y-1], [x+1, y-1],
        [x-1, y], [x+1, y], [x-1, y+1],
        [x, y+1], [x+1, y+1]
    ];
}

Grid.prototype.set = function(x, y, cell) {
    if (cell === undefined) {
        return this.parent.set.call(this, x, y);
    }

    return (this.parent.get.call(this, y) ||
            this.parent.set.call(this, y, new Row()))
            .set(x, cell);
};

Grid.prototype.get = function(x, y) {
    if (y === undefined) {
        return this.parent.get.call(this, x);
    }

    return this.parent.get.call(this, y) ?
           this.parent.get.call(this, y).get(x) :
           undefined;
};

Grid.prototype.on = function(xNum, yNum) {
    if (yNum === undefined) {
        return this.parent.on.call(this, xNum);
    }
    
    return this.parent.on.call(this, yNum) ?
           this.parent.on.call(this, yNum).on(xNum) :
           undefined;
};

Grid.prototype.remove = function(x, y) {
    var toRemove = [[x, y]];
    
    if (y === undefined) {
        if (!isNaN(x)) {
            this.parent.remove.call(this, x);
            return;
        }
        if (x.length !== undefined && 
            x.pop !== undefined) {
            toRemove = x;
        }
    }
    
    for (var row, i = toRemove.length; i--;) {
        x = toRemove[i][0]
        y = toRemove[i][1];
        
        if (row = this.get(y)) {
            row.remove(x);
        
            if (!row.count()) { 
                this.parent.remove.call(this, y);
            }
        }
    }
};

Grid.prototype.flatten = function() {
    var result = [];
    
    this.each(function(cell, x, y) {
        result.push([cell, x, y]);
    });
    
    return result;
};

Grid.prototype.coords = function() {
    var result = [];
    
    this.each(function(cell, x, y) {
        result.push([x, y]);
    });
        
    return result;
};

Grid.prototype.values = function() {
    var result = [];
    
    this.each(function(cell, x, y) {
        result.push(cell);
    });
        
    return result;
};

Grid.prototype.each = function(iterator, context) {
    this.rewind();
    while (this.hasNext()) {
        var row = this.next().rewind();
        var y = this.currentIndex;
        while (row.hasNext()) {
            var cell = row.next();
            var x = row.currentIndex;
            iterator.apply(context, [cell, x, y]);
        }
    }    
};

Grid.prototype.related = function(x, y) {
    var related = new Grid();
    var coords = getRelatedCoords(x, y);
    
    for (var i = 0; i < 8; i++) {
        var rx = coords[i][0];
        var ry = coords[i][1];
        var cell = this.get(rx, ry);
        
        if (typeof(cell) != 'undefined') {
            related.set(rx, ry, cell);
        }
    }
    
    return related;
};

Grid.prototype.concat = function(grid) {
    grid.each(function(cell, x, y) {
        this.set(x, y, cell);
    }, this);
};

Grid.prototype.border = function() {
    var border = new Grid();
    var coords = this.coords();
    var related, x, y, i, j;
    
    for (i = coords.length; i--;) {
        related = getRelatedCoords(coords[i][0], coords[i][1]);
        for (j = related.length; j--;) {
            border.set(related[j][0], related[j][1], true);
        }
    }
    
    for (i = coords.length; i--;) {
        border.remove(coords[i][0], coords[i][1]);
    }
    
    return border.coords();
};

if (typeof module != 'undefined' &&
    typeof module.exports != 'undefined') {
    module.exports = Grid;
} else {
    window.Grid = Grid;
}

})();