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
  },

  logout: function() {
    var ds = isc.DataSource.get("scholar_sessions");
    // The id: is bogus ... this is really a singleton on the server
    ds.removeData({id: 1}, function(dsResponse, data, dsRequest) {
      if (dsResponse.status == 0) isc.LG.app.fireLogout();
    });
  },
  
  fireSuccessfulRegistration: function(value) {
    this.email = value;
    return this;
  },

  fireSuccessfulActivation: function(email) {
    this.fireSuccessfulLogin(email);
    return this;
  },

  fireSuccessfulLogin: function(email) {
    this.loggedIn = email;
    this.loginWindow.destroy();
    this.loginWindow = null;
    return this; 
  },

  fireLogout: function() {
    this.loggedIn = null;
    return this;
  }
});

isc.defineClass("ChapterTitlesGrid", isc.ListGrid).addProperties({
  dataSource: "chapter_titles",
  autoFetchData: true,
  showAllRecords: true,
  selectionType: "single",
  selectionChanged: function(record, state) {
    // For observation
    return [record, state];
  },
  fields: [
    {name: "n", width: "60", align: "right"},
    {name: "toctitle"},
    {name: "col", width: "40", align: "right"}
  ]
});

isc.RailsDataSource.create({
  ID: "chapter_titles",
  dataURL: "/chapter_titles",
  fields: [
    {
      name: "n",
      type: "text",
      primaryKey: true,
      title: "Chapter"
    },
    {
      name: "toctitle",
      type: "text",
      title: "Title"
    },
    {
      name: "col",
      type: "integer",
      title: "Column"
    }
  ]
});

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

isc.RailsDataSource.create({
  ID: "pages",
  dataURL: "/pages",
  fields: [
    {
      name: "id",
      type: "integer",
      primaryKey: true
    },
    {
      name: "column_start",
      type: "integer"
    },
    {
      name: "column_end",
      type: "integer"
    },
    {
      name: "png_url",
      type: "image"
    }
  ]
});

isc.defineClass("PageScroll", isc.VLayout).addProperties({
  initWidget: function() {
    this.column = -1;

    this.pages = isc.ResultSet.create({
      dataSource: "pages",
      fetchMode: "local",
      dataArrived: function(startRow, endRow) {
        // To be observed
        return [startRow, endRow];
      }
    });
    
    this.observe(this.pages, "dataArrived", "observer.handleDataArrived()");

    this.image = isc.Img.create({
      imageType: "normal",
      overflow: "scroll",
      defaultWidth: "100%",
      defaultHeight: "100%",
      naturalImageWidth: 2035.0,
      naturalImageHeight: 1318.0,
      magnification: null,
      aspectRatio: 2035.0 / 1318.0,
      canDrag: true,
      cursor: "all-scroll",
      dragAppearance: "none",
      dragStart: function() {
        this.scrollLeftStart = this.getScrollLeft();
        this.scrollTopStart = this.getScrollTop();
      },
      dragMove: function() {
        this.scrollTo(
          this.scrollLeftStart - isc.Event.lastEvent.x + isc.Event.mouseDownEvent.x,
          this.scrollTopStart - isc.Event.lastEvent.y + isc.Event.mouseDownEvent.y
        );
      },
      draw: function() {
        this.Super("draw", arguments);
        if (this.magnification) return;
        var widthRatio = this.getInnerContentWidth() / this.naturalImageWidth;
        var heightRatio = this.getInnerContentHeight() / this.naturalImageHeight;
        this.magnification = widthRatio < heightRatio ? widthRatio : heightRatio;
        this.zoom();
      },
      zoom: function() {
        this.imageHeight = this.naturalImageHeight * this.magnification;
        this.imageWidth = this.naturalImageWidth * this.magnification;
        this.markForRedraw();
      },
      mouseWheel: function() {
        var ev = isc.Event.lastEvent;
        var factor = 1 + (ev.wheelDelta > 0 ? 0.1 : -0.1);
        this.magnify(factor);
      },
      click: function() {
        this.magnify(isc.Event.shiftKeyDown() ? 0.9 : 1.1);
        return false;
      },
      magnify: function(factor) {
        var ev = isc.Event.lastEvent;
        var apparentY = ev.y - this.getPageTop();
        var apparentX = ev.x - this.getPageLeft();
        var realX = apparentX + this.getScrollLeft();
        var realY = apparentY + this.getScrollTop();
        var newX = realX * factor;
        var newY = realY * factor;

        this.magnification = this.magnification * factor;
        this.zoom();

        // If we'll be scrolled, then try to keep the mouse over the same point
        var scrollY = this.imageHeight > this.getInnerContentHeight();
        var scrollX = this.imageWidth > this.getInnerContentWidth();
        if (scrollX || scrollY) {
          this.scrollTo(scrollX ? newX - apparentX : this.getScrollLeft(), 
                        scrollY ? newY - apparentY : this.getScrollTop());
        }
      }
    });

    this.slider = isc.Slider.create({
      width: "100%",
      minValue: 0,
      maxValue: 574,
      numValues: 575,
      stepPercent: 1.0 / 575.0,
      title: "Column",
      vertical: false,
      valueChanged: function(value) {
        return value;
      }
    });

    this.observe(this.slider, "valueChanged", "observer.setColumn(returnVal)");

    this.addMember(this.image);
    this.addMember(this.slider);

    this.setColumn(0);
    
    this.Super("initWidget", arguments);
  },

  handleDataArrived: function() {
    this.ignore(this.pages, "dataArrived");
    var column = this.column;
    this.column = -1;
    this.setColumn(column);
  },

  setColumn: function(column) {
    if (this.column == column) return column;
    this.column = column;
    if (this.slider.value != column) this.slider.setValue(column);
    
    this.pages.setCriteria({
      _constructor: "AdvancedCriteria",
      operator: "and",
      criteria: [
        {fieldName: "column_start", operator: "lessOrEqual", value: column},
        {fieldName: "column_end", operator: "greaterOrEqual", value: column}
      ]
    });
    
    var page = this.pages.get(0);
    if (!page) return column;
    if (this.image.src != page.png_url) {
      this.image.setSrc(page.png_url);
    }
    return column;
  }
});

