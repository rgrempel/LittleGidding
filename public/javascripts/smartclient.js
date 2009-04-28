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

  showFigureEditor: function(record) {
    isc.FigureEditor.create({record: record}).show();
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
  },

  column: 0,

  setColumn: function(value) {
    if (this.column != value) {
      this.column = value;
      this.fireColumnChanged(value);
    }
  },

  // For observation
  fireColumnChanged: function(value) {
    return value;
  }
});

isc.defineClass("ChapterTitlesGrid", isc.ListGrid).addProperties({
  dataSource: "chapter_titles",
  autoFetchData: true,
  showAllRecords: true,
  alternateRecordStyles: true,
  selectionType: "single",
  selectionChanged: function(record, state) {
    if (state && !this.handlingColumnChange) isc.LG.app.setColumn(record.col);
  },
  fields: [
    {name: "n", width: "60", align: "right"},
    {name: "toctitle"},
    {name: "col", width: "40", align: "right"}
  ],
  init: function() {
    this.Super("init", arguments);
    this.observe(isc.LG.app, "fireColumnChanged", "observer.handleColumnChanged()");
  },
  handleColumnChanged: function() {
    var newColumn = isc.LG.app.column;
    var selectedRecord = this.getSelectedRecord();
    if (selectedRecord && selectedRecord.col == newColumn) return;

    var rows = this.getTotalRows();
    var selectRecord = null;
    var x;
    for (x = 0; x < rows; x++) {
      var record = this.getRecord(x);
      if (record.col > newColumn) break;
      selectRecord = record;
    }
    x--;

    if (!selectRecord) return;
    if (selectedRecord && (selectedRecord.n == selectRecord.n)) return;
    
    this.deselectAllRecords();
    this.handlingColumnChange = true;
    this.selectRecord(selectRecord);
    this.handlingColumnChange = false;

    var body = this.body;
    var visible = body.getVisibleRows();
    if (x < visible[0]) {
      body.scrollBy(0, (x - visible[0] - 3) * body.cellHeight);
    } else if (x > visible[1]) {
      body.scrollBy(0, (x - visible[1] + 3) * body.cellHeight);
    }
  }
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
  ID: "comments",
  dataURL: "/comments",
  fields: [
    {
      name: "id",
      type: "integer",
      primaryKey: true,
      hidden: true
    },
    {
      name: "scholar_id",
      type: "integer",
      title: "Scholar",
      foreignKey: "scholars.id" 
    },
    {
      name: "figure_id",
      type: "text",
      title: "Figure",
      foreignKey: "figures.id"
    },
    {
      name: "comment",
      type: "text",
      title: "Comment"
    },
    {
      name: "created_at",
      type: "date",
      title: "Date"
    }
  ]
});

