var presetConfigs = [];

var networkScene = {
  sceneID: 1,
  presetDrawn: null,
  nodeObjs:[],
  nodeTypes: ["host","router"],
  currNodeType: null,
  nodeDivs:[],
  nodeHover:false,
  linkHover: false,
  selectedNode:null,
  drawingNode: false,
  drawingLink: false,
  removingNodes: false,
  linkFromNode:null,
  linkStartCoords:{x:0,y:0},
  linkObjs:[],
  linkDivs: [],
  statusBox:null,
}
var logScene, canvas;
var hostID = 0,routerID = 0,linkID = 0;
var hostButton,routerButton,clearButton,removeButton,newSceneButton,headerDiv,tooltipDiv;
var savePresetButton,loadPresetButton, presetSelect;
var nodeCursor;
var hostImg, routerImg;
//PRELOAD
function preload() {
  hostImg = loadImage("images/computersprite.png");
  routerImg = loadImage("images/routersprite2.png");
}
//SETUP
function setup() {
	document.addEventListener("contextmenu",function(e){
		e.preventDefault(e);
	});
  frameRate(60);
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.id("mainCanvas");
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
    nodeCursor = networkScene.currNodeType == 'host' ? rect(mouseX-47,mouseY-45,94,89)
                                                     : rect(mouseX-51,mouseY-42,102,84);
  }
  if(networkScene.removingNodes && !networkScene.nodeHover){
	strokeWeight(0);
	fill('rgba(200,0,0,.4)');
	nodeCursor = rect(mouseX-20,mouseY-20,40,40);

  }
  strokeWeight(5);
  if(networkScene.drawingLink){

    line(networkScene.linkStartCoords.x,networkScene.linkStartCoords.y,mouseX,mouseY);
  }
  networkScene.linkObjs.map(link=>{ link.active ? link.display() : null });
}

function windowResized(){
  if(networkScene.presetDrawn){
    generateAssignment(networkScene.presetDrawn);
  }
  if(windowWidth >= 400){
	createButtons();
    networkScene.statusBox.position(windowWidth-210,0);
  }

  resizeCanvas(windowWidth,windowHeight);
  background(128);
}

function createButtons() {

  //TODO: remake header bar as full HTML string (similar to tooltip below)
  hostButton = createButton("New Host","host");
  hostButton.position(10,10);
  hostButton.mousePressed(toggleNode);
  hostButton.addClass("button");
  routerButton = createButton("New Router","router");
  routerButton.position(10,30);
  routerButton.mousePressed(toggleNode);
  routerButton.addClass("button");
  clearButton = createButton("Clear Nodes","clear");
  clearButton.position(120,30);
  clearButton.mousePressed(toggleNode);
  clearButton.addClass("button");
  newSceneButton = createButton("New Scene","newScene");
  newSceneButton.position(230,10);
  newSceneButton.mousePressed(newScene);
  newSceneButton.addClass("button");
  savePresetButton = createButton("Save Config","savePreset");
  savePresetButton.position(340,10);
  savePresetButton.mousePressed(savePreset);
  savePresetButton.addClass("button");
  logScene = createButton("Log Scene","logScene");
  logScene.position(230,30);
  logScene.mousePressed(function(){
    console.log(networkScene);
  });
  logScene.addClass("button");
  presetSelect = createSelect();
  presetSelect.id("preset-select");
  presetSelect.option("--");
  presetSelect.option("567_Assignment_One");
  presetSelect.option("567_Assignment_Two");
  presetSelect.option("567_Assignment_Three");
  presetSelect.position(340,33);
  presetSelect.size(100,30);
  presetSelect.changed(selectionMade);
  removeButton = createButton("Remove Node","remove");
  removeButton.position(120,10);
  removeButton.mousePressed(toggleNode);
  removeButton.addClass("button");
}

function assignmentButtons(){
  clearNodes();
  hostButton.remove();
  routerButton.remove();
  clearButton.remove();
  newSceneButton.remove();
  savePresetButton.remove();
}

function selectionMade(e){
  var presetID = e.target.value;
  if(presetID == "--"){
    //createButtons();
    newScene();
    return;
  } else if(presetID.match(/567/)){
    loadAssignmentPreset(presetID);
  } else {
    loadCustomPreset(parseInt(presetID.split(' ').filter(sub => +sub)));
  }
}
function loadAssignmentPreset(presetID){
  //assignmentButtons();
  var assignmentID = presetID.split("_")[2];
  generateAssignment(assignmentID);
}

