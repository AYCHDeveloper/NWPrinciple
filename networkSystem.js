var presetConfigs = [];

var networkScene = {
  nodeObjs:[],
  nodeTypes: ["host","router"],
  currNodeType: null,
  nodeDivs:[],
  nodeHover:false,
  linkHover: false,
  selectedNode:null,
  drawingNode: false,
  drawingLink: false,
  linkFromNode:null,
  linkStartCoords:{x:0,y:0},
  linkObjs:[],
  linkDivs: [],
  statusBox:null,
}
var logScene;
var hostID = 0,routerID = 0,linkID = 0;
var hostButton,routerButton,clearButton,tooltipDiv;
var savePresetButton,loadPresetButton;
var nodeCursor;
var hostImg, routerImg;
//PRELOAD
function preload() {
  hostImg = loadImage("images/computersprite.png");
  routerImg = loadImage("images/routersprite2.png");
}
//SETUP
function setup() {
  frameRate(60);
  createCanvas(windowWidth, windowHeight);
  createButtons();
  updateStatusBox();
  background(128);
}
//DRAW
function draw() {
  background(128);
  if(networkScene.drawingNode && !networkScene.nodeHover && !networkScene.drawingLink){
    strokeWeight(0);
    fill('rgba(0,0,0,.4)');
    nodeCursor = networkScene.currNodeType == 'host' ? rect(mouseX-50,mouseY-50,94,89)
                                                         : rect(mouseX-50,mouseY-50,102,84);
  }
  strokeWeight(5);
  if(networkScene.drawingLink){

    line(networkScene.linkStartCoords.x,networkScene.linkStartCoords.y,mouseX,mouseY);
  }
  networkScene.linkObjs.map(link=>{ link.active ? link.display() : null });
}

function windowResized(){
  if(windowWidth >= 400){
    networkScene.statusBox.position(windowWidth-210,0);
  }
  resizeCanvas(windowWidth,windowHeight);
  background(128);
}

function createButtons() {
  //TODO: remake header bar as full HTML string (similar to tooltip below)
  hostButton = createButton("host","host");
  hostButton.position(10,10);
  hostButton.mousePressed(toggleNode);
  hostButton.addClass("button");
  routerButton = createButton("router","router");
  routerButton.position(60,10);
  routerButton.mousePressed(toggleNode);
  routerButton.addClass("button");
  clearButton = createButton("clear nodes","clear");
  clearButton.position(120,10);
  clearButton.mousePressed(toggleNode);
  clearButton.addClass("button");
  savePresetButton = createButton("save current config","savePreset");
  savePresetButton.position(210,10);
  savePresetButton.mousePressed(savePreset);
  savePresetButton.addClass("button");
  loadPresetButton = createButton("load preset config","loadPreset");
  loadPresetButton.position(340,10);
  loadPresetButton.mousePressed(loadPreset);
  loadPresetButton.addClass("button");
  logScene = createButton("log scene","logScene");
  logScene.position(460,10);
  logScene.mousePressed(function(){console.log(networkScene)});
  logScene.addClass("button");
}
/**************START HERE***linkObjs and linkDivs**/
function loadPreset(){
  var tempPreset, tempArr, tempNode;
  if(presetConfigs.length){
    tempPreset = presetConfigs[0];
    clearNodes();
    networkScene = {
      nodeObjs:tempPreset.nodeObjs,
      nodeTypes: ["host","router"],
      currNodeType: null,
      nodeDivs:tempPreset.nodeDivs,
      nodeHover:false,
      linkHover: false,
      selectedNode:null,
      drawingNode: false,
      drawingLink: false,
      linkFromNode:null,
      linkStartCoords:{x:0,y:0},
      linkObjs:tempPreset.linkObjs,
      linkDivs: tempPreset.linkDivs,
      statusBox:updateStatusBox(),
    }

    tempArr = [];
    networkScene.nodeObjs.map(obj => {
      switch(obj.type){
        case "host":
          tempArr.push(new Host(obj.id,obj.coords));
          break;
        case "router":
          tempArr.push(new Router(obj.id,obj.coords));
          break;
      }
    });
    networkScene.nodeObjs = tempArr;

    networkScene.nodeDivs.map(div => {
      tempArr = [];
      for(var i = 0; i < div.elt.attributes.length; i++){
      tempArr.push(div.elt.attributes[i]);
      }
      tempNode = createImg(tempArr[0].nodeValue);
      tempNode.id(tempArr[1].nodeValue);
      tempNode.addClass(tempArr[2].nodeValue);
      tempNode.style(tempArr[3].nodeValue);
      tempNode.mouseOver(function(){
        networkScene.nodeHover = true;
      });
      tempNode.mouseOut(function(){
        networkScene.nodeHover = false
      });
    });
  } else {
    console.log("no preset configs saved");
  }
}

