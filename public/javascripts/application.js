isc.setAutoDraw(false);

isc.defineClass("LG");

// isc.LG is the main "controller" class. It is a singleton that
// can be accessed at isc.LG.app (a class variable)
isc.LG.addClassProperties({
  app: null
});

isc.LG.addProperties({
  init: function () {
    this.Super("init", arguments);

    isc.LG.app = this;

    this.initAuthorization();
    this.initScrolling();

    this.layout = isc.AppNav.create({
      width: "100%",
      height: "100%"
    });
  }
});

isc.defineClass("AppMenu", isc.Menu).addProperties({
  width: 100,
  canHover: true,
  hoverDelay: 1200,
  hoverWidth: 200,
  cellHoverHTML: function(record, rowNum, colNum) {
    return record.hoverText;
  }
});

// The overall app nav widget
isc.defineClass("AppNav", isc.VLayout).addProperties({
  height: "100%",
  width: "100%",
  overflow: "hidden",
  initWidget: function () {
    this.Super("initWidget", arguments);

    this.loginButton = isc.LoginButton.create();

    this.menuBar = isc.MenuBar.create({
      menus: [
        isc.AppMenu.create({
          title: "Show",
          data: [
            {
              title: "Chapters",
              action: function() {
                isc.LG.app.layout.documentArea.addChild(isc.ChapterTitlesWindow.create());
              },
              hoverText: "New Chapter Titles List"
            },
            {
              title: "Text",
              action: function() {
                isc.LG.app.layout.documentArea.addChild(isc.TextWindow.create());
              },
              hoverText: "New Text"
            },
            {
              title: "Facsimile",
              action: function() {
                isc.LG.app.layout.documentArea.addChild(isc.PageScrollWindow.create());
              },
              hoverText: "New Facsimile"
            },
            {
              title: "Figures",
              action: function() {
                isc.LG.app.layout.documentArea.addChild(isc.FiguresWindow.create());
              },
              hoverText: "New Figures List"
            },
            {
              title: "Comments",
              action: function() {
                isc.LG.app.layout.documentArea.addChild(isc.GlobalCommentsWindow.create());
              },
              hoverText: "New Comments List"
            }
          ]
        }),
        isc.AppMenu.create({
          title: "Debug",
          data: [
            {
              title: "Show Console",
              action: function() {
                isc.showConsole();
              },
              hoverText: "Show SmartClient Debugging Console"
            }
          ]
        })
      ]
    });
   
    this.documentArea = isc.Canvas.create({
      width: "100%",
      height: "100%",
      overflow: "hidden"
    });
    
    this.addMembers([
      isc.HLayout.create({
        members: [
          this.menuBar,
          this.loginButton
        ]
      }),
      this.documentArea
    ]);
   
    var leftWidth = 360;
    var chapterHeight = 200;
    var padding = 4;

    var chapterTitles = isc.ChapterTitlesWindow.create({
      top: padding,
      left: padding,
      width: leftWidth,
      height: chapterHeight
    })
    this.documentArea.addChild(chapterTitles)
    
    var footer = chapterTitles.footerHeight;

    this.documentArea.addChild(
      isc.TextWindow.create({
        top: (padding * 2) + chapterHeight,
        left: padding,
        width: leftWidth,
        height: this.documentArea.getInnerContentHeight() - (padding * 3) - footer - chapterTitles.getHeight()
      })
    );

    this.documentArea.addChild(
      isc.PageScrollWindow.create({
        top: padding,
        height: this.documentArea.getHeight() - (padding * 2) - footer,
        left: leftWidth + (padding * 2),
        width: this.documentArea.getInnerContentWidth() - (padding * 3) - chapterTitles.getWidth() 
      })
    );
  }
});

isc.Page.setEvent("load", function() {
  var app = isc.LG.create();
  app.layout.draw();
}, isc.Page.FIRE_ONCE);