// The overall app nav widget
isc.defineClass("AppNav", isc.VLayout).addProperties({
  initWidget: function () {
    this.Super("initWidget", arguments);

    this.addMember(isc.LoginButton.create());
    
    this.chapterTitles = isc.ChapterTitlesGrid.create({
      width: "600",
      height: "33%",
      showEdges: true
    });

    this.pageScroll = isc.PageScroll.create({
      width: "100%",
      height: "50%",
      showEdges: true
    });

    this.observe(this.chapterTitles, "selectionChanged", "observer.handleChapterSelection(returnVal)");
    this.observe(this.pageScroll, "setColumn", "observer.handleSetColumn()");

    this.addMember(this.chapterTitles);
    this.addMember(this.pageScroll);
  },
  
  handleChapterSelection: function(retVal) {
    var record = retVal[0];
    var state = retVal[1];
    if (state) {
      if (this.pageScroll.column != record.col) {
        this.pageScroll.setColumn(record.col);
      }
    }
  },

  handleSetColumn: function() {
    var rows = this.chapterTitles.getTotalRows();
    var selectRecord = null;
    var newColumn = this.pageScroll.column;
    
    var x;
    for (x = 0; x < rows; x++) {
      var record = this.chapterTitles.getRecord(x);
      if (record.col > newColumn) break;
      selectRecord = record;
    }
    x--;

    if (!selectRecord) return;
    var selectedRecord = this.chapterTitles.getSelectedRecord();
    if (selectedRecord && (selectedRecord.n == selectRecord.n)) return;
    
    this.chapterTitles.deselectAllRecords();
    this.chapterTitles.selectRecord(selectRecord);

    var body = this.chapterTitles.body;
    var visible = body.getVisibleRows();
    if (x < visible[0]) {
      body.scrollBy(0, (x - visible[0] - 3) * body.cellHeight);
    } else if (x > visible[1]) {
      body.scrollBy(0, (x - visible[1] + 3) * body.cellHeight);
    }
  }
});

isc.Page.setEvent("load", function() {
  var app = isc.LG.create();
  app.layout.draw();
}, Page.FIRE_ONCE);

