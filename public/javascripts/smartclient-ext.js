isc.defineClass("RailsDataSource", "RestDataSource");

isc.RailsDataSource.addProperties({
    operationBindings:[
       {operationType:"fetch", dataProtocol:"getParams"},
       {operationType:"add", dataProtocol:"postParams"},
       {operationType:"remove", dataProtocol:"postParams", requestProperties:{httpMethod:"DELETE"}},
       {operationType:"update", dataProtocol:"postParams", requestProperties:{httpMethod:"PUT"}}
    ],

    getDataURL : function (dsRequest) { 
        var url = this.Super("getDataURL", arguments);
        for (var key in dsRequest.data) {
          macro = "{" + key + "}";
          while (url.indexOf(macro) >= 0) {
            url = url.replace(macro, escape(dsRequest.data[key]));
          }
        }
        return url;
    }
});

isc.DataSource.addClassMethods({

  // loadSchema - attempt to load a remote dataSource schema from the server.
  // This is supported as part of the SmartClient server functionality

  loadSchema: function(name, callback, context) {
    var ds = isc.DataSource.getDataSource(name);
    if (ds) {
      context.fireCallback(callback, "ds", [ds], context);
      return null;
    }

    isc.RPCManager.sendRequest({
      evalResult: true,
      useSimpleHttp: true,
      httpMethod: "GET",
      actionURL: "/" + name + "/schema.scjs",
      callback: this._loadSchemaComplete,
      clientContext: {
        dataSource: name,
        callback: callback,
        context: context
      }
    });

    return null;
  },

  _loadSchemaComplete: function(rpcResponse, data, rpcRequest) {
    var clientContext = rpcResponse.clientContext
    var name = clientContext.dataSource;
    var callback = clientContext.callback;
    var context = clientContext.context;

    // Now that the dataSource is loaded, we can leverage the DataSource.getDataSource()
    // method to make the callback.
    var ds = isc.DataSource.getDataSource(name);
    context.fireCallback(callback, "ds", [ds], context);
  }
});
