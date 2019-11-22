var myDiagram;
let node;

$(document).ready(function() {
  const GO = go.GraphObject.make;
  let toolTipVisible = false;

  // diagram
  myDiagram = GO(go.Diagram, "myDiagramDiv", {
    "undoManager.isEnabled": true, // enable undo & redo
    BackgroundSingleClicked: hideToolTip
  });

  myDiagram.grid = GO(
    go.Panel,
    go.Panel.Grid,
    { gridCellSize: new go.Size(30, 30) },
    GO(go.Shape, "LineH", { stroke: "lightgrey" }),
    GO(go.Shape, "LineV", { stroke: "lightgrey" })
  );

  myDiagram.animationManager.isEnabled = false;
  myDiagram.toolManager.draggingTool.isGridSnapEnabled = true;
  myDiagram.allowHorizontalScroll = false;
  myDiagram.allowVerticalScroll = false;
  myDiagram.allowZoom = false;

  function nodeStyle() {
    return [
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
        go.Point.stringify
      ),
      {
        locationSpot: go.Spot.Center
      }
    ];
  }

  function textStyle() {
    return {
      font: "11pt Helvetica, Arial, sans-serif",
      stroke: "black"
    };
  }

  myDiagram.nodeTemplateMap.add(
    "", // the default category
    GO(
      go.Node,
      "Table",
      nodeStyle(),
      {
        click: (e, obj) => triggerTooltip(e, obj)
      },
      GO(
        go.Shape,
        "Circle",
        {
          row: 0,
          column: 0,
          fill: "#6c757d",
          strokeWidth: 0,
          width: 30,
          height: 30,
          cursor: "pointer"
        },
        new go.Binding("fill", "color")
      ),
      GO(
        go.TextBlock,
        textStyle(),
        {
          row: 1,
          column: 0,
          maxSize: new go.Size(200, NaN),
          editable: true
        },
        new go.Binding("text").makeTwoWay()
      )
    )
  );

  function triggerTooltip(e, obj) {
    if (toolTipVisible) {
      hideToolTip();
      return;
    }

    showToolTip(obj);

    node = myDiagram.findNodeForKey(obj.part.data.key);
  }

  const colorpickers = document.getElementsByClassName("colorpicker");
  Array.from(colorpickers).forEach(colorpicker =>
    colorpicker.addEventListener("click", e => {
      e.preventDefault();
      color = colorpicker.value;
      setObjColor(node, color);
    })
  );

  function setObjColor(node, color) {
    myDiagram.model.commit(m => {
      console.log(node);
      m.set(node.data, "color", color);
    }, "change color");
    hideToolTip();
  }

  function showToolTip() {
    const toolTipDIV = document.getElementById("toolTipDIV");
    const pt = myDiagram.lastInput.viewPoint;
    toolTipDIV.style.left = pt.x + 10 + "px";
    toolTipDIV.style.top = pt.y + 10 + "px";
    toolTipDIV.style.display = "block";
    toolTipVisible = !toolTipVisible;
  }

  function hideToolTip() {
    var toolTipDIV = document.getElementById("toolTipDIV");
    toolTipDIV.style.display = "none";
    toolTipVisible = !toolTipVisible;
  }

  // palette
  var myPalette = GO(go.Palette, "myPaletteDiv");

  myPalette.nodeTemplateMap.add(
    "", // the default category
    GO(
      go.Node,
      "Table",
      nodeStyle(),
      {
        click: mouseclick
      },
      GO(go.Shape, "Circle", {
        row: 0,
        column: 0,
        fill: "#6c757d",
        strokeWidth: 0,
        width: 30,
        height: 30,
        cursor: "pointer"
      }),
      GO(
        go.TextBlock,
        textStyle(),
        {
          row: 1,
          column: 0,
          maxSize: new go.Size(200, NaN),
          editable: true
        },
        new go.Binding("text").makeTwoWay()
      )
    )
  );

  myPalette.model.nodeDataArray = [{ text: "Dancer" }];

  function mouseclick(e, obj) {
    myDiagram.model.addNodeData({ text: "Dancer" });
  }
});

// Show the diagram's model in JSON format that the user may edit
function save() {
  document.getElementById("mySavedModel").value = myDiagram.model.toJson();
  myDiagram.isModified = false;
}

function load() {
  myDiagram.model = go.Model.fromJson(
    document.getElementById("mySavedModel").value
  );
}

// print the diagram by opening a new window holding SVG images of the diagram contents for each page
function printDiagram() {
  var svgWindow = window.open();
  if (!svgWindow) return; // failure to open a new Window
  var printSize = new go.Size(680, 500);
  var bnds = myDiagram.documentBounds;
  console.log(bnds);
  var x = bnds.x;
  var y = bnds.y;
  while (y < bnds.bottom) {
    while (x < bnds.right) {
      var svg = myDiagram.makeSVG({
        scale: 1.0
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
