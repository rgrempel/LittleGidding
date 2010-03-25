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
      height: "100%"
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

    this.chapterTitles = isc.ChapterTitlesWindow.create({});

    this.documentArea.addChild(this.chapterTitles);

    this.documentArea.addChild(
      isc.TextWindow.create({
        defaultWidth: "33%",
        defaultHeight: 400,
        top: 200
      })
    );

    this.documentArea.addChild(
      isc.PageScrollWindow.create({
        defaultWidth: "66%",
        defaultHeight: "66%",
        left: 300
      })
    );
  }
});

isc.Page.setEvent("load", function() {
  var app = isc.LG.create();
  app.layout.draw();
}, isc.Page.FIRE_ONCE);

