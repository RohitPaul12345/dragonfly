/**
 * @constructor
 *
 * A class for handling context menus. Only one context menu will be shown at
 * a time, so all methods are static.
 */
var ContextMenu = function() {};

/**
 * Holds all registered context menus.
 */
ContextMenu.registered_menus = {};

/**
 * Registers a new context menu, or adds items to an already registered context menu.
 *
 * @param {String} menu_id An id correspoding to an id specified with a data-menu
 *                         attribute in the markup. May be an already existing
 *                         menu, in which case the items are added.
 * @param {Array} item_list An array of objects with 'id', 'label' and 'handler'
 *                          (function).
 *
 */
ContextMenu.register = function(menu_id, item_list)
{
  var menu = ContextMenu.registered_menus[menu_id];
  // If it already is registered, merge it
  if (menu)
  {
    ContextMenu.registered_menus[menu_id] = menu.concat(item_list);
  }
  else if (menu_id && item_list)
  {
    ContextMenu.registered_menus[menu_id] = item_list;
  }
};

/**
 * Show and position a context menu.
 *
 * @param {String} menu_id Id of a registered context menu.
 * @param {Int} x The left position of the menu, relative to the viewport.
 * @param {Int} y The top position of the menu, relative to the viewport.
 */
ContextMenu.show = function(menu_id, x, y)
{
  var menu = ContextMenu.registered_menus[menu_id];
  if (menu)
  {
    var contextmenu = document.documentElement.render(window.templates.contextmenu(menu_id, menu));

    const DEFAULT_MARGIN = 2;
    var max_height = 0;
    var box = contextmenu.getBoundingClientRect();
    var box_width = box.width;
    var box_height = box.height;
    var window_height = window.innerHeight;
    var window_width = window.innerWidth;

    // Check if the menu height fits within the window
    if (box_height + (DEFAULT_MARGIN * 2) > window_height)
    {
      // It doesn't fit, apply max-height to make it scroll
      y = DEFAULT_MARGIN;
      max_height = window_height - (DEFAULT_MARGIN * 2) - 2; // 2 = border-width (top+bottom)
    }
    // It fits within the window, check if it fits downwards or not. If it
    // doesn't, we have to adjust the position.
    else if (y + box_height + DEFAULT_MARGIN > window_height)
    {
      // Check if we can just flip it upwards
      if (box_height + DEFAULT_MARGIN < y)
      {
        y -= box_height;
      }
      // It doesn't fit upwards, reposition it upwards as much as needed
      else
      {
        var overflow = window.innerHeight - y - box_height;
        y += overflow - DEFAULT_MARGIN;
      }
    }

    // It doesn't fit to the right, flip it
    if (x + box_width + DEFAULT_MARGIN > window_width)
    {
      x -= box_width;
    }

    contextmenu.style.cssText = [
      "left:" + x + "px",
      "top:" + y + "px",
      "max-height:" + (max_height ? max_height + "px" : "100%"),
      "visibility:visible"
    ].join(";");
  }
};

/**
 * Hides the context menu.
 */
ContextMenu.dismiss = function()
{
  var contextmenu = document.getElementById("contextmenu");
  if (contextmenu)
  {
    contextmenu.parentElement.removeChild(contextmenu);
  }
};

ContextMenu.modal_click_handler = function(event)
{
  var target = event.target;
  var menu = ContextMenu._current_menu;
  var contextmenu = document.getElementById("contextmenu");

  event.stopPropagation();
  event.preventDefault();

  ContextMenu.dismiss();

  while (target != contextmenu && target != document)
  {
    if (target.getAttribute("data-handler-id"))
    {
      var item = null;
      for (var i = 0; item = menu[i]; i++)
      {
        if (item.id == target.getAttribute("data-handler-id"))
        {
          item.handler(ContextMenu._current_event, target);
        }
      }
    }
    target = target.parentNode;
  }

  document.removeEventListener("click", ContextMenu.modal_click_handler, true);
  EventHandler.__modal_mode = false;
};

/**
 * Global context menu event handler.
 */
ContextMenu.oncontextmenu = function(contextmenuevent)
{
  document.removeEventListener("click", ContextMenu.modal_click_handler, true);

  // Hide the currently visible context menu, if any
  ContextMenu.dismiss();

  if (/*!window.getSelection().isCollapsed ||*/ event.shiftKey) // Shift key overrides for debugging
  {
    return;
  }

  // Prevent the normal context menu from showing up
  event.preventDefault();

  if (EventHandler.__modal_mode)
  {
    EventHandler.__modal_mode = false;
    return;
  }

  var menu_id = event.target.get_attr("parent-node-chain", "data-menu");
  if (menu_id)
  {
    ContextMenu._current_menu = ContextMenu.registered_menus[menu_id];
    ContextMenu._current_event = contextmenuevent;

    ContextMenu.show(menu_id, contextmenuevent.clientX, contextmenuevent.clientY);
    document.addEventListener("click", ContextMenu.modal_click_handler, true);
    EventHandler.__modal_mode = true;
  }
};

document.addEventListener("contextmenu", ContextMenu.oncontextmenu, false);