isc.defineClass("FiguresGrid", isc.ListGrid).addProperties({
  dataSource: "figures",
  autoFetchData: true,
  showAllRecords: false,
  selectionType: "single",
  alternateRecordStyles: true,
  cellPadding: 4,
  titleField: "figDesc",
  wrapCells: true,
  bodyProperties: {
    fixedRowHeights: false
  },
  getCellVAlign: function(record, rowNum, colNum) {
    return "top";
  },
  fields: [
    {name: "col", width: "60"},
    {name: "figDesc", width: "*"},
    {name: "head", width: "*"},
    {name: "text", width: "*"}
  ],
  recordDoubleClick: function(viewer, record, recordNum, field, fieldNum, value, rawValue) {
    isc.LG.app.showFigureEditor(record);
  },
  selectionChanged: function(record, state) {
    if (state) {
      this.settingColumn = true;
      isc.LG.app.setColumn(record.col);
      this.settingColumn = false;
    }
  },
  initWidget: function() {
    this.Super("initWidget", arguments);
    this.summary = isc.ResultSet.create({
      dataSource: "figures_summary",
      fetchMode: "local",
      dataArrived: function(startRow, endRow) {
        // To be observed
        return [startRow, endRow];
      }
    });
    this.observe(this.summary, "dataArrived", "observer.handleSummaryData(returnVal)");
    this.summary.getRange(0,1);
    this.observe(isc.LG.app, "fireColumnChanged", "observer.handleColumnChanged()");
  },
  handleSummaryData: function(returnVal) {
    // What this will give me is all the figures at or past the desired column
    // So I basically want the first one ...
    if ((returnVal[0] != 0) || (returnVal[1] < 1)) return;
    var desiredFigure = this.summary.getRange(0, 1)[0];
    if (desiredFigure == Array.LOADING) return;
    var desiredRow = Math.max(desiredFigure.position - 2, 0);
    this.body.scrollToRatio(true, desiredRow / this.getTotalRows());  
  },
  handleColumnChanged: function() {
    if (this.settingColumn) return;
    var newColumn = isc.LG.app.column;
    var visible = this.body.getVisibleRows();
    
    // If we don't have any data yet, just return
    if (visible[0] == -1) return;
      
    // Check if the desired column is currently visible
    if ((this.getRecord(visible[0]).col <= newColumn) && (this.getRecord(visible[1].col) >= newColumn)) return;

    // If not, figure out what row to scroll to
    this.summary.setCriteria({
      _constructor: "AdvancedCriteria",
      operator: "and",
      criteria: [
        {fieldName: "col", operator: "greaterOrEqual", value: newColumn}
      ]
    });

    // This will trigger a dataArrived ... 
    this.summary.getRange(0, 1);
  }
});

isc.RailsDataSource.create({
  ID: "figures_summary",
  dataURL: "figures",
  fields: [
    {name: "id", type: "text", primaryKey: "true", hidden: true},
    {name: "position", type: "integer", hidden: true}, 
    {name: "col", type: "integer", title: "Column", xmlAttribute: true}
  ]
});

isc.RailsDataSource.create({
  ID: "figures",
  dataURL: "/figures",
  inheritsFrom: "figures_summary",
  fields: [
    {name: "figDesc", type: "text", title: "Description"},
    {name: "head", type: "text", title: "Head"},
    {name: "text", type: "text", title: "Text"},
    {name: "ms", type: "text", detail: true},
    // Source is sometime duplicated in the XML ... with identical contents
    {name: "source", type: "text", title: "Source", detail: true},
    {name: "artist", type: "text", title: "Artist", detail: true},
    {name: "inven", type: "text", detail: true},
    {name: "sculp", type: "text", detail: true},
    {name: "fe", type: "text", detail: true},
    {name: "fp", type: "text", detail: true, xmlAttribute: true},
    {name: "date", type: "text", title: "Date", detail: true},
    {name: "n", type: "text", detail: true},
    // Size is an attribute ... values miniature, small
    {name: "size", type: "text", title: "Size", detail: true, xmlAttribute: true},
    {name: "composite", type: "text", title: "Composite", detail: true, xmlAttribute: true},
  ]
});

isc.defineClass("CommentsGrid", isc.ListGrid).addProperties({
  dataSource: "comments",
  fields: [
    {name: "created_at", width: "60"},
    {name: "scholar_id", width: "100"},
    {name: "comment", width: "*"}
  ]
});

isc.defineClass("FigureEditor", isc.Window).addProperties({
  title: "Figure",
  width: 500,
  height: 300,
  canDragReposition: true,
  canDragResize: true,
  initWidget: function() {
    this.Super("initWidget", arguments);
    this.detailViewer = isc.DetailViewer.create({
      data: this.record,
      dataSource: "figures",
      showDetailFields: true,
      showEdges: true,
      showResizeBar: true,
      height: "100%",
      width: "50%",
      overflow: "auto"
    });
    this.commentsGrid = isc.CommentsGrid.create({
      showEdges: true,
      height: "100%",
      width: "50%"
    });
    this.commentsGrid.fetchRelatedData(this.record, this.detailViewer);
    this.addItem(
      isc.HLayout.create({
        height: "100%",
        width: "100%",
        members: [
          this.detailViewer, 
          this.commentsGrid
        ]
      })
    );
  }
});

