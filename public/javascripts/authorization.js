isc.setAutoDraw(false);

isc.LG.addProperties({
  initAuthorization: function() {
    this.loginRS = isc.ResultSet.create({
      dataSource: "scholar_sessions",
      dataArrived: function(startRow, endRow) {
        if (startRow == 0 && endRow >= 0) {
          isc.LG.app.setScholar (this.get(0));
        } else {
          isc.LG.app.setScholar(null);
        }
      }
    });

    // Find out if we are logged in ...
    this.loginRS.get(0);
  },

  scholar: null,

  setScholar: function(scholar) {
    this.scholar = scholar;
    if (scholar) {
      this.fireLogin(scholar);
    } else {
      this.fireLogout();
    }
  },

  loginWindow: null,

  showLoginWindow: function() {
    if (!this.loginWindow) {
      this.loginWindow = isc.LoginWindow.create();
    }
    this.loginWindow.show();
  },

  logout: function() {
    if (!this.scholar) return;
    var ds = isc.DataSource.get(this.loginRS.dataSource);
    ds.removeData({id: this.scholar.id});
  },

  email: null,

  fireSuccessfulRegistration: function(value) {
    this.email = value;
    return value;
  },

  fireLogin: function(scholar) {
    if (this.loginWindow) {
      this.loginWindow.markForDestroy();
      this.loginWindow = null;
    }
    return scholar;
  },

  fireLogout: function() {
    return this;
  }
});

isc.defineClass("RegistrationForm", isc.DynamicForm);
isc.RegistrationForm.addProperties({
  dataSource: "scholars",
  width: "100%",
  fields: [
    {name: "base", type: "header", defaultValue: "Register"},
    {name: "full_name", width: "*"},
    {name: "email", width: "*"},
    {name: "institution", width: "*"},
    {name: "password", type: "password", title: "Password", required: true, width: "*"},
    {name: "password_confirmation", type: "password", title: "Confirm Password", required: true, width: "*"},
    {name: "space", type: "spacer", height: 10},
    {
      name: "submit",
      title: "Register",
      align: "center",
      type: "button",
      colSpan: 2,
      click: function (form, item) {
        form.submit (function(dsResponse, data, dsRequest) {
          form.handleSubmission(dsResponse, data, dsRequest);
        });
      }
    }
  ],

  handleSubmission: function(dsResponse, data, dsRequest) {
    if (dsResponse.status == 0) {
      this.editNewRecord();
      isc.say(
        "You have successfully registered! Check your email for a confirmation code, and then enter it in the 'Activate' tab to continue",
        function() {
          isc.LG.app.fireSuccessfulRegistration(data.email);
        }
      );
    }
  },
});

isc.defineClass("LoginForm", isc.DynamicForm);
isc.LoginForm.addProperties({
  dataSource: "scholar_sessions",
  width: "100%",
  fields: [
    {name: "base", type: "header", defaultValue: "Login"},
    {name: "email", width: "*"},
    {name: "password", type: "password", title: "Password", required: true, width: "*"},
    {name: "space", type: "spacer", height: 10},
    {
      name: "submit",
      title: "Login",
      align: "center",
      type: "button",
      colSpan: 2,
      click: function (form, item) {
        form.submit (function(dsResponse, data, dsRequest) {
          form.handleSubmission(dsResponse, data, dsRequest);
        });
      }
    },
  ],

  handleSubmission: function(dsResponse, data, dsRequest) {
    if (dsResponse.status == 0) {
      this.editNewRecord();
      isc.say("You have successfully logged in!");
    }
  },

  initWidget: function() {
    this.Super("initWidget", arguments);
    this.observe(isc.LG.app, "fireSuccessfulRegistration", "observer.setValue('email', isc.LG.app.email)");
  }
});

isc.defineClass("ActivationForm", isc.DynamicForm).addProperties({
  dataSource: "scholar_sessions",
  width: "100%",
  fields: [
    {name: "base", type: "header", defaultValue: "Activate Account"},
    {name: "email", width: "*"},
    {name: "perishable_token", type: "text", title: "Activation Code", width: "*"},
    {name: "space", type: "spacer", height: 10},
    {
      name: "submit",
      title: "Activate",
      align: "center",
      type: "button",
      colSpan: 2,
      click: function (form, item) {
        form.submit (function(dsResponse, data, dsRequest) {
          form.handleSubmission(dsResponse, data, dsRequest);
        });
      }
    },
  ],

  handleSubmission: function(dsResponse, data, dsRequest) {
    if (dsResponse.status == 0) {
      this.editNewRecord();
      isc.say("You have successfully activated your account! From now on, use your email and password to log in.");
    }
  },

  initWidget: function() {
    this.Super("initWidget", arguments);
    this.observe(isc.LG.app, "fireSuccessfulRegistration", "observer.setValue('email', isc.LG.app.email)");
  }
});

isc.defineClass("PasswordResetForm", isc.DynamicForm).addProperties({
  dataSource: "scholars",
  width: "100%",
  fields: [
    {name: "base", type: "header", defaultValue: "Reset Password"},
    {name: "email", width: "*"},
    {name: "space", type: "spacer", height: 10},
    {
      name: "submit",
      title: "Reset Password",
      align: "center",
      type: "button",
      colSpan: 2,
      click: function (form, item) {
        form.submit (function(dsResponse, data, dsRequest) {
          form.handleSubmission(dsResponse, data, dsRequest);
        });
      }
    },
  ],

  handleSubmission: function(dsResponse, data, dsRequest) {

  }
});


// A button that knows how to login
isc.defineClass("LoginButton", isc.Button);
isc.LoginButton.addProperties({
  width: 200,
  loginAction: function() {
    isc.LG.app.showLoginWindow();
  },
  logoutAction: function() {
    isc.LG.app.logout();
  },
  initWidget: function() {
    this.Super("initWidget", arguments);
    this.observe(isc.LG.app, "fireLogin", "observer.handleLogin()");
    this.observe(isc.LG.app, "fireLogout", "observer.handleLogout()");
    if (isc.LG.app.loggedIn) {
      this.handleLogin();
    } else {
      this.handleLogout();
    }
  },
  handleLogin: function() {
    this.setTitle("Logout: " + isc.LG.app.scholar.email);
    this.action = this.logoutAction;
  },
  handleLogout: function() {
    this.setTitle("Login or Register");
    this.action = this.loginAction;
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
    this.activationForm = isc.ActivationForm.create();
    this.passwordResetForm = isc.PasswordResetForm.create();

    this.tabSet = isc.TabSet.create({
      tabs: [
        {title: "Login", pane: this.loginForm},
        {title: "Register", pane: this.registrationForm},
        {title: "Activate", pane: this.activationForm},
        {title: "Reset Password", pane: this.passwordResetForm}
      ],
      tabSelected: function(tabNum, tabPane, ID, tab) {
        tabPane.delayCall("focusInItem", [1]);
      }
    });

    this.addItem(this.tabSet);
  },

  handleSuccessfulRegistration: function() {
    this.tabSet.selectTab(2);
  },

  show: function() {
    this.Super("show", arguments);

    this.observe (isc.LG.app, "fireSuccessfulRegistration", "observer.handleSuccessfulRegistration()");

    this.loginForm.editNewRecord();
    this.registrationForm.editNewRecord();
    this.passwordResetForm.editNewRecord();
    this.activationForm.editNewRecord();
  }
});

