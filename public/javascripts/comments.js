isc.LG.addProperties({
  showFigureEditor: function(record) {
    isc.FigureEditor.create({figure: record}).show();
  },

  showFigureEditorForID: function(id) {
    isc.FigureEditor.create({figureID: id}).show();
  }
});

isc.defineClass("CommentsGrid", isc.ListGrid).addProperties({
  dataSource: "comments",
  alternateRecordStyles: true,
  wrapCells: true,
  bodyProperties: {
    fixedRowHeights: false
  },
  autoFetchData: true,
  dateFormatter: "toEuropeanShortDateTime",
  fields: [
    {name: "created_at", width: "90", align: "left"},
    {name: "scholar_full_name", width: "100"},
    {name: "comment", width: "*"}
  ],
  initWidget: function(){
    this.Super("initWidget", arguments);
    this.observe(isc.LG.app, "fireLogin", "observer.handleLogin()");
    this.observe(isc.LG.app, "fireLogout", "observer.handleLogout()");
    if (isc.LG.app.scholar) {
      this.handleLogin();
    } else {
      this.handleLogout();
    }
  },
  handleLogin: function() {
    this.emptyMessage = "No comments to show.";
    this.invalidateCache();
  },
  handleLogout: function() {
    this.emptyMessage = "You must login to see comments.";
    this.invalidateCache();
  }
});

isc.defineClass("GlobalComments", isc.HLayout).addProperties({
  initWidget: function() {
    this.Super("initWidget", arguments);

    this.detailViewer = isc.DetailViewer.create({
      dataSource: "figures",
      showDetailFields: true,
      showEdges: true,
      overflow: "auto",
      width: "33%",
      doubleClick: function() {
        if (this.data) {
          isc.LG.app.showFigureEditor(this.data);
        }
      }
    });

    this.figures = isc.ResultSet.create({
      dataSource: "figures",
      detailViewer: this.detailViewer,
      dataArrived: function(startRow, endRow) {
        if (startRow == 0 && endRow >= 0) {
          this.detailViewer.setData(
            this.get(0)
          );
        }
      }
    });

    this.commentsGrid = isc.CommentsGrid.create({
      showEdges: true,
      width: "66%",
      selectionType: "single",
      figures: this.figures,
      recordDoubleClick: function(viewer, record, recordNum, field, fieldNum, value, rawValue) {
        isc.LG.app.showFigureEditorForID(record.figure_id);
      },
      selectionChanged: function(record, state) {
        if (state) {
          this.figures.setCriteria({
            id: record.figure_id
          });
          this.figures.get(0);
          isc.LG.app.scrollToFigureID(record.figure_id);
        }
      }
    });

    this.addMember(this.commentsGrid);
    this.addMember(this.detailViewer);
  }
});

isc.defineClass("FigureEditor", isc.Window).addProperties({
  title: "Figure",
  width: 800,
  height: 400,
  canDragReposition: true,
  canDragResize: true,
  keepInParentRect: true,
  animateMinimize: true,
  dragOpacity: 30,
  closeClick: function() {
    this.markForDestroy();
  },
  setFigureID: function(id) {
    this.figureRS.setCriteria({
      id: id
    });
    this.figureRS.get(0);
  },
  setFigure: function(figure) {
    this.figure = figure;
    this.figureID = figure.id;
    this.detailViewer.setData([figure]);
    this.commentsGrid.fetchData({
      figure_id: figure.id
    });
    this.commentForm.figure = figure;
    this.commentForm.editNewRecord({
      figure_id: figure.id
    });
  },
  initWidget: function() {
    this.Super("initWidget", arguments);
    this.figureRS = isc.ResultSet.create({
      dataSource: "figures",
      origin: this,
      dataArrived: function(startRow, endRow) {
        if (startRow == 0 && endRow >= 0) {
          this.origin.setFigure(this.get(0));
        }
      }
    });
    this.detailViewer = isc.DetailViewer.create({
      dataSource: "figures",
      showDetailFields: true,
      showEdges: true,
      showResizeBar: true,
      height: "100%",
      width: "33%",
      overflow: "auto"
    });
    this.commentsGrid = isc.CommentsGrid.create({
      showEdges: true,
      showResizeBar: true,
      resizeBarTarget: "next",
      height: "60%",
      width: "100%",
      autoFetchData: false
    });
    this.commentForm = isc.DynamicForm.create({
      showEdges: true,
      dataSource: "comments",
      width: "100%",
      numCols: 1,
      figure: null,
      showErrorText: true,
      showTitlesWithErrorMessages: true,
      errorOrientation: "top",
      colWidths: ["*"],
      fields: [
        {name: "comment", editorType: "textArea", width: "*", showTitle: false},
        {
          name: "submit", type: "button", title: "Save Comment", align: "right",
          click: function (form, item) {
            form.submit (function(dsResponse, data, dsRequest) {
              if(dsResponse.status == 0) {
                form.editNewRecord({figure_id: form.figure ? form.figure.id : null});
              }
            });
          }
        }
      ]
    });

    // Use setter if passed in config
    if (this.figureID) {
      this.setFigureID(this.figureID);
    } else if (this.figure) {
      this.setFigure(this.figure);
    }

    this.addItem(
      isc.HLayout.create({
        height: "100%",
        width: "100%",
        members: [
          this.detailViewer,
          isc.VLayout.create({
            width: "66%",
            members: [
              this.commentsGrid,
              this.commentForm
            ]
          })
        ]
      })
    );
  }
});

