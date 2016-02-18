var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Player = require("./server-player");
var grid = require("./server-grid");

var maze;
var maze_grid;
var maze_h=51;
var maze_w=51;

//var socket;
var players;

function init() {
  players = [];
  server.listen(8080);
  maze_grid= new grid(maze_w, maze_h);
  //console.log(maze_grid);
  //console.log(io);
  setEventHandlers();
}

var setEventHandlers = function() {
    io.on("connection", onSocketConnection);
	console.log('Server running');
};

function onSocketConnection(client) {
    console.log("New player has connected: "+client.id);
	this.emit("new map", maze_grid);
    client.on("disconnect", onClientDisconnect);
    client.on("new player", onNewPlayer);
    client.on("move player", onMovePlayer);
}

function onClientDisconnect() {
    console.log("Player has disconnected: "+this.id);
	
	var r=-1;
	r=playerById(this.id);
	if(r!=-1){
		this.broadcast.emit('remove player', {id: this.id});
		players.splice(r, 1);
	}
}

function onNewPlayer(data) {
  console.log("creating new player");
  
  var newPlayer = new Player(data.x, data.y);
  newPlayer.id = this.id;
  this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});
  var i, existingPlayer;
  for (i = 0; i < players.length; i++) {
    existingPlayer = players[i];
    this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
  }
  players.push(newPlayer);
}

function onMovePlayer(data) {
	  // Find player in array
  var movePlayer=-1;
  movePlayer  = playerById(this.id);

  // Player not found
  if (movePlayer==-1) {
    console.log('Player not found: ' + this.id);
    return;
  }

  // Update player position
  //movePlayer.setX(data.x);
  //movePlayer.setY(data.y);

  // Broadcast updated position to connected socket clients
  this.broadcast.emit('move player', {id: this.id, x: data.x, y: data.y});
}

function playerById (id) {
  var i=0;
  var c=false;
  do {
    if (players[i].id == id) {
      c=true;
    }else{
		i++;
	}
  }while(i < players.length&&c==false);

  return i;
}

init();

