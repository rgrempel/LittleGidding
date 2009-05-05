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

    this.globalComments = isc.GlobalComments.create();

    this.textGrid = isc.TextGrid.create({
      width: "100%",
      height: "100%"
    });

    this.addMembers([
      isc.ToolStrip.create({
        members: [
          this.loginButton
        ]
      }),
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
                  {title: "Comments", pane: this.globalComments}
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

