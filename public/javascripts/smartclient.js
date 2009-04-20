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

isc.RailsDataSource.create({
  ID: "scholars",
  dataURL: "/scholars.xml",
  fields: [
    {
      name: "id",
      type: "integer",
      primaryKey: true,
      canEdit: false
    },
    {
      name: "full_name",
      type: "text",
      title: "Full Name",
      length: 255,
      required: true
    },
    {
      name: "email",
      type: "text",
      title: "E-Mail Address",
      length: 255,
      required: true
    },
    {
      name: "institution",
      type: "text",
      title: "Institutional Affiliation",
      length: 255,
      required: true
    }
  ]
});

isc.defineClass("RegistrationForm", isc.DynamicForm);
isc.RegistrationForm.addProperties({
  dataSource: "scholars",
  fields: [
    {type: "header", defaultValue: "Register"},
    {name: "full_name"},
    {name: "email"},
    {name: "institution"},
    {name: "password", type: "password", title: "Password"},
    {name: "password_confirmation", type: "password", title: "Confirm Password"},
    {name: "submit", type: "submit", title: "Register"}
  ]
});

isc.RailsDataSource.create({
  ID: "scholar_sessions",
  dataURL: "/scholar_sessions.xml",
  fields: [
    {
      name: "id",
      type: "integer",
      primaryKey: true,
      canEdit: false
    },
    {
      name: "email",
      type: "text",
      title: "Email Address",
      length: 50,
      required: true
    },
    {
      name: "password",
      type: "password",
      title: "Password",
      length: 20,
      required: true
    }
  ]
});

isc.defineClass("LoginForm", isc.DynamicForm);
isc.LoginForm.addProperties({
  dataSource: "scholar_sessions",
  fields: [
    {type: "header", defaultValue: "Login"},
    {name: "email"},
    {name: "password"},
    {name: "space", type: "spacer", height: 10},
    {name: "submit", type: "submit", title: "Login", align: "right", titleAlign: "right"}
  ]
});

// A button that knows how to login
isc.defineClass("LoginButton", isc.Button);
isc.LoginButton.addProperties({
  title: "Login or Register",
  width: 200,
  action: function() {
    isc.LG.app.showLoginWindow();
  }
});

// The login/signup dialog
isc.defineClass("LoginWindow", isc.Window);
isc.LoginWindow.addProperties({
  autoCenter: true,
  title: "Login or Register",
  width: 400,
  height: 400,

  initWidget: function() {
    this.Super("initWidget", arguments);
    
    this.loginForm = isc.LoginForm.create();
    this.registrationForm  = isc.RegistrationForm.create();
    
    this.tabSet = isc.TabSet.create({
      tabs: [
        {title: "Login", pane: this.loginForm},
        {title: "Register", pane: this.registrationForm},
        {title: "Activate"},
        {title: "Reset Password"}
      ]
    });
    
    this.addItem(this.tabSet);
  },

  show: function() {
    this.Super("show", arguments);

    this.loginForm.editNewRecord();
    this.registrationForm.editNewRecord();
  }
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

