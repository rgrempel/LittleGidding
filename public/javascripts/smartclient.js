isc.setAutoDraw(false);

isc.defineClass("LG");

// isc.LG is the main "controller" class. It is a singleton that
// can be accessed at isc.LG.app (a class variable)
isc.LG.addClassProperties({
  app: null
});

// isc.LG is the main contact point for decoupled views. The idea is that we 
// are trying to keep several views sync'd when you click on something
//
// (a) textual views, which represent the run of text
// (b) figure views
// (c) represents of the current column (4 per double-page)
// (d) pages (actually, double-pages)
//
// The scrollXXXX methods represent an instruction to scroll all coordinated views
// to the given location.
//
// Each view type then listens to the appropriate fireScrollXXXX method, depending on
// what it needs to know in order to scroll itself.
//
// So, one job of this class is to multiplex the scrollXXX methods, so that no matter
// which scrollXXX method you call, all of the fireScrollXXX methods get called, with the appropriate
// values. It's slightly convoluted, but it does mean that we can create the widgets at will and
// they will all sync without having to know about each other.
isc.LG.addProperties({
  init: function () {
    this.Super("init", arguments);

    isc.LG.app = this;

    this.scrollToFigureRS = isc.ResultSet.create({
      dataSource: "figures_summary",
      fetchMode: "local",
      dataArrived: function(startRow, endRow) {
        if ((startRow == 0) && (endRow >= 0)) {
          var figure = this.get(0);
          // This is a bit inelegant, but if we were searching for an id,
          // then fire the column off as well ...
          if (this.getCriteria().fieldName == "id") isc.LG.app.fireScrollToColumn(figure.col);
          isc.LG.app.fireScrollToFigure(figure);
        }
      }
    });

    this.scrollToTextRS = isc.ResultSet.create({
      dataSource: "text_summary",
      fetchMode: "local",
      dataArrived: function(startRow, endRow) {
        if ((startRow == 0) && (endRow >= 0)) {
          isc.LG.app.fireScrollToText(this.get(0));
        }
      }
    });

    this.scrollToPageRS = isc.ResultSet.create({
      dataSource: "pages",
      fetchMode: "local",
      dataArrived: function(startRow, endRow) {
        if ((startRow == 0) && (endRow >= 0)) {
          isc.LG.app.fireScrollToPage(this.get(0));
        }
      }
    });
    
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

  scrollToColumn: function(value) {
    // If you're looking for the column, we can just supply it ...
    this.fireScrollToColumn(value);

    // If you want the figure, we'll find it ...
    this.scrollToFigureRS.setCriteria({
      _constructor: "AdvancedCriteria",
      fieldName: "col", 
      operator: "greaterOrEqual", 
      value: value
    });
    this.scrollToFigureRS.get(0);

    // If you want the text row, we'll find it ...
    this.scrollToTextRS.setCriteria({
      _constructor: "AdvancedCriteria",
      fieldName: "col", 
      operator: "greaterOrEqual", 
      value: value
    });
    this.scrollToTextRS.get(0);  
  },

  scrollToFigureID: function(value) {
    // Find the figure ... this will also handle the column
    this.scrollToFigureRS.setCriteria({
      _constructor: "AdvancedCriteria",
      operator: "equals",
      fieldName: "id",
      value: value
    });
    this.scrollToFigureRS.get(0);
   
    // Find the text
    this.scrollToTextRS.setCriteria({
      _constructor: "AdvancedCriteria",
      operator: "equals",
      fieldName: "id",
      value: value
    });
    this.scrollToTextRS.get(0);
  },

  // The following fireXXX events are for widgets to listen to ... just listen
  // to one, whichever one gives you the information you need. Every time something
  // calls for scrolling, they will all fire.
  fireScrollToColumn: function(column) {
    // Once we know what column to scroll to, scrolling to a page is entirely determined
    // by that. So we can do it here ...
    this.scrollToPageRS.setCriteria({
      _constructor: "AdvancedCriteria",
      operator: "and",
      criteria: [
        {fieldName: "column_start", operator: "lessOrEqual", value: column},
        {fieldName: "column_end", operator: "greaterOrEqual", value: column}
      ]
    });
    this.scrollToPageRS.get(0);

    return column;
  },

  fireScrollToFigure: function(figure) {
    return figure;
  },

  fireScrollToText: function(text) {
    return text;
  },

  fireScrollToPage: function(page) {
    return page;
  }
});

isc.defineClass("ChapterTitlesGrid", isc.ListGrid).addProperties({
  dataSource: "chapter_titles",
  autoFetchData: true,
  showAllRecords: true,
  alternateRecordStyles: true,
  selectionType: "single",
  selectionChanged: function(record, state) {
    if (state && !this.handlingColumnChange) isc.LG.app.scrollToColumn(record.col);
  },
  fields: [
    {name: "n", width: "60", align: "right"},
    {name: "toctitle"},
    {name: "col", width: "40", align: "right"}
  ],
  init: function() {
    this.Super("init", arguments);
    this.observe(isc.LG.app, "fireScrollToColumn", "observer.handleScrollToColumn(returnVal)");
  },
  handleScrollToColumn: function(newColumn) {
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
      this.settingFigureID = true;
      isc.LG.app.scrollToFigureID(record.id);
      this.settingFigureID = false;
    }
  },
  initWidget: function() {
    this.Super("initWidget", arguments);
    this.observe(isc.LG.app, "fireScrollToFigure", "observer.handleScrollToFigure(returnVal)");
  },
  handleScrollToFigure: function(figure) {
    if (this.settingFigureID) return;

    var visible = this.getVisibleRows();
    if (visible[0] < 0) return;
    
    // check if figure ID is  visible
    var figureIDisVisible = false;
    for (var x = visible[0]; x <= visible[1]; x++) {
      if (this.getRecord(x).id == figure.id) {
        figureIDisVisible = true;
        break;
      }
    }
    if (figureIDisVisible) return;
      
    this.body.scrollToRatio(true, figure.position / this.getTotalRows());
  },
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
      this.settingColumn = true;
      if (record.type == "figure") {
        isc.LG.app.scrollToFigureID(record.id);
      } else {
        isc.LG.app.scrollToColumn(record.col);
      }
      this.settingColumn = false;
    }
  },
  initWidget: function() {
    this.Super("initWidget", arguments);
    this.observe(isc.LG.app, "fireScrollToText", "observer.handleScrollToText(returnVal)");
  },
  handleScrollToText: function(text) {
    if (this.settingColumn) return;
    if (!text) return;

    var visible = this.body.getVisibleRows();

    // Return if we have no data ...
    if (visible[0] == -1) return;

    // Check if the desired column is currently visible
    if ((visible[0] <= text.position) && (visible[1] >= text.position)) return;
    
    this.body.scrollToRatio(true, text.position / this.getTotalRows());
  }
});

isc.defineClass("PageScroll", isc.VLayout).addProperties({
  initWidget: function() {
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
        if (!this.settingValue) isc.LG.app.scrollToColumn(value);
      }
    });

    this.observe(isc.LG.app, "fireScrollToColumn", "observer.handleScrollToColumn(returnVal)");
    this.observe(isc.LG.app, "fireScrollToPage", "observer.handleScrollToPage(returnVal)");
    
    this.addMember(this.image);
    this.addMember(this.slider);

    this.Super("initWidget", arguments);
  },

  handleScrollToColumn: function(column) {
    if (this.slider.value != column) {
      this.slider.settingValue = true;
      this.slider.setValue(column);
      this.slider.settingValue = false;
    }
  },

  handleScrollToPage: function(page) {
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

