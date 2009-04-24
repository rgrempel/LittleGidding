isc.setAutoDraw(false);

isc.RailsDataSource.create({
  ID: "scholars",
  dataURL: "/scholars",
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
    {name: "base", type: "header", defaultValue: "Register"},
    {name: "full_name"},
    {name: "email"},
    {name: "institution"},
    {name: "password", type: "password", title: "Password", required: true},
    {name: "password_confirmation", type: "password", title: "Confirm Password", required: true},
    {
      name: "submit",
      title: "Register",
      align: "right",
      type: "button", 
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

isc.RailsDataSource.create({
  ID: "scholar_sessions",
  dataURL: "/scholar_sessions",
  fields: [
    {
      name: "id",
      type: "text",
      primaryKey: true
    },
    {
      name: "email",
      type: "text",
      title: "Email Address",
      length: 50,
      required: true
    }
  ]
});

isc.defineClass("LoginForm", isc.DynamicForm);
isc.LoginForm.addProperties({
  dataSource: "scholar_sessions",
  fields: [
    {name: "base", type: "header", defaultValue: "Login"},
    {name: "email"},
    {name: "password", type: "password", title: "Password", required: true},
    {name: "space", type: "spacer", height: 10},
    {
      name: "submit",
      title: "Login",
      align: "right",
      type: "button", 
      click: function (form, item) {
        form.submit (function(dsResponse, data, dsRequest) {
          form.handleSubmission(dsResponse, data, dsRequest);
        });
      }
    },
  ],

  handleSubmission: function(dsResponse, data, dsRequest) {
    if (dsResponse.status == 0) {
      //  isc.LG.app.setEmail(data.email);
      this.editNewRecord();
      isc.say(
        "You have successfully logged in!", function(){
          isc.LG.app.fireSuccessfulLogin(data.email);
        }
      );
    } 
  },

  initWidget: function() {
    this.Super("initWidget", arguments);
    this.observe(isc.LG.app, "fireSuccessfulRegistration", "observer.setValue('email', isc.LG.app.email)");
  }
});

isc.defineClass("ActivationForm", isc.DynamicForm).addProperties({
  dataSource: "scholar_sessions",
  fields: [
    {name: "base", type: "header", defaultValue: "Activate Account"},
    {name: "email"},
    {name: "perishable_token", type: "text", title: "Activation Code"},
    {
      name: "submit",
      title: "Activate",
      align: "right",
      type: "button", 
      click: function (form, item) {
        form.submit (function(dsResponse, data, dsRequest) {
          form.handleSubmission(dsResponse, data, dsRequest);
        });
      }
    },
  ],
    
  handleSubmission: function(dsResponse, data, dsRequest) {
    if (dsResponse.status == 0) {
      //  isc.LG.app.setEmail(data.email);
      this.editNewRecord();
      isc.say(
        "You have successfully activated your account! From now on, use your email and password to log in.", 
        function() {
          isc.LG.app.fireSuccessfulActivation(data.email);
        }
      );
    }    
  },

  initWidget: function() {
    this.Super("initWidget", arguments);
    this.observe(isc.LG.app, "fireSuccessfulRegistration", "observer.setValue('email', isc.LG.app.email)");
  }
});

isc.defineClass("PasswordResetForm", isc.DynamicForm).addProperties({
  dataSource: "scholars",
  fields: [
    {name: "base", type: "header", defaultValue: "Reset Password"},
    {name: "email"},
    {
      name: "submit",
      title: "Reset Password",
      align: "right",
      type: "button", 
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
    this.observe(isc.LG.app, "fireSuccessfulLogin", "observer.handleLogin()");
    this.observe(isc.LG.app, "fireLogout", "observer.handleLogout()");
    if (isc.LG.app.loggedIn) {
      this.handleLogin();
    } else {
      this.handleLogout();
    }
  },
  handleLogin: function() {
    this.setTitle("Logout: " + isc.LG.app.loggedIn);
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
      ]
    });
    
    this.addItem(this.tabSet);

  //  this.observe(isc.LG.app, "fireSuccessfulActivation", "observer.closeClick()");
  //  this.observe(isc.LG.app, "fireSuccessfulLogin", "observer.closeClick()");
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