function savePreset(){
  presetConfigs.push(networkScene);
}

//MESSAGE
function Message(){
}

//HOST
function Host(id,coords) {
  this.type = "host";
  this.id = id;
  this.data = null;
  this.connections = [];
  this.coords = coords;
  this.layers = {
    appliction:[],
    presentation:[],
    session:[],
    transport:[],
    network:[],
    dataLink:[],
    physical:[],
  };
  this.tooltipVisible = false;
  this.layerDetailsVisible = false;
}
Host.prototype.receiveData = function(data) {
  this.data = data;
}

//ROUTER
function Router(id,coords) {
  this.type = "router";
  this.id = id;
  this.data = null;
  this.connections = [];
  this.coords = coords;
  this.layers = {
    network:[],
    dataLink:[],
    physical:[],
  }
}
Router.prototype.display = function() {
}
//LINK
function Link(id, nodes, coords, active) {
  this.type= "link";
  this.id = id;
  this.data = null;
  this.nodes = nodes;
  this.coords = coords;
  this.active = active;
  this.weight = 0;
  this.rise = -(this.coords.y2 - this.coords.y1);
  this.run = this.coords.x2 - this.coords.x1;
  this.length = sqrt(this.run**2 + this.rise**2);
  this.slope = this.rise/this.run;
  this.layoverDiv = linkLayoverDiv({x:this.coords.x1,y:this.coords.y1}, this.slope, this.id, this.length, this.weight, this.rise);
}


function linkLayoverDiv(origin, slope, id, length, weight, rise){
  var linkLayover = createDiv("");
  var relativeQuadrant = (slope > 0 && rise > 0) ? 1
                        :(slope < 0 && rise > 0) ? 2
                        :(slope > 0 && rise < 0) ? 3
                        :(slope < 0 && rise < 0) ? 4
                        : 1;

  var angle = (atan(slope)*(180/PI));
  switch(relativeQuadrant){
    case 1:
    break;
    case 2:
      angle += 180;
    break;
    case 3:
      angle += 180;
    break;
    case 4:
      angle += 360;
    break;
  }

  linkLayover.position(origin.x,origin.y);
  linkLayover.size(length,10);

  linkLayover.style("transform-origin","0 5px");
  linkLayover.style("transform",`translateY(-4px) rotate(-${angle}deg)`);

  linkLayover.mouseOver(function(){
    networkScene.linkHover = true;
  });
  linkLayover.mouseOut(function(){
    networkScene.linkHover = false;
  });

  linkLayover.addClass("link-layover");
  linkLayover.id(`link-${linkID}`);
  networkScene.linkDivs.push(linkLayover);
  linkID++;
}

Link.prototype.display = function() {
  line(this.coords.x1,
       this.coords.y1,
       this.coords.x2,
       this.coords.y2);
}