isc.RailsDataSource.create({
  ID: "text",
  dataURL: "/text",
  fields: [
    {name: "source", type: "text", title: "Source"},
    {name: "html", type: "text", title: "Text"},
    {name: "col", type: "integer", title: "Column"}
  ]
});

isc.defineClass("TextGrid", isc.ListGrid).addProperties({
  dataSource: "text",
  autoFetchData: true,
  showAllRecords: false,
  selectionType: "single",
  alternateRecordStyles: false,
  cellPadding: 4,
  wrapCells: true,
  bodyProperties: {
    fixedRowHeights: false
  },
  getCellVAlign: function(record, rowNum, colNum) {
    return "top";
  },
  fields: [
    {name: "source", width: 60},
    {name: "html", width: "*"},
    {name: "col", width: 30}
  ],
  recordDoubleClick: function(viewer, record, recordNum, field, fieldNum, value, rawValue) {
    // TODO: Need to get the actual figure record ... or have supplied the whole thing in the first place?
    // if (record.type == "figure") isc.LG.app.showFigureEditor(record);
  },
  selectionChanged: function(record, state) {
    if (state) {
      isc.LG.app.setColumn(record.col);
    }
  },
  initWidget: function() {
    this.Super("initWidget", arguments);
    this.observe(isc.LG.app, "fireColumnChanged", "observer.handleColumnChanged()");
  },
  handleColumnChanged: function() {
    // TODO: figure out how to deal with this
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
        var factor = 1 + (ev.wheelDelta < 0 ? 0.1 : -0.1);
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
        isc.LG.app.setColumn(value);
      }
    });

    this.observe(isc.LG.app, "fireColumnChanged", "observer.handleColumnChanged()");

    this.addMember(this.image);
    this.addMember(this.slider);

    this.Super("initWidget", arguments);
  },

  handleDataArrived: function() {
    this.ignore(this.pages, "dataArrived");
    this.handleColumnChanged();
  },

  handleColumnChanged: function() {
    var column = isc.LG.app.column;
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
    if (page && (this.image.src != page.png_url)) {
      this.image.setSrc(page.png_url);
    }
  }
});

// The overall app nav widget
isc.defineClass("AppNav", isc.VLayout).addProperties({
  initWidget: function () {
    this.Super("initWidget", arguments);

    this.loginButton = isc.LoginButton.create();
    
    this.chapterTitles = isc.ChapterTitlesGrid.create({
      width: "100%",
      height: "33%",
      showEdges: true,
      showResizeBar: true
    });

    this.pageScroll = isc.PageScroll.create({
      width: "100%",
      height: "75%",
      showEdges: true,
      showResizeBar: true
    });

    this.figuresGrid = isc.FiguresGrid.create({
      width: "100%",
      height: "100%"
    });

    this.textGrid = isc.TextGrid.create({
      width: "100%",
      height: "100%"
    });

    this.addMembers([
      this.loginButton,
      isc.HLayout.create({
        height: "100%",
        width: "100%",
        members: [
          isc.VLayout.create({
            width: "33%",
            showResizeBar: true,
            members: [
              this.chapterTitles,
              isc.TabSet.create({
                height: "66%",
                tabs: [
                  {title: "Text", pane: this.textGrid}
                ]
              })
            ]
          }),
          isc.VLayout.create({
            width: "66%",
            members: [
              this.pageScroll,
              isc.TabSet.create({
                height: "25%",
                tabs: [
                  {title: "Figures", pane: this.figuresGrid}, 
                  {title: "Comments", pane: isc.Label.create({align: "center", contents: "Comments go here"})}                  
                ]
              })
            ]
          })
        ]
      })
    ]);
  }
});

isc.Page.setEvent("load", function() {
  var app = isc.LG.create();
  app.layout.draw();
}, Page.FIRE_ONCE);