function generateAssignment(id){
  clearNodes();
  networkScene.presetDrawn = id;
  var nodeObjs, nodeDivs, linkObjs, linkDivs;
  var blockDistX = windowWidth/12,
      blockDistY = windowHeight/12;

  function blockCoords(x,y){
    return({x:x*blockDistX,y:y*blockDistY});
  }
  function adjLinkCoords(node1,node2){
    var shift = 50;
    return({
      x1:node1.coords.x + shift,
      y1:node1.coords.y + shift,
      x2:node2.coords.x + shift,
      y2:node2.coords.y + shift
    })
  }
  function makeConnection(origin, ...connections){
    origin.connections.push(...connections);
  }
  switch(id){
	  //USE AS TEMPLATE VVVVV
    case "One":
      [
        ["host-0",  blockCoords(1,3)],
        ["host-1",  blockCoords(7,3)],
        ["router-0",blockCoords(2,8)],
        ["router-1",blockCoords(6,8)]
      ].map(pair => {
          networkScene.nodeObjs.push(new Host(...pair));
        });

        //connect objects
        var [host0, host1, router0, router1] = [...networkScene.nodeObjs];
        makeConnection(host0, router0);
        makeConnection(host1, router1);
        makeConnection(router0, host0, router1);
        makeConnection(router1, router0, host1);


        //generate node divs
        networkScene.nodeObjs.map(obj => generateDiv(obj.id,obj.coords.x,obj.coords.y));
    	  networkScene.linkObjs.push(...[
      	  (new Link("link-0",[host0,router0],adjLinkCoords(host0,router0),true)),
      		(new Link("link-1",[router0,router1],adjLinkCoords(router0,router1),true)),
      		(new Link("link-2",[router1,host1],adjLinkCoords(router1,host1),true))
    	  ]);
      break;
    case "Two":
    [
      ["host-0",  blockCoords(1,3)],
      ["host-1",  blockCoords(7,3)],
      ["host-2",  blockCoords(4.5,2)],
      ["router-0",blockCoords(2,8)],
      ["router-1",blockCoords(6,8)],
      ["router-2",blockCoords(3,5)],
    ].map(pair => {
        networkScene.nodeObjs.push(new Host(...pair));
      });

      //connect objects
      var [host0, host1, host2, router0, router1, router2] = [...networkScene.nodeObjs];
      makeConnection(host0, router0);
      makeConnection(host1, router1);
      makeConnection(router0, host0, router1, router2);
      makeConnection(router1, router0, host1);
      makeConnection(router2, router0, host2);


      //generate node divs
      networkScene.nodeObjs.map(obj => generateDiv(obj.id,obj.coords.x,obj.coords.y));
      networkScene.linkObjs.push(...[
        (new Link("link-0",[host0,router0],adjLinkCoords(host0,router0),true)),
        (new Link("link-1",[router0,router1],adjLinkCoords(router0,router1),true)),
        (new Link("link-2",[router1,host1],adjLinkCoords(router1,host1),true)),
        (new Link("link-3",[router0,router2],adjLinkCoords(router0,router2),true)),
        (new Link("link-4",[router2,host2],adjLinkCoords(router2,host2),true))
      ]);
      break;
    case "Three":
      [
        ["host-0",  blockCoords(0,4)],
        ["host-1",  blockCoords(8.5,4)],
        ["router-0",blockCoords(1.5,4)],
        ["router-1",blockCoords(2.5,2)],
        ["router-2",blockCoords(2.5,6)],
        ["router-3",blockCoords(3.5,4)],
        ["router-4",blockCoords(5,4)],
        ["router-5",blockCoords(6,2)],
        ["router-6",blockCoords(7,4)],
        ["router-7",blockCoords(6,6)],
      ].map(pair => {
          networkScene.nodeObjs.push(new Host(...pair));
        });

        //connect objects
        var [host0, host1,
             router0, router1, router2, router3,
             router4, router5, router6, router7] = [...networkScene.nodeObjs];
        makeConnection(host0, router0);
        makeConnection(router0, host0, router1, router2);
        makeConnection(router1, router0, router3, router5);
        makeConnection(router2, router0, router3, router7);
        makeConnection(router3, router1, router2, router4);
        makeConnection(router4, router3, router5, router7);
        makeConnection(router5, router1, router4, router6);
        makeConnection(router6, host1, router5, router7);
        makeConnection(router7, router2, router4, router6);


        //generate node divs
        networkScene.nodeObjs.map(obj => generateDiv(obj.id,obj.coords.x,obj.coords.y));
        networkScene.linkObjs.push(...[
          (new Link("link-0",[host0,router0],adjLinkCoords(host0,router0),true)),
          (new Link("link-1",[router0,router1],adjLinkCoords(router0,router1),true)),
          (new Link("link-2",[router0,router2],adjLinkCoords(router0,router2),true)),
          (new Link("link-3",[router2,router3],adjLinkCoords(router2,router3),true)),
          (new Link("link-4",[router1,router3],adjLinkCoords(router1,router3),true)),
          (new Link("link-5",[router1,router5],adjLinkCoords(router1,router5),true)),
          (new Link("link-6",[router3,router4],adjLinkCoords(router3,router4),true)),
          (new Link("link-7",[router2,router7],adjLinkCoords(router2,router7),true)),
          (new Link("link-8",[router4,router5],adjLinkCoords(router4,router5),true)),
          (new Link("link-9",[router4,router7],adjLinkCoords(router4,router7),true)),
          (new Link("link-10",[router5,router6],adjLinkCoords(router5,router6),true)),
          (new Link("link-11",[router6,router7],adjLinkCoords(router6,router7),true)),
          (new Link("link-12",[router6,host1],adjLinkCoords(router6,host1),true)),
        ]);
      break;
  }

}
function loadCustomPreset(presetID){
  var tempPreset, tempArr, tempNode;
  if(presetConfigs.length){
    for(var i=0; i< presetConfigs.length; i++){
      if(presetConfigs[i].sceneID == presetID){
        tempPreset = presetConfigs[i].scene;
      }
    }
    clearNodes();
    networkScene = {
      sceneID: tempPreset.sceneID,
      presetDrawn: null,
      nodeObjs:tempPreset.nodeObjs,
      nodeTypes: ["host","router"],
      currNodeType: null,
      nodeDivs:tempPreset.nodeDivs,
      nodeHover:false,
      linkHover: false,
      selectedNode:null,
      drawingNode: false,
      drawingLink: false,
      removingNodes: false,
      linkFromNode:null,
      linkStartCoords:{x:0,y:0},
      linkObjs:tempPreset.linkObjs,
      linkDivs: tempPreset.linkDivs,
      statusBox:updateStatusBox(),
    }
    //
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

    tempArr = [];
    networkScene.linkObjs.map(obj => {
      tempArr.push(new Link(obj.id, obj.nodes, obj.coords, obj.active));
    });
    networkScene.linkObjs = tempArr;

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

  if(presetConfigs.length){
    for(var i=0; i< presetConfigs.length; i++){
      if(presetConfigs[i].sceneID == networkScene.sceneID){
        console.log("already saved: updating...");
        presetConfigs[i] = {sceneID:presetConfigs[i].sceneID,scene:networkScene}
        return;
      }
    }
  }
  var newID = networkScene.sceneID;
  var newOption = document.createElement("option");
  newOption.text = `Custom Network ${newID}`;

  document.getElementById("preset-select").add(newOption);
  presetConfigs.push({sceneID:newID, scene:networkScene});

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
  angle += (relativeQuadrant < 2) ? 0 : (relativeQuadrant > 3) ? 360 : 180;

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
  linkLayover.mousePressed(function(){
    console.log('link clicked');
  })

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
  if(mouseButton == RIGHT){
	  networkScene.drawingLink = false;
	  networkScene.drawingNode = false;
	  networkScene.removingNodes = false;
	  return;
  }
  var currNode = nodeFromID(e.target.id),
      currDiv  = divFromID(e.target.id);

  if(networkScene.removingNodes){
    removeNode(e.target.id);
  }

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
      networkScene.currNodeType = null;
      updateStatusBox();
    } else {
      networkScene.drawingLink = false;
      networkScene.currNodeType = null;
      updateStatusBox();
    }
  } else if (networkScene.nodeHover){
    networkScene.drawingNode = false;
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
    //console.log(currNode,currDiv);
  } else if (networkScene.drawingNode && validDropPos(mouseX,mouseY) && e.button == 0){
    var newID,newDiv;
    switch(networkScene.currNodeType){
      case "host":
        newID = `host-${hostID}`;
        //push node to nodeObjs for graph
        networkScene.nodeObjs.push(new Host(newID,{x:mouseX-50,y:mouseY-50}));
        generateDiv(newID,mouseX-50,mouseY-50);
        hostID++;
        break;
      case "router":
        newID = `router-${routerID}`;
        //push node to nodeObjs for graph
        networkScene.nodeObjs.push(new Router(newID,{x:mouseX-50,y:mouseY-50}));
        //make div for display
        generateDiv(newID,mouseX-50,mouseY-50);
        routerID++;
        break;
      default:
        console.log("error: no node type selected");
    }
  }
  //console.log(networkScene.selectedNode);
}

