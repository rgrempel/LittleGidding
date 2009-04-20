isc.setAutoDraw(false);

// This is the global application class
isc.defineClass("LG");

isc.LG.addClassProperties({
  app: null
});

isc.LG.addProperties({
  init: function () {
    this.Super("init", arguments);

    isc.LG.app = this;

    this.layout = isc.AppNav.create({
      width: "100%",
      height: "100%"
    });
  },

  loginWindow: null,

  showLoginWindow: function() {
    if (!this.loginWindow) {
      this.loginWindow = isc.LoginWindow.create();
    }
    this.loginWindow.show();
  }
});

// A button that knows how to login
isc.defineClass("LoginButton", isc.Button);
isc.LoginButton.addProperties({
  title: "Login or Register",
  action: function() {
    isc.LG.app.showLoginWindow();
  }
});

// The login/signup dialog
isc.defineClass("LoginWindow", isc.Window);
isc.LoginWindow.addProperties({
  autoCenter: true,
  title: "Login or Register"
});

// The overall app nav widget
isc.defineClass("AppNav", isc.HLayout);
isc.AppNav.addProperties({
  initWidget: function () {
    this.Super("initWidget", arguments);

    this.addMember(isc.LoginButton.create());
  }
});

isc.Page.setEvent("load", function() {
  var app = isc.LG.create();
  app.layout.draw();
}, Page.FIRE_ONCE);

