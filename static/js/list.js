let GO = go.GraphObject.make

var timeList = {}     // { time: title }
var orderedTimeList = []  // stores [id:int, time:string]
var diagramList = {}  // { time: diagram JSON object }
var currentTime = ""

var showDiagram = function() {
  var diagramDiv = document.getElementById("myDiagramDiv")
  var paletteDiv = document.getElementById("myPaletteDiv")
  diagramDiv.style.visibility = "visible"
  paletteDiv.style.visibility = "visible"

  var diagramBtns = document.getElementById("diagram-btn-wrapper")
  diagramBtns.style.visibility = "visible"

  var listSec = document.getElementById("list-wrapper")
  listSec.style.visibility = "visible"

  var currentDiagramTime = document.getElementById("current-diagram-time")
  var currentDiagramName = document.getElementById("current-diagram-name")
  currentDiagramTime.style.visibility = "visible"
  currentDiagramName.style.visibility = "visible"
  currentDiagramTime.value = currentTime
  currentDiagramName.value = timeList[currentTime]

  var btnDiv = document.getElementById("modify-btn-wrapper")
  btnDiv.innerHTML = "<button id='modify-btn' type='button' class='btn btn-secondary' onclick='modify()'>Modify</button>"

  var currentItem = findListItem(currentTime)
  if (currentItem !== undefined) {
    currentItem.style.backgroundColor = "lightgrey"
  }
}

var addTime = function () {
  var time = document.getElementById("current-time").innerHTML
  timeList[time] = "Untitled Formation"
  currentTime = time
  showList()
}

var showList = function () {
  var message = document.getElementById("no-formation-message")
  var listDiv = document.getElementById("list")
  if (Object.keys(timeList).length === 0) {
    listDiv.innerHTML = ""
    myDiagram.clear()
    message.innerHTML = "No formation has been created yet."
  } else {
    message.innerHTML = ""
    var str = ""

    orderedTimeList = []
    var id = 0;
    Object.keys(timeList).sort().forEach(function(key) {
      orderedTimeList.push(key);
      id++
    });

    for (let time of orderedTimeList) {
      str = str + "<li onclick='goToDiagram(this)' data-time='" + time + "'>" + time + " - " + timeList[time] + "</li>"
    }
    listDiv.innerHTML = str

    let currentItem = findListItem(currentTime)
    currentItem.style.backgroundColor = "lightgrey"
  }
}

var saveDiagram = function() {
  var diagramNodes = myDiagram.model.toJson()
  diagramList[currentTime] = diagramNodes
}

function findListItem(time) {
  var items = document.getElementById("list").children
  for (let child of items) {
    if (time === child.dataset.time) {
      return child
    }
  }
}

var goToDiagram = function(target) {
  // save previous diagram; de-highlight prev list item
  saveDiagram()
  var prevItem = findListItem(currentTime)
  if (prevItem !== undefined) {
    prevItem.style.backgroundColor = "white"
  }

  var time = target.innerHTML.split("-")[0].trim()
  currentTime = time
  if (diagramList[time] !== undefined) {
    var currentItem = findListItem(currentTime)
    currentItem.style.backgroundColor = "lightgrey"
    myDiagram.model = go.Model.fromJson(diagramList[time])
  }
  showDiagram()

  let secs = convertTimeToSecs(time)
  player.seekTo(secs)
}

var goToDiagram1 = function (target) {
  // save previous diagram; de-highlight prev list item
  saveDiagram()
  var prevItem = findListItem(currentTime)
  prevItem.style.backgroundColor = "white"

  var time = target.innerHTML.split("-")[0].trim()
  currentTime = time
  if (diagramList[time] !== undefined) {
    var currentItem = findListItem(currentTime)
    currentItem.style.backgroundColor = "lightgrey"
    myDiagram.model = go.Model.fromJson(diagramList[time])
  }
  showDiagram()
}

const convertTimeToSecs = (time) => {
  let secs = 0
  let times = time.split(':')
  for (let i = 0; i < times.length; i++) {
    secs += (times[i] * Math.pow(60, 2 - i))
  }
  return secs
}

function modify() {
  var currentDiagramTime = document.getElementById("current-diagram-time")
  var currentDiagramName = document.getElementById("current-diagram-name")
  var oldTime = currentTime
  var newTime = currentDiagramTime.value
  var newName = currentDiagramName.value
  if (oldTime === newTime) {
    timeList[oldTime] = newName
  } else {
    delete timeList[oldTime]
    timeList[newTime] = newName
  }
  showList()
}

const clearDiagram = () => {
  myDiagram.clear()
}

const deleteDiagram = () => {
  delete timeList[currentTime]
  delete diagramList[currentTime]

  if (orderedTimeList.length > 0) {
    currentTime = orderedTimeList[0]
    let secs = convertTimeToSecs(currentTime)
    player.seekTo(secs)
  }
  showList()

  myDiagram.model = go.Model.fromJson(diagramList[currentTime])
  showDiagram()
}

