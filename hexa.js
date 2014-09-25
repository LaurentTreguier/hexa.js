/* ============================= */
/* ======== User values ======== */
/* ============================= */

Hexa.CELL_FACE_SIZE    = 150;                      // The size of the cells' faces. Default is 150.
Hexa.CELL_FILL_COLOR   = "rgb(127, 127, 127)";     // The color used for filling the cells. Default is gray (127, 127, 127).
Hexa.CELL_SHADOW_COLOR = "rgb(255, 0  , 0  )";     // The color of the cells' shadows. Default is red (255, 0, 0).
Hexa.CELL_SHADOW_BLUR  = Hexa.CELL_FACE_SIZE / 10; // The blur of the cells' shadows. Default is Hexa.CELL_FACE_SIZE / 10 but big values are funny to try.
Hexa.DELAY_CELLS       = 25;                       // The delay between two cells popping. Default is 25 (ms).

/* =========================== */
/* ======== Constants ======== */
/* =========================== */

Hexa.CELL_WIDTH    = Hexa.CELL_FACE_SIZE / 2 * Math.sqrt(3);   // The width of a cell (a cell is an hexagon).
Hexa.CELL_WIDTH_2  = Hexa.CELL_WIDTH     / 2;                  // Half of the width (it's used each time a cell is drawn, so having an already computed value helps).
Hexa.CELL_HEIGHT   = Hexa.CELL_FACE_SIZE;                      // The height of a cell.
Hexa.CELL_HEIGHT_4 = Hexa.CELL_HEIGHT    / 4;                  // The quarter of a cell (again, it's because it's used frequently).

Hexa.DELAY_STATE   = 100;                                      // The delay between the 2 states of a drawn cell (half drawn and fully drawn).

/* =========================== */
/* ======== Functions ======== */
/* =========================== */

function Hexa() // This function looks for the targets and menus in the HTML code and serves as namespace for the entire file.
{
    document.removeEventListener("DOMContentLoaded", Hexa);
    
    var targets = document.getElementsByClassName("hexa-target");
    var menus   = document.getElementsByClassName("hexa-menu"  );
    var buttons;
    
    Hexa.targets = new Array();
    Hexa.walls   = new Array();
    
    for(var i = 0; i < targets.length; i++)
    {
        Hexa.targets.push(new Hexa.Target(targets[i]));
        Hexa.walls  .push(new Hexa.Wall  (targets[i], i));
    }
    
    for(var i = 0; i < menus.length; i++)
    {
        buttons = menus[i].children;
        
        for(var j = 0; j < buttons.length; j++)
            buttons[j].onclick = function(index) // Using a function returned by a function is necessary : this way j is computed for each onclick.
                                 {               // Not doing this results in attributing "Hexa.switchTo(j)" to onclick instead of "Hexa.switchTo(0)" or whatever the number should be.
                                     return function() { Hexa.switchTo(index) };
                                 } (j);
    }
}

Hexa.hideWall = function(event) // Triggers targets switching to another content and then hiding the walls.
{
    Hexa.targets[event.detail].switchTo(Hexa.currentRequest);
    Hexa.walls  [event.detail].hide();
}

Hexa.switchTo = function(index) // Switches content for every wall.
{
    for(var i = 0; i < Hexa.walls.length; i++)
        Hexa.walls[i].show();
    
    Hexa.currentRequest = index; // Store the index of the requested content.
    
    document.removeEventListener("hexa-wall-ready", Hexa.hideWall);
    document.addEventListener   ("hexa-wall-ready", Hexa.hideWall);
}

Hexa.getStyle = function(element) // Returns the style of element (only serves as shortcut to an already existing function).
{
    return window.getComputedStyle(element, null);
}

Hexa.numberOf = function(string) // Returns the number from a length in CSS (cut out the "px").
{
    return string.slice(0, string.length - 2);
}

Hexa.rand = function(min, max) // Random integer between min and max.
{
    return Math.floor(Math.random() * (max - min) + min);
}

/* ========================= */
/* ======== Classes ======== */
/* ========================= */

Hexa.Target = function(target)
{
    /* Properties */
    
    var _target   = target;
    var _sections = target.children;
    var _index    = 0;
    
    /* Methods */
    
    this.switchTo = function(index) // Actual switch to another content using the CSS display property.
    {
        _sections[_index].style.display = "none";
        
        _index = index;
        
        _sections[_index].style.display = "initial";
    }
    
    /* Init */
    
    for(var i = 0; i < _sections.length; i++)
        _sections[i].style.display = "none";
    
    this.switchTo(0);
}

