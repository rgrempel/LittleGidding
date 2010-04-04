isc.setAutoDraw(false);

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
  initScrolling: function () {
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

isc.defineClass("AppWindow", isc.Window).addProperties({
  defaultWidth: "50%",
  defaultHeight: "50%",
  canDragReposition: true,
  canDragResize: true,
  keepInParentRect: true,
  showFooter: true,
  showResizer: true,
  showMaximizeButton: true,
  animateMinimize: true,
  contentPanelClass: null,
  contentPanel: null,

  closeClick: function() {
    this.markForDestroy();
  },

  initWidget: function() {
    this.headerControls = [
      "headerIcon",
      "headerLabel",
      isc.DynamicForm.create({
        width: 75,
        numCols: 2,
        layoutAlign: "center",
        parentWindow: this,
        fields: [{
          name: "Synchronize on click?",
          type: "checkbox",
          defaultValue: true,
          changed: function (form, item, value) {
            form.parentWindow.contentPanel.synchronizeOnClick = value;
          }
        }]
      }),
      "minimizeButton",
      "maximizeButton",
      "closeButton"
    ];
    
    this.Super("initWidget", arguments);
    
    this.contentPanel = isc[this.contentPanelConstructor].create({
      parentWindow: this,
      synchronizeOnClick: true
    });
    this.addItem(this.contentPanel);
  }
});

isc.defineClass("ChapterTitlesWindow", isc.AppWindow).addProperties({
  defaultWidth: "33%",
  defaultHeight: "33%",
  showMaximizeButton: false,
  title: "Chapters",
  contentPanelConstructor: "ChapterTitlesGrid"
});

isc.defineClass("ChapterTitlesGrid", isc.ListGrid).addProperties({
  dataSource: "chapter_titles",
  autoFetchData: true,
  showAllRecords: true,
  alternateRecordStyles: true,
  selectionType: "single",
  selectionChanged: function(record, state) {
    if (state && !this.handlingColumnChange) {
      if (!this.synchronizeOnClick) return;
      isc.LG.app.scrollToColumn(record.col);
    }
  },
  fields: [
    {name: "n", width: "60", align: "right"},
    {name: "toctitle"},
    {name: "col", width: "40", align: "right"}
  ],
  initWidget: function() {
    this.Super("initWidget", arguments);
    this.observe(isc.LG.app, "fireScrollToColumn", "observer.handleScrollToColumn(returnVal)");
  },
  handleScrollToColumn: function(newColumn) {
    if (!this.synchronizeOnClick) return;

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

    this.handlingColumnChange = true;
    this.selectSingleRecord(selectRecord);
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

isc.defineClass("FiguresWindow", isc.AppWindow).addProperties({
  defaultWidth: "66%",
  defaultHeight: "80%",
  title: "Figures",
  contentPanelConstructor: "FiguresGrid"
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
    {name: "text", width: "*"},
    {name: "ms", width: "*"},
    {name: "source", width: "*"},
    {name: "inven", width: "*"},
    {name: "sculp", width: "*"},
    {name: "fe", width: "*"},
    {name: "date", width: "*"},
  ],
  recordDoubleClick: function(viewer, record, recordNum, field, fieldNum, value, rawValue) {
    isc.LG.app.showFigureEditor(record);
  },
  selectionChanged: function(record, state) {
    if (state) {
      if (!this.synchronizeOnClick) return;
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
    if (!this.synchronizeOnClick) return;

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
  }
});

isc.defineClass("TextWindow", isc.AppWindow).addProperties({
  defaultWidth: "33%",
  defaultHeight: "80%",
  title: "Text",
  contentPanelConstructor: "TextGrid"
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
    if (record.type == "figure") {
      isc.LG.app.showFigureEditorForID(record.id);
    }
  },
  selectionChanged: function(record, state) {
    if (!this.synchronizeOnClick) return;
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
    if (!this.synchronizeOnClick) return;
    if (!text) return;

    var visible = this.body.getVisibleRows();

    // Return if we have no data ...
    if (visible[0] == -1) return;

    // Check if the desired column is currently visible
    if ((visible[0] <= text.position) && (visible[1] >= text.position)) return;

    this.body.scrollToRatio(true, text.position / this.getTotalRows());
  }
});

isc.defineClass("SeaDragon","Canvas").addProperties({
  dzi_url: null,
  viewer: null,
  draw: function () {
    this.Super("draw", arguments);
    this.viewer = new Seadragon.Viewer(this.getHandle());
    this.viewer.iscHandler = this;
    this.viewer.addEventListener("animation", this.handleVisible);
    this.viewer.addEventListener("open", this.handleVisible);
    this.viewer.addEventListener("resize", this.handleVisible);
    this.setDZIURL(this.dzi_url);
  },
  clear: function () {
    this.closeDZI();
    this.viewer = null;
    this.Super("clear", arguments);
  },
  handleVisible: function(viewer) {
    viewer.iscHandler.fireVisible();
  },
  getSeaDragonBounds: function() {
    return this.viewer.viewport.getBounds(true);
  },
  fireVisible: function() {
    return this.getSeaDragonBounds();
  },
  setDZIURL: function (newURL) {
    this.dzi_url = newURL;
    if (this.dzi_url) {
      this.openDZI();
    } else {
      this.closeDZI();
    }
  },
  openDZI: function () {
    if (this.viewer) this.viewer.openDzi(this.dzi_url);
  },
  closeDZI: function () {
    if (this.viewer) this.viewer.close();
  }
});

isc.defineClass("PageGrid", isc.ListGrid).addProperties({
  dataSource: "pages",
  autoFetchData: true,
  selectionType: "single",
  showHeader: false,
  handlingPageChange: false,
  draw: function() {
    this.Super("draw", arguments);
    if (this.pageOnDraw) {
      // TODO: This is probably not the right way to do this ...
      this.delayCall("handleScrollToPage", [this.pageOnDraw], 1000);
      this.pageOnDraw = null;
    }
  },
  setPercentRect: function(percentRect) {
    var box = [
      percentRect.x * 150,
      percentRect.y * 150,
      percentRect.width * 150,
      percentRect.height * 150
    ]

    if (box[0] + box[2] > 150) box[2] = 150 - box[0];
    if (box[1] + box[3] > 97) box[3] = 97 - box[1];
    if (box[0] < 0) {
      box[2] = box[2] + box[0];
      box[0] = 0;
    }
    if (box[1] < 0) {
      box[3] = box[3] + box[1];
      box[1] = 0;
    }
    
    box[1] = box[1] + this.viewableBox.topOffset;
    
    this.viewableBox.setRect(box);
  },
  fields: [
    {name: "thumbnail_url", cellAlign: "center", imageHeight: 97, imageWidth: 150, width: 150}
  ],
  selectionChanged: function(record, state) {
    if (state) {
      if (!this.handlingPageChange) this.fireScrollToPage(record);
    }
  },
  fireScrollToPage: function(page) {
    return page;
  },
  initWidget: function() {
    this.Super("initWidget", arguments);
    this.viewableBox = isc.Canvas.create({
      border: "2px dashed yellow"
    });
  },
  handleScrollToPage: function(page) {
    if (this.handlingPageChange) return;
    if (!this.isDrawn()) {
      this.pageOnDraw = page;
      return;
    }

    var visible = this.getVisibleRows();
    if (visible[0] < 0) return;

    // check if page is  visible
    var pageIsVisible = false;
    for (var x = visible[0]; x <= visible[1]; x++) {
      if (this.getRecord(x).id == page.id) {
        pageIsVisible = true;
        break;
      }
    }
    
    if (!pageIsVisible) {
      this.body.scrollToRatio(true, page.sc_row / this.getTotalRows());
    }
    
    this.handlingPageChange = true;
    this.selectSingleRecord(page.sc_row);
    this.handlingPageChange = false;
      
    this.addEmbeddedComponent(this.viewableBox, page, page.sc_row, 0, "within");
    this.viewableBox.topOffset = page.sc_row * 97;
  }  
});

isc.defineClass("PageScrollWindow", isc.AppWindow).addProperties({
  defaultWidth: 640,
  defaultHeight: 480,
  title: "Facsimile",
  contentPanelConstructor: "PageScroll"
});

isc.defineClass("PageScroll", isc.HLayout).addProperties({
  width: "100%",
  height: "100%",
  initWidget: function() {
    this.Super("initWidget", arguments);
    
    this.image = isc.SeaDragon.create({
      width: "*"
    });

    this.slider = isc.PageGrid.create({
      cellHeight: 97,
      width: 175
    });

    this.mustLoginLabel = isc.Label.create({
      align: "center",
      contents: "You must login in order to see page images",
      defaultWidth: "100%",
      defaultHeight: "100%"
    });

    this.observe(this.image, "fireVisible", "observer.handleImageScrolled(returnVal)");

    this.observe(isc.LG.app, "fireScrollToPage", "observer.handleScrollToPage(returnVal)");
    this.observe(this.slider, "fireScrollToPage", "observer.handleScrollToPageFromSlider(returnVal)");
    
    this.observe(isc.LG.app, "fireLogin", "observer.handleLogin()");
    this.observe(isc.LG.app, "fireLogout", "observer.handleLogout()");

    if (isc.LG.app.scholar) {
      this.addMembers([this.image, this.slider]);
    } else {
      this.addMember(this.mustLoginLabel);
    }
  },

  handleImageScrolled: function(bounds) {
    this.slider.setPercentRect(bounds);
  },

  handleLogin: function() {
    this.removeMember(this.mustLoginLabel);
    this.addMembers([this.image, this.slider]);
  },

  handleLogout: function() {
    this.removeMembers([this.image, this.slider]);
    this.addMember(this.mustLoginLabel);
  },

  updatePage: function(page) {
    this.slider.handleScrollToPage(page);
    if (page && (this.image.dzi_url != page.dzi_url)) {
      this.image.setDZIURL(page.dzi_url);
    }
  },

  handleScrollToPage: function(page) {
    if (!this.synchronizeOnClick) return;
    this.updatePage(page);
  },

  handleScrollToPageFromSlider: function(page) {
    this.updatePage(page);
    if (!this.synchronizeOnClick) return;
    isc.LG.app.scrollToColumn(page.column_start);
  }
});

