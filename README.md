hexa.js
=======

A small javascript file that allows you to swap between differents contents in a web page in a stylish way.

Usage is simple; your html code should look like this :

```
[...]
  <div class = "hexa-target"> <!-- this is the container for the contents -->
    <div>
      This is the first content.
    </div>
    
    <div>
      This is the second content.
    </div>
  </div>
  
  <div class = "hexa-menu"> <!-- this is the menu for changing the current content -->
    <button>
      See the first content
    </button>
    
    <button>
      See the second content
    </button>
  </div>
  
  <script src = "hexa.js"></script> <!-- always incule hexa.js at the end of the html code -->
[...]
```

The container contains two elements (or more). After the script is loaded, the first element will be the only one visible. The buttons will then be able to show you one of the contents (the first button will show you the first content, and you know the rest) with a stylish transition.

I think I'll thicken the code so that it's more easily customized and has more content.