/***MOUSE FUNCTIONS***/
//MOUSECLICKED
function mousePressed(e){
  //console.log(networkScene);
  var currNode = nodeFromID(e.target.id),
      currDiv  = divFromID(e.target.id);

  if(networkScene.drawingLink){
    if(networkScene.nodeHover){
      networkScene.drawingLink = false;
      networkScene.linkFromNode.connections.push(currNode);
      currNode.connections.push(networkScene.linkFromNode);
      var newLinkID = `link-${linkID}`,
          newLinkNodes = [networkScene.linkFromNode,currNode],
          newLinkCoords = {
                        x1:networkScene.linkStartCoords.x,
                        y1:networkScene.linkStartCoords.y,
                        x2:currNode.coords.x+50,
                        y2:currNode.coords.y+50
                      },
          newLinkActive = true;

      networkScene.linkObjs.push(new Link(newLinkID, newLinkNodes, newLinkCoords, newLinkActive));
      togglePointer();
      networkScene.currNodeType = null;
      updateStatusBox();
    } else {
      networkScene.drawingLink = false;
      networkScene.currNodeType = null;
      updateStatusBox();
    }
  } else if (networkScene.nodeHover){
    networkScene.drawingNode = false;
    togglePointer();
    if(currNode){
      networkScene.selectedNode = currNode.id;
      currNode.tooltipVisible = !currNode.tooltipVisible;
      if(currNode.tooltipVisible){
        var adjustedPosition,adjX,adjY;

        tooltipDiv = createDiv(createTooltip(currNode.type,currNode.id));
        tooltipDiv.addClass("tooltip");
        tooltipDiv.id(`${currNode.id}-tooltip`);
        adjustedPosition = checkScreenOut(mouseX,
                                          mouseY,
                                          tooltipDiv.size().width,
                                          tooltipDiv.size().height);
        adjX = adjustedPosition.x;
        adjY = adjustedPosition.y;
        tooltipDiv.position(adjX,adjY);
        tooltipDiv.mouseOver(function(){
          networkScene.nodeHover = true;
        });
        tooltipDiv.mouseOut(function(){
          networkScene.nodeHover = false
        });
      } else {
        document.getElementById(`${currNode.id}-tooltip`).remove();
      }
    }
  } else if(networkScene.linkHover){
    console.log(currNode,currDiv);
  } else if (networkScene.drawingNode && validDropPos(mouseX,mouseY) && e.button == 0){
    var newID,newDiv;
    switch(networkScene.currNodeType){
      case "host":
        newID = `host-${hostID}`;
        //push node to nodeObjs for graph
        networkScene.nodeObjs.push(new Host(newID,{x:mouseX-50,y:mouseY-50}));
        //make div for display
        newDiv = createImg("images/computersprite.png");
        newDiv.id(newID);
        newDiv.addClass("node");
        newDiv.position(mouseX-50,mouseY-50);
        newDiv.mouseOver(function(){
          networkScene.nodeHover = true;
        });
        newDiv.mouseOut(function(){
          networkScene.nodeHover = false
        });
        networkScene.nodeDivs.push(newDiv);
        hostID++;
        break;
      case "router":
        newID = `router-${routerID}`;
        //push node to nodeObjs for graph
        networkScene.nodeObjs.push(new Router(newID,{x:mouseX-50,y:mouseY-50}));
        //make div for display
        newDiv = createImg("images/routersprite2.png");
        newDiv.id(newID);
        newDiv.addClass("node");
        newDiv.position(mouseX-50,mouseY-50);
        newDiv.mouseOver(function(){
          networkScene.nodeHover = true;
          //networkScene.selectedNode = newDiv;
        });
        newDiv.mouseOut(function(){
          networkScene.nodeHover = false
          //networkScene.selectedNode = null;
        });
        networkScene.nodeDivs.push(newDiv);
        routerID++;
        break;
      default:
        console.log("error: no node type selected");
    }
  }
  //console.log(networkScene.selectedNode);
}


function mouseMoved() {
  //check for cursor over line
  if(!(networkScene.drawingLink || networkScene.drawingNode)){

  }
}

function toggleNode(e) {
  switch(e.target.value){
    case "host":
      networkScene.drawingNode = true;
      networkScene.currNodeType = "host";
      togglePointer();
      updateStatusBox();
      break;
    case "router":
      networkScene.drawingNode = true;
      networkScene.currNodeType = "router";
      updateStatusBox();
      break;
    case "clear":
      networkScene.drawingNode = false;
      clearNodes();
      break;
  }
}

