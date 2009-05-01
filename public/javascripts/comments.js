isc.LG.addProperties({
  showFigureEditor: function(record) {
    isc.FigureEditor.create({record: record}).show();
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
  fields: [
    {name: "created_at", width: "60"},
    {name: "scholar_full_name", width: "100"},
    {name: "comment", width: "*"}
  ]
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
  initWidget: function() {
    this.Super("initWidget", arguments);
    this.detailViewer = isc.DetailViewer.create({
      data: this.record,
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
      initialCriteria: {
        figure_id: this.record.id
      }
    });
    this.commentForm = isc.DynamicForm.create({
      showEdges: true,
      dataSource: "comments",
      width: "100%",
      numCols: 1,
      figure: this.record,
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
    this.commentForm.editNewRecord({figure_id: this.record ? this.record.id : null});
  }
});

