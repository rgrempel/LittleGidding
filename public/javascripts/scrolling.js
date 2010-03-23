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

isc.defineClass("SeaDragon","Canvas").addProperties({
  dzi_url: null,
  viewer: null,
  draw: function () {
    this.Super("draw", arguments);
    this.viewer = new Seadragon.Viewer(this.getHandle());
    this.setDZIURL(this.dzi_url);
  },
  clear: function () {
    this.closeDZI();
    this.viewer = null;
    this.Super("clear", arguments);
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

isc.defineClass("PanZoomImg", "Img").addProperties({
  imageType: "normal",
  overflow: "scroll",
  defaultHeight: "100%",
  magnification: null,
  canDrag: true,
  availableWidths: [75, 150, 300, 600, 1200, 2400],
  availableHeights: [49, 97, 194, 389, 777, 1554],
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
  // returns left,top,width,height relative from 0 to 1
  getPercentRect: function() {
    var leftPercent = this.getScrollLeft() / this.getScrollWidth();
    var topPercent = this.getScrollTop() / this.getScrollHeight();
    var widthPercent = this.getViewportWidth() / this.getScrollWidth();
    var heightPercent = this.getViewportHeight() / this.getScrollHeight();

    if (widthPercent > 1) widthPercent = 1;
    if (topPercent > 1) topPercent = 1;

    return [leftPercent, topPercent, widthPercent, heightPercent];
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
    // default to biggest file available, then check if the width is smaller than
    // one of the available widths (specified above), which should be in order from smallest
    var width = this.availableWidths.last();
    var height = this.availableHeights.last();
    for (var i = 0; i < this.availableWidths.length; i++) {
      if (this.imageWidth < this.availableWidths.get(i)) {
        width = this.availableWidths.get(i);
        height = this.availableHeights.get(i);
        break;
      }
    }
    this.setState("/" + width + "/" + height);
    this.markForRedraw();
  },
  mouseWheel: function() {
    var ev = isc.Event.lastEvent;
    var factor = ev.wheelDelta < 0 ? 1.25 : 0.8;
    this.magnify(factor);
  },
  click: function() {
    this.magnify(isc.Event.shiftKeyDown() ? 0.8 : 1.25);
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

isc.defineClass("PageGrid", isc.ListGrid).addProperties({
  dataSource: "pages",
  autoFetchData: true,
  selectionType: "single",
  showHeader: false,
  handlingPageChange: false,
  setPercentRect: function(percentRect) {
    this.viewableBox.setRect(
      percentRect[0] * 150,
      percentRect[1] * 97 + this.viewableBox.topOffset,
      percentRect[2] * 150,
      percentRect[3] * 97
    )
  },
  fields: [
    {name: "thumbnail_url", cellAlign: "center", imageHeight: 97, imageWidth: 150, width: 150}
  ],
  selectionChanged: function(record, state) {
    if (state) {
      if (!this.handlingPageChange) isc.LG.app.scrollToColumn(record.column_start);
    }
  },
  initWidget: function() {
    this.Super("initWidget", arguments);
    this.observe(isc.LG.app, "fireScrollToPage", "observer.handleScrollToPage(returnVal)");
    this.viewableBox = isc.Canvas.create({
      border: "2px dashed yellow"
    });
  },
  handleScrollToPage: function(page) {
    if (this.handlingPageChange) return;

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

isc.defineClass("PageScroll", isc.HLayout).addProperties({
  initWidget: function() {
/*  
    this.image = isc.PanZoomImg.create({
      naturalImageWidth: 2035.0,
      naturalImageHeight: 1318.0,
      aspectRatio: 2035.0 / 1318.0,
      defaultWidth: "*"
    }); 
*/

    this.image = isc.SeaDragon.create({
      defaultWidth: "*",
      defaultHeight: "100%"
    });

    this.slider = isc.PageGrid.create({
      cellHeight: 97,
      width: 175   
    });

    this.mustLoginLabel = isc.Label.create({
      align: "center",
      contents: "You must login in order to see page images",
      width: "100%",
      height: "100%"
    });

//    this.observe(this.image, "scrolled", "observer.delayCall('handleImageScrolled')");
//    this.observe(this.image, "zomm", "observer.delayCall('handleImageScrolled')");

    this.observe(isc.LG.app, "fireScrollToPage", "observer.handleScrollToPage(returnVal)");
    this.observe(isc.LG.app, "fireLogin", "observer.handleLogin()");
    this.observe(isc.LG.app, "fireLogout", "observer.handleLogout()");

    if (isc.LG.app.scholar) {
      this.addMember(this.image);
      this.addMember(this.slider);
    } else {
      this.addMember(this.mustLoginLabel);
    }

    this.Super("initWidget", arguments);
  },

  handleImageScrolled: function() {
    this.slider.setPercentRect(this.image.getPercentRect());
  },

  handleLogin: function() {
    this.removeMember(this.mustLoginLabel);
    this.addMember(this.image, 0);
    this.addMember(this.slider);
    this.image.markForRedraw();
  },

  handleLogout: function() {
    this.removeMember(this.image);
    this.removeMember(this.slider);
    this.addMember(this.mustLoginLabel, 0);
  },

  handleScrollToPage: function(page) {
    if (page && (this.image.dzi_url != page.dzi_url)) {
      this.image.setDZIURL(page.dzi_url);
    }
  }
});