function createTooltip(nodeType,nodeID){
  var nodeDescription;
  if(nodeType == "host"){
    nodeDescription = `<div id="node-description">
                        <h4 id="layer-header">OSI Layers:</h4>
                        <button id="appLayer"   class="layer-button" onClick=layerButtonClick(id,'${nodeID}')>Application</button>
                        <button id="presLayer"  class="layer-button" onClick=layerButtonClick(id,'${nodeID}')>Presentation</button>
                        <button id="sessLayer"  class="layer-button" onClick=layerButtonClick(id,'${nodeID}')>Session</button>
                        <button id="transLayer" class="layer-button" onClick=layerButtonClick(id,'${nodeID}')>Transport</button>
                        <button id="netLayer"   class="layer-button" onClick=layerButtonClick(id,'${nodeID}')>Network</button>
                        <button id="dlLayer"    class="layer-button" onClick=layerButtonClick(id,'${nodeID}')>Data Link</button>
                        <button id="phyLayer"   class="layer-button" onClick=layerButtonClick(id,'${nodeID}')>Physical</button>
                       </div>`;
  } else if(nodeType == "router"){
    nodeDescription = `<div id="node-description">
                        <h4 id="layer-header">OSI Layers:</h4>
                        <button id="netLayer"   class="layer-button" onClick=layerButtonClick(id,'${nodeID}')>Network</button>
                        <button id="dlLayer"    class="layer-button" onClick=layerButtonClick(id,'${nodeID}')>Data Link</button>
                        <button id="phyLayer"   class="layer-button" onClick=layerButtonClick(id,'${nodeID}')>Physical</button>
                       </div>`;
  } else if(nodeType == "link"){
    //implement Link node class first
  }
  var nodeName = `<h3 id="tooltip-title">${nodeID}</h3>`,
      createLinkButton = `<button id="link-button" class="button tooltip-button" onClick=createLink('${nodeID}') alt="close tooltip.">create new link</button>`,
      connectionsButton = `<button id="connections-button" class=button tooltip-button onClick=listConnections('${nodeID}')>list connections</button`,
      closeTTButton =    `<button id="close-tooltip-button" class="button tooltip-button" onClick=closeTooltip('${nodeID}')></button>`,
      removeNodeButton = `<button id="remove-node-button" class="button tooltip-button" onClick=removeNode('${nodeID}')>remove node</button>`;

  return(
    `<div id='tooltip-header'>
      ${nodeName+closeTTButton}
     </div>
     ${nodeDescription+createLinkButton+connectionsButton}
     <br/>
     ${removeNodeButton}`
  );
}

function createPageHeader(){
  var pageHeader = createDiv(`

                   `)
  pageHeader.id("page-header-container")
  pageheader.position(0,0);
}

function updateStatusBox(){
  var currBox = document.getElementById('status-box');
  if(currBox){
    currBox.remove();
  }
  var action = networkScene.currNodeType ? `Place ${networkScene.currNodeType} node.`
                                         : "Free select.";

  var infoTable = `
                  <table>
                    <th>
                      <td></td>
  `

  var statusBox = createDiv(`
                    <h3 id="status-header">Network Status</h3>
                    <div id="status-info">
                      <table>
                        <th>Selected action</th>
                        <td>${action}</td>
                      </table>
                    </div>`
                  );
  statusBox.position(windowWidth-210,0);
  statusBox.id("status-box");
  networkScene.statusBox = statusBox;
}

function createLink(id){
 var currNode = nodeFromID(id),
     currDiv  = divFromID(id);
 closeTooltip(id);
 networkScene.drawingLink = true;
 networkScene.linkFromNode = currNode;
 networkScene.linkStartCoords.x = currNode.coords.x+50;
 networkScene.linkStartCoords.y = currNode.coords.y+50;
}

function listConnections(id){
  var currNode = nodeFromID(id);
  currNode.connections.map(connection=>console.log(connection));
}

function closeTooltip(id){
  var pNode;
  document.getElementById(id+"-tooltip").remove();
  for(var i = 0; i < networkScene.nodeObjs.length; i++){
    if(networkScene.nodeObjs[i].id == id){
      pNode = networkScene.nodeObjs[i];
    }
  }
  pNode.tooltipVisible = false;
  networkScene.nodeHover = false;
}

