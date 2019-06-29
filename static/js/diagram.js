var myDiagram

$(document).ready(function() {
  var GO = go.GraphObject.make;

  myDiagram =
    GO(go.Diagram, "myDiagramDiv",
      {
        "undoManager.isEnabled": true,  // enable undo & redo
      });
  
  myDiagram.grid =
    GO(go.Panel, go.Panel.Grid,  
      { gridCellSize: new go.Size(25, 25) },
      GO(go.Shape, "LineH", { stroke: "lightgrey" }),
      GO(go.Shape, "LineV", { stroke: "lightgrey" })
    );

  myDiagram.animationManager.isEnabled = false

  myDiagram.toolManager.draggingTool.isGridSnapEnabled = true

  myDiagram.allowHorizontalScroll = false
  myDiagram.allowVerticalScroll = false
  myDiagram.allowZoom = false

  // when the document is modified, add a "*" to the title and enable the "Save" button
  // myDiagram.addDiagramListener("Modified", function (e) {
  //   var button = document.getElementById("SaveButton");
  //   if (button) button.disabled = !myDiagram.isModified;
  //   var idx = document.title.indexOf("*");
  //   if (myDiagram.isModified) {
  //     if (idx < 0) document.title += "*";
  //   } else {
  //     if (idx >= 0) document.title = document.title.substr(0, idx);
  //   }
  // });

  function nodeStyle() {
    return [
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      {
        locationSpot: go.Spot.Center
      }
    ];
  }

  function textStyle() {
    return {
      font: "11pt Helvetica, Arial, sans-serif",
      stroke: "black"
    }
  }

  myDiagram.nodeTemplateMap.add("",  // the default category
    GO(go.Node, "Table", nodeStyle(),
        GO(go.Shape, "Circle",
          { row: 0, column: 0, fill: "#6c757d", strokeWidth: 0, width: 50, cursor: 'pointer' }
        ),
        GO(go.TextBlock, textStyle(),
          {
            row: 1, column: 0,
            maxSize: new go.Size(200, NaN),
            editable: true
          },
          new go.Binding("text").makeTwoWay())
    ));
  
  var myPalette = GO(go.Palette, "myPaletteDiv")

  myPalette.nodeTemplateMap.add("",  // the default category
    GO(go.Node, "Table", nodeStyle(),
      {
        click: mouseclick
      },
      GO(go.Shape, "Circle",
        { row: 0, column: 0, fill: "#6c757d", strokeWidth: 0, width: 50, cursor: 'pointer' }
      ),
      GO(go.TextBlock, textStyle(),
        {
          row: 1, column: 0,
          maxSize: new go.Size(200, NaN),
          editable: true
        },
        new go.Binding("text").makeTwoWay())
    ));

  myPalette.model.nodeDataArray = [
    { text: "Dancer" }
  ]

  function mouseclick(e, obj) {
    myDiagram.model.addNodeData({ text: "Dancer" })
  }
})

// Show the diagram's model in JSON format that the user may edit
    function save() {
      document.getElementById("mySavedModel").value = myDiagram.model.toJson();
      myDiagram.isModified = false;
    }
    function load() {
      myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
    }

    // print the diagram by opening a new window holding SVG images of the diagram contents for each page
    function printDiagram() {
      var svgWindow = window.open();
      if (!svgWindow) return;  // failure to open a new Window
      var printSize = new go.Size(680, 500);
      var bnds = myDiagram.documentBounds;
      console.log(bnds)
      var x = bnds.x;
      var y = bnds.y;
      while (y < bnds.bottom) {
        while (x < bnds.right) {
          var svg = myDiagram.makeSVG({ 
            scale: 1.0, 
            // position: new go.Point(0, 0), 
            // size: printSize,
            // background: "rgba(0, 255, 0, 0.5)" 
          });
          svgWindow.document.body.appendChild(svg);
          x += printSize.width;
        }
        x = bnds.x;
        y += printSize.height;
      }
      // setTimeout(function() { svgWindow.print(); }, 1);
    }