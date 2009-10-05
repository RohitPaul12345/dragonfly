﻿/**
 * (This file was autogenerated by opprotoc)
 *
 * @fileoverview
 * fixme: add file overview text
 * 
 */
window.cls || ( window.cls = {} );

window.cls.Client = function()
{
  // singleton
  if(arguments.callee.instance)
  {
    return arguments.callee.instance;
  }
  arguments.callee.instance = this;

  var self = this;

  var _on_host_connected = function(servicelist)
  {
    servicelist = servicelist.split(',');
    // TODO sort out all protocol version
    // TODO check proxy version
    if(servicelist.indexOf('stp-1') != -1)
    {
      services.scope.requestHostInfo();
    }
  }

  var _on_host_quit = function()
  {

  }

  var _get_port_number = function()
  {
    // TODO
    // port 0 means debugging to current Opera instance, 
    // any other port means remote debugging.
    return 0;
  }

  this.setup = function()
  {
    window.ini || ( window.ini = {debug: false} );
    if( !opera.scopeAddClient )
    {
      // implement the scope DOM API
      cls.ScopeHTTPInterface.call(opera /*, force_stp_0 */);
    }
    if( !opera.stpVersion )
    {
      // reimplement the scope DOM API STP/1 compatible
      // in case of a (builtin) STP/0 proxy
      cls.STP_0_Wrapper.call(opera);
    }
    opera.scopeAddClient(
        _on_host_connected, 
        cls.ServiceBase.get_generic_message_handler(), 
        _on_host_quit, 
        _get_port_number()
      );
  }
}
