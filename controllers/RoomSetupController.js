const PlayerObject = require("../Objects/playerClass");

exports.createAndJoinRoom = (socket, roomsContainer, roomName) => {
  socket.currentRoom = roomName;
  socket.join(roomName);

  roomsContainer.players[socket.username] = new PlayerObject(socket.username, 70, 70);

  roomsContainer.playerNames[socket.username] = socket.username;
};

// :)
exports.addAnotherPlayerToRoom = (socket, rooms, room) => {
  const currentRoom = rooms[socket.currentRoom];
  console.log("Player counntt");
  console.log(currentRoom.playerCount);

  if (currentRoom.playerCount === 1) {
    console.log("Second person join and player created");
    currentRoom.playerCount = 2;
    currentRoom.playerNames[socket.username] = socket.username;
    currentRoom.players[socket.username] = new PlayerObject(socket.username, 670, 670);
    currentRoom.alivePlayers = 2;
    return;
  }

  if (currentRoom.playerCount === 2) {
    console.log("third person join and player created");
    currentRoom.playerCount = 3;
    currentRoom.playerNames[socket.username] = socket.username;
    currentRoom.players[socket.username] = new PlayerObject(socket.username, 670, 70);
    currentRoom.alivePlayers = 3;
    return;
  }

  if (currentRoom.playerCount === 3) {
    console.log("4th person join and player created");
    currentRoom.playerCount = 4;
    currentRoom.playerNames[socket.username] = socket.username;
    currentRoom.players[socket.username] = new PlayerObject(socket.username, 70, 670);
    currentRoom.alivePlayers = 4;
    return;
  }
};
