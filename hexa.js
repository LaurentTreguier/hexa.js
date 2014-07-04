/* =========================== */
/* ======== Constants ======== */
/* =========================== */

Hexa.FACE_SIZE     = 100;
Hexa.CELL_WIDTH    = Hexa.FACE_SIZE   / 2 * Math.sqrt(3);
Hexa.CELL_WIDTH_2  = Hexa.CELL_WIDTH  / 2;
Hexa.CELL_HEIGHT   = Hexa.FACE_SIZE;
Hexa.CELL_HEIGHT_4 = Hexa.CELL_HEIGHT / 4;

Hexa.DELAY_CELLS   = 0;
Hexa.DELAY_STATE   = 100;

/* =========================== */
/* ======== Functions ======== */
/* =========================== */

function Hexa() {}

Hexa.init = function()
{
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
            buttons[j].onclick = function(index)
                                 {
                                     return function() { Hexa.switchTo(index) };
                                 } (j);
    }
}

Hexa.hideWall = function(event)
{
    Hexa.targets[event.detail].switchTo(Hexa.currentRequest);
    Hexa.walls  [event.detail].hide();
}

Hexa.switchTo = function(index)
{
    for(var i = 0; i < Hexa.walls.length; i++)
        Hexa.walls[i].show();
    
    Hexa.currentRequest = index;
    
    document.removeEventListener("hexa-wall-ready", Hexa.hideWall);
    document.addEventListener   ("hexa-wall-ready", Hexa.hideWall);
}

Hexa.getStyle = function(element)
{
    return window.getComputedStyle(element, null);
}

Hexa.numberOf = function(string)
{
    return string.slice(0, string.length - 2);
}

Hexa.rgb = function(r, g, b)
{
    return "rgb(" + r + "," + g + "," + b + ")";
}

Hexa.rgba = function(r, g, b, a)
{
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

Hexa.rand = function(min, max)
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
    
    this.switchTo = function(index)
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
    var _numVisibleCells = 0
    var _cells;
    var _timer;
    var _canvas          = document.createElement("canvas");
    var _ctx             = _canvas.getContext("2d");
    
    /* Methods */
    
    var _show = function()
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
            setTimeout(function() { _drawCell(x, y, true, 1) }, Hexa.DELAY_STATE);
            
            _cells[x][y] = true;
            _numVisibleCells++;
        } else
        {
            clearInterval(_timer);
            _ready = true;
            
            var event = new CustomEvent("hexa-wall-ready", { "detail" : _id });
            
            document.dispatchEvent(event);
        }
    }
    
    var _hide = function()
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
    
    var _drawCell = function(x, y, bool, alpha)
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
    
    this.show = function()
    {
        if(_ready)
        {
            _timer = setInterval(_show, Hexa.DELAY_CELLS);
            _ready = false;
        }
    }
    
    this.hide = function()
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
    
    _canvas.width          = Hexa.numberOf(Hexa.getStyle(target).width);
    _canvas.height         = Hexa.numberOf(Hexa.getStyle(target).height);
    _canvas.style.position = "absolute";
    _canvas.style.left     = "0px";
    _canvas.style.top      = "0px";
    target.appendChild(_canvas);
    
    _ctx.fillStyle   = Hexa.rgb(127, 127, 127);
    _ctx.shadowColor = Hexa.rgb(255, 0  , 0  );
    _ctx.shadowBlur  = Hexa.FACE_SIZE / 10;
}

/* ========================== */
/* ======== The init ======== */
/* ========================== */

Hexa.init();
