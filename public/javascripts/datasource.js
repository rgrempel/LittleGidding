isc.setAutoDraw(false);

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

isc.RailsDataSource.create({
  ID: "password_reset",
  dataURL: "/scholar_sessions",
  fields: [
    {name: "email", type: "text", title: "Email Address", length: 255, required: true},
  ]
});

isc.RailsDataSource.create({
  ID: "scholar_sessions",
  dataURL: "/scholar_sessions",
  fields: [
    {name: "id", type: "text", primaryKey: true},
    {name: "email", type: "text", title: "Email Address", length: 255, required: true},
    {name: "full_name", type: "text"}
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
  ID: "comments",
  dataURL: "/comments",
  fields: [
    {name: "id", type: "integer", primaryKey: true, hidden: true},
    {name: "scholar_id", type: "integer", title: "Scholar", foreignKey: "scholars.id" },
    {name: "scholar_full_name", type: "text", title: "Scholar"},
    {name: "figure_id", type: "text", title: "Figure", foreignKey: "figures.id", canEdit: false},
    {name: "body", type: "text", title: "Comment", required: true},
    {name: "created_at", type: "date", title: "Date", canEdit: false}
  ]
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

isc.RailsDataSource.create({
  ID: "text_summary",
  dataURL: "/text",
  fields: [
    {name: "col", type: "integer", title: "Column"},
    {name: "position", type: "integer", title: "Position", hidden: true},
    {name: "id", type: "text", title: "ID", hidden: true}
  ]
});

isc.RailsDataSource.create({
  ID: "text",
  dataURL: "/text",
  inheritsFrom: "text_summary",
  fields: [
    {name: "source", type: "text", title: "Source"},
    {name: "html", type: "text", title: "Text"}
  ]
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