// print the diagram by opening a new window holding SVG images of the diagram contents for each page
function printDiagram() {
  var svgWindow = window.open();
  if (!svgWindow) return;  // failure to open a new Window
  var printSize = new go.Size(700, 960);
  var bnds = myDiagram.documentBounds;
  var x = bnds.x;
  var y = bnds.y;
  while (y < bnds.bottom) {
    while (x < bnds.right) {
      var svg = myDiagram.makeSVG({
        scale: 1.0,
        // position: new go.Point(x, y),
        size: printSize 
      });
      svgWindow.document.body.appendChild(svg);
      x += printSize.width;
    }
    x = bnds.x;
    y += printSize.height;
  }
  setTimeout(function () { svgWindow.print(); }, 1);
}

function makeBlob() {
  console.log("makeBlob() called");
  var blob = myDiagram.makeImageData({ background: "white", returnType: "blob", callback: myCallback });
}

function myCallback(blob) {
  console.log("myCallback() called");
  var url = window.URL.createObjectURL(blob);
  var filename = currentTime + '-' + timeList[currentTime] + ".png";

  var a = document.createElement("a");
  a.style = "display: none";
  a.href = url;
  a.download = filename;

  // IE 11
  if (window.navigator.msSaveBlob !== undefined) {
    window.navigator.msSaveBlob(blob, filename);
    return;
  }

  document.body.appendChild(a);
  requestAnimationFrame(function () {
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  });
}

const previewMode = () => {
  // saveDiagram()
  // const data = { 'timeList': orderedTimeList, 'diagramList': diagramList, 'titleList': timeList }
  // saveList(data)
  myDiagram.animationManager.isEnabled = false
  myDiagram.isReadOnly = true
  myDiagram.grid =
    GO(go.Panel, go.Panel.Grid,
      { gridCellSize: new go.Size(25, 25) },
      GO(go.Shape, "LineH", { stroke: "white" }),
      GO(go.Shape, "LineV", { stroke: "white" })
    )

  let btnDiv = document.getElementById('finish-btn')
  btnDiv.innerHTML = 'Go Back to Editing'
  btnDiv.classList.remove('btn-primary')
  btnDiv.classList.add('btn-secondary')

  let createDiv = document.getElementById('create-sec')
  // createDiv.style.visibility = 'hidden'
  createDiv.style.display = 'none'

  let modifyBtn = document.getElementById('modify-btn')
  modifyBtn.style.visibility = 'hidden'
  modifyBtn.style.display = 'none'

  let currentDiagramTime = document.getElementById("current-diagram-time")
  let currentDiagramName = document.getElementById("current-diagram-name")
  currentDiagramTime.disabled = true
  currentDiagramName.disabled = true

  let btns = document.getElementById('diagram-btn-wrapper')
  btns.style.visibility = 'hidden'
  btns.style.display = 'none'

  let paletteDiv = document.getElementById("myPaletteDiv")
  paletteDiv.style.display = 'none'

  let downloadBtn = document.getElementById('download-btn')
  downloadBtn.style.display = 'block'

  let listDiv = document.getElementById("list")
  listDiv.scrollTop = 0
  goToDiagram(findListItem(orderedTimeList[0]))
}

const editMode = () => {
  myDiagram.animationManager.isEnabled = true
  myDiagram.isReadOnly = false
  myDiagram.grid =
    GO(go.Panel, go.Panel.Grid,
      { gridCellSize: new go.Size(25, 25) },
      GO(go.Shape, "LineH", { stroke: "lightgrey" }),
      GO(go.Shape, "LineV", { stroke: "lightgrey" })
    )

  let btnDiv = document.getElementById('finish-btn')
  btnDiv.innerHTML = 'Preview'
  btnDiv.classList.remove('btn-secondary')
  btnDiv.classList.add('btn-primary')

  let createDiv = document.getElementById('create-sec')
  // createDiv.style.visibility = 'visible'
  createDiv.style.display = 'block'

  let modifyBtn = document.getElementById('modify-btn')
  modifyBtn.style.visibility = 'visible'
  modifyBtn.style.display = 'block'

  let currentDiagramTime = document.getElementById("current-diagram-time")
  let currentDiagramName = document.getElementById("current-diagram-name")
  currentDiagramTime.disabled = false
  currentDiagramName.disabled = false

  let btns = document.getElementById('diagram-btn-wrapper')
  btns.style.visibility = 'visible'
  btns.style.display = 'block'

  let paletteDiv = document.getElementById("myPaletteDiv")
  paletteDiv.style.display = 'block'

  let downloadBtn = document.getElementById('download-btn')
  downloadBtn.style.display = 'none'
}

const saveList = (data) => {
  console.log(data)
  $.ajax({
    type: "POST",
    url: "save_list",
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(data),
    success: function (result) {
      // console.log(result)
    },
    error: function (request, status, error) {
      console.log("Error")
      console.log(request)
      console.log(status)
      console.log(error)
    }
  })
}

$(document).ready(function() {
  console.log("ready")
  showList()

  $("#create-btn").click(function() {
    saveDiagram()
    addTime()
    showDiagram()
    saveDiagram()

    let listDiv = document.getElementById("list")
    listDiv.scrollTop = listDiv.scrollHeight
  })

  $('#finish-btn').click(function() {
    if (this.innerHTML === 'Preview') {
      saveDiagram()
      previewMode()
    } else {
      editMode()
    }
  })
})