function generateDiv(id,x,y){
  newDiv = id.match(/host/) ? createImg("images/computersprite.png")
                            : createImg("images/routersprite2.png");
  newDiv.id(id);
  newDiv.addClass("node");
  newDiv.position(x,y);
  //TODO Fix all this
  newDiv.mouseOver(function(){
    networkScene.nodeHover = true;
    if(networkScene.removingNodes){
      this.style("background","rgba(200,0,0,0.4)");
    }
  });
  newDiv.mouseOut(function(){
    networkScene.nodeHover = false;
    if(networkScene.removingNodes){
      this.style("background","");
    }
  });
  networkScene.nodeDivs.push(newDiv);
}


function mouseMoved() {

}

function toggleNode(e) {
  switch(e.target.value){
    case "host":
	  networkScene.removingNodes = false;
      networkScene.drawingNode = true;
      networkScene.currNodeType = "host";
      updateStatusBox();
      break;
    case "router":
	  networkScene.removingNodes = false;
      networkScene.drawingNode = true;
      networkScene.currNodeType = "router";
      updateStatusBox();
      break;
    case "clear":
      networkScene.drawingNode = false;
      clearNodes();
      break;
    case "remove":
      networkScene.drawingNode = false;
      networkScene.drawingLink = false;
      networkScene.removingNodes = !networkScene.removingNodes;
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


  var statusBox = createDiv(`
                    <h3 id="status-header">Network Status</h3>
                    <div id="status-info">
                      <div>${networkScene.drawingLink}</div>
					  <div>${networkScene.drwaingNode}</div>
					  <div>${networkScene.removingNodes}</div>
					  <div>${networkScene.nodeHover}</div>
					  <div>${networkScene.sceneID}</div>
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
  var pNode, tempArr;
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
  var currNode = nodeFromID(id),
      tempDiv;
  for(var i = 0; i < networkScene.linkObjs.length; i++){
    for(var j = 0; j < networkScene.linkObjs[i].nodes.length; j++){
      if(id == networkScene.linkObjs[i].nodes[j].id){
        networkScene.linkObjs[i].active = false;
      }
    }
  }
  tempArr = networkScene.linkObjs.filter(link => !link.active).map(link => link.id);
  tempArr.map(div => {
    tempDiv = document.getElementById(div);
    tempDiv.remove();
  });
  networkScene.linkDivs = networkScene.linkDivs.map(link => {
    for(i in tempArr){
      if(tempArr[i].id == id){
        return false;
      }
    }
  });
  networkScene.linkObjs = networkScene.linkObjs.filter(link => link.active);
  networkScene.nodeDivs = networkScene.nodeDivs.filter(div => div.elt.id != id);
  networkScene.nodeObjs = networkScene.nodeObjs.filter(obj => obj.id != id);


  for(var i = 0; i < networkScene.nodeObjs.length; i++){
    networkScene.nodeObjs[i].connections = networkScene.nodeObjs[i].connections.filter(connection => connection.id != id);
  }

  if(tempDiv = document.getElementById(id+"-tooltip")){
    tempDiv.remove();
  }
  if(tempDiv = document.getElementById(id)){
    if(tempDiv.className == "node"){
      tempDiv.remove();
    }
  }
  networkScene.nodeHover = false;
}

function newScene(){
  clearNodes(true);
}

function clearNodes(newScene){
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
    sceneID: newScene ? ++networkScene.sceneID : networkScene.sceneID,
    presetDrawn: null,
    nodeObjs:[],
    nodeTypes: ["host","router"],
    currNodeType: null,
    nodeDivs:[],
    nodeHover:false,
    linkHover: false,
    selectedNode:null,
    drawingNode: false,
    drawingLink: false,
    removingNodes: false,
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
  return (x > 50 && x < windowWidth - 255 && y > 100 && y < windowHeight - 30);
}

function togglePointer(){
	canvas.style("cursor","default");
}