function removeNode(id){
  var currNode = nodeFromID(id);
  console.log(currNode, networkScene);
  for(var i = 0; i < networkScene.linkObjs.length; i++){
    for(var j = 0; j < networkScene.linkObjs[i].nodes.length; j++){
      if(id == networkScene.linkObjs[i].nodes[j].id){
        networkScene.linkObjs[i].active = false;
      }
    }
  }
  networkScene.linkObjs = networkScene.linkObjs.filter(link => link.active);
  networkScene.nodeDivs = networkScene.nodeDivs.filter(div => div.elt.id != id);
  networkScene.nodeObjs = networkScene.nodeObjs.filter(obj => obj.id != id);

  for(var i = 0; i < networkScene.nodeObjs.length; i++){
    networkScene.nodeObjs[i].connections = networkScene.nodeObjs[i].connections.filter(connection => connection.id != id);
  }
  document.getElementById(id+"-tooltip").remove();
  document.getElementById(id).remove();
  networkScene.nodeHover = false;
}

function clearNodes(){
  var tooltips = document.getElementsByClassName("tooltip");
  while(tooltips.length){
    tooltips[0].remove();
  }
  var nodes = document.getElementsByClassName("node");
  while(nodes.length){
    nodes[0].remove();
  }
  var links = document.getElementsByClassName("link-layover");
  while(links.length){
    links[0].remove();
  }
  /*
  hostID = 0;
  routerID = 0;
  linkID = 0;
  */
  networkScene = {
    nodeObjs:[],
    nodeTypes: ["host","router"],
    currNodeType: null,
    nodeDivs:[],
    nodeHover:false,
    linkHover: false,
    selectedNode:null,
    drawingNode: false,
    drawingLink: false,
    linkFromNode:null,
    linkStartCoords:{x:0,y:0},
    linkObjs:[],
    linkDivs: [],
    statusBox:null,
  }
  updateStatusBox();
}

function nodeFromID(id){
  if(id.match("link")){
    var currLink;
    for(var i = 0; i < networkScene.linkObjs.length; i++){
      if(networkScene.linkObjs[i].id == id){
        currLink = networkScene.linkObjs[i];
      }
    }
    return currLink;
  } else {
    var currNode;
    for(var i = 0; i < networkScene.nodeObjs.length; i++){
      if(networkScene.nodeObjs[i].id == id){
        currNode = networkScene.nodeObjs[i];
      }
    }
    return currNode;
  }
}

function divFromID(id){
  var currDiv;
  if(id.match("link")){
    for(var i = 0; i < networkScene.linkDivs.length; i++){
      if(networkScene.linkDivs[i].elt.id == id){
        currDiv = networkScene.linkDivs[i];
      }
    }
    return currDiv;
  } else {
    for(var i = 0; i < networkScene.nodeDivs.length; i++){
      if(networkScene.nodeDivs[i].elt.id == id){
        currDiv = networkScene.nodeDivs[i].elt;
      }
    }
    return currDiv;
  }
}

function layerButtonClick(id,parentNode){
  switch(id){
    case "appLayer":
      console.log(`${parentNode}:${id} clicked`)
      break;
    case "presLayer":
      console.log(id + " clicked");
      break;
    case "sessLayer":
      console.log(id + " clicked");
      break;
    case "transLayer":
      console.log(id + " clicked");
      break;
    case "netLayer":
      console.log(id + " clicked");
      break;
    case "dlLayer":
      console.log(id + " clicked");
      break;
    case "phyLayer":
      console.log(id + " clicked");
      break;
  }
}

function checkScreenOut(x,y,w,h){
  var relocatePos = {x:x,y:y};
  if (x + w > windowWidth){
    relocatePos.x = windowWidth-(w-1);
  }
  if (y + h > windowHeight){
    relocatePos.y = windowHeight-(h-1);
  }


  return relocatePos;
}

function validDropPos(x,y){
  return (x > 50 && x < windowWidth - 255 && y > 50 && y < windowHeight - 30);
}

function togglePointer(){
  if(networkScene.drawingLink || networkScene.drawingNode){
    document.body.style.cursor = 'default';
  } else {
    document.body.style.cursor = 'pointer';
  }
}