Hexa.Wall = function(target, id)
{
    /* Properties */
    
    var _id              = id;
    var _ready           = true;
    var _numVisibleCells = 0;
    var _cells;
    var _timer;
    var _canvas          = document.createElement("canvas");
    var _ctx             = _canvas.getContext("2d");
    
    /* Methods */
    
    var _show = function() // Draws a single cell at a random place in order to make the wall visible.
    {
        var x;
        var y;
        
        if(_numVisibleCells < (_cells.length * _cells[0].length))
        {
            do
            {
                x = Hexa.rand(0, _cells   .length);
                y = Hexa.rand(0, _cells[0].length);
            } while(_cells[x][y]);
            
            _drawCell(x, y, true, 0.5);
            setTimeout(function() { _drawCell(x, y, true, 1) }, Hexa.DELAY_STATE); // Timeout so that the cell is first half drawn and then fully drawn.
            
            _cells[x][y] = true;
            _numVisibleCells++;
        } else
        {
            clearInterval(_timer);
            _ready = true;
            
            var event = new CustomEvent("hexa-wall-ready", { "detail" : _id });
            
            document.dispatchEvent(event); // Dispatch the event which indicates the wall is entirely visible.
        }
    }
    
    var _hide = function() // Hides a single cell at a random place in order to make the wall invisible.
    {
        var x;
        var y;
        
        if(_numVisibleCells > 0)
        {
            do
            {
                x = Hexa.rand(0, _cells   .length);
                y = Hexa.rand(0, _cells[0].length);
            } while(!_cells[x][y]);
            
            _drawCell(x, y, false, 0.5);
            setTimeout(function() { _drawCell(x, y, false, 1) }, Hexa.DELAY_STATE);
            
            _cells[x][y] = false;
            _numVisibleCells--;
        } else
        {
            clearInterval(_timer);
            _ready = true;
        }
    }
    
    var _drawCell = function(x, y, bool, alpha) // Draws a single cell. The current pattern is an hexagon (the prettiest tiling polygon IMO).
    {
        x = y % 2 ? x - 0.5 : x;
        
        if(bool)
            _ctx.globalCompositeOperation = "source-over";
        else
            _ctx.globalCompositeOperation = "destination-out";
        
        _ctx.globalAlpha = alpha;
        
        _ctx.beginPath();
        
        _ctx.moveTo(x * Hexa.CELL_WIDTH        + Hexa.CELL_WIDTH_2,
                    y * Hexa.CELL_HEIGHT_4 * 3 - Hexa.CELL_HEIGHT_4);
        
        _ctx.lineTo(x * Hexa.CELL_WIDTH,
                    y * Hexa.CELL_HEIGHT_4 * 3);
        
        _ctx.lineTo(x * Hexa.CELL_WIDTH,
                    y * Hexa.CELL_HEIGHT_4 * 3 + Hexa.CELL_HEIGHT / 2);
        
        _ctx.lineTo(x * Hexa.CELL_WIDTH        + Hexa.CELL_WIDTH_2,
                    y * Hexa.CELL_HEIGHT_4 * 3 + Hexa.CELL_HEIGHT_4 * 3);
        
        _ctx.lineTo(x * Hexa.CELL_WIDTH        + Hexa.CELL_WIDTH,
                    y * Hexa.CELL_HEIGHT_4 * 3 + Hexa.CELL_HEIGHT / 2);
        
        _ctx.lineTo(x * Hexa.CELL_WIDTH        + Hexa.CELL_WIDTH,
                    y * Hexa.CELL_HEIGHT_4 * 3);
        
        _ctx.closePath();
        _ctx.fill();
    }
    
    this.show = function() // Draws the entire wall.
    {
        if(_ready)
        {
            _timer = setInterval(_show, Hexa.DELAY_CELLS);
            _ready = false;
        }
    }
    
    this.hide = function() // Hides the entire wall.
    {
        if(_ready)
        {
            _timer = setInterval(_hide, Hexa.DELAY_CELLS);
            _ready = false;
        }
    }
    
    /* Init */
    
    _cells = new Array(Math.round(Hexa.numberOf(Hexa.getStyle(target).width) /
                                  Hexa.CELL_WIDTH) + 1);
    
    for(var i = 0; i < _cells.length; i++)
    {
        _cells[i] = new Array(Math.round(Hexa.numberOf(Hexa.getStyle(target).height) /
                                        (Hexa.CELL_HEIGHT * 0.75)) + 1);
        
        for(var j = 0; j < _cells[0].length; j++)
            _cells[i][j] = false;
    }
    
    _canvas.width          = Hexa.numberOf(Hexa.getStyle(target).width );
    _canvas.height         = Hexa.numberOf(Hexa.getStyle(target).height);
    _canvas.style.position = "absolute";
    _canvas.style.left     = "0px";
    _canvas.style.top      = "0px";
    target.appendChild(_canvas);
    
    _ctx.fillStyle   = Hexa.CELL_FILL_COLOR;
    _ctx.shadowColor = Hexa.CELL_SHADOW_COLOR;
    _ctx.shadowBlur  = Hexa.CELL_SHADOW_BLUR;
}

/* ========================== */
/* ======== The init ======== */
/* ========================== */

document.addEventListener("DOMContentLoaded", Hexa, false); // Wait for the entire page to be loaded before doing anything.
