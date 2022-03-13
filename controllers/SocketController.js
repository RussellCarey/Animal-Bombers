// Socket IO setup
const GameplayController = require("./GamePlayController");
const RoomSetupController = require("./RoomSetupController");
const Map = require("../objects/MapClass");
var randomWords = require("random-words");

exports.setupSocketCommands = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: server,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const rooms = {};

  // ! ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //! Pre game setup
  // ! ////////////////////////////////////////////////////////////////////////////////////////////////////////////

  io.on("connection", (socket) => {
    //? Emit connected to the client when user connects to this server.
    socket.emit("connected");

    //? ON recieveing the username from the client -- (CHECKED)
    socket.on("usernameSent", async (username) => {
      const sockets = io.of("/").adapter.nsp.sockets;

      sockets.forEach((el) => {
        if (el.username === username) {
          return socket.emit("usernameTaken", username);
        }
      });

      socket.username = username;
      socket.emit("gotUsername", username);
    });

    //? On creating a new room - -- (CHECKED)
    socket.on("createRoomRequest", (people) => {
      const newRoomID = randomWords({ exactly: 2, join: "-" });
      rooms[newRoomID] = new Map(people);

      RoomSetupController.createAndJoinRoom(socket, rooms[newRoomID], newRoomID);

      rooms[newRoomID].maxPlayers = people;

      socket.emit("joinedCreatedRoom", {
        roomid: newRoomID,
        map: rooms[newRoomID],
      });
    });

    //? On joining an existing room -- (CHECKED);;;;;;
    socket.on("joinRoom", (roomname) => {
      socket.currentRoom = roomname.trim();
      const socketRooms = io.of("/").adapter.rooms;
      const socketRoom = socketRooms.get(socket.currentRoom);

      if (socketRoom) {
        socket.join(roomname);

        socket.emit("joinedCurrentRoom", {
          roomid: roomname,
          map: rooms[roomname],
        });

        RoomSetupController.addAnotherPlayerToRoom(socket, rooms, roomname);

        if (socketRoom && socketRoom.size > 4) {
          socket.emit("roomIsFull", roomname);
        }
      } else {
        socket.emit("invalidRoomCode");
      }
    });

    //? On a new player joining the rom that I am in
    //! (NOT CHECKED)
    socket.on("playerJoinedRoom", () => {
      if (Object.keys(rooms[socket.currentRoom].playerNames).length == rooms[socket.currentRoom].maxPeople) {
        // rooms[socket.currentRoom].gameStarted = true;
        // rooms[socket.currentRoom].gameStartTime = Date.now();
      }
    });

    //? When user has selected a player -- CHECK IF ALL PLAYERS ARE READY
    socket.on("playerChosen", async (spriteName) => {
      const currentRoom = rooms[socket.currentRoom];
      if (spriteName == undefined) spriteName = "red";

      currentRoom.players[socket.username].character = spriteName;
      currentRoom.readyNumber++;

      console.log(currentRoom.readyNumber, currentRoom.maxPeople);
      if (currentRoom.readyNumber == currentRoom.maxPeople) {
        io.to(`${socket.currentRoom}`).emit("startCountdown");
        currentRoom.gameStarted = true;
        currentRoom.gameStartTime = Date.now();
      }
    });

    //? When getting a notice that ------------????????
    socket.on("endOfGameLeave", () => {
      if (rooms[socket.currentRoom]) {
        rooms[socket.currentRoom].gameStarted = false;
        delete rooms[socket.currentRoom];
      }

      //? On socket leaving the room
      socket.leave(socket.currentRoom);
      socket.currentRoom = "";
    });

    //? ON this sicket disconnecting
    socket.on("disconnect", () => {
      io.to(`${socket.currentRoom}`).emit("userLeft", {
        id: socket.id,
        username: socket.username,
      });

      if (socket.currentRoom) {
        // Delete from players left object
        delete rooms[socket.currentRoom].playerNames[socket.username];
        // Decrease players in the room
        rooms[socket.currentRoom].alivePlayers--;
        // Remove player from the ROOM
        delete rooms[socket.currentRoom].players[socket.username];
      }
    });

    //! //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //! Sending information about the gameplay
    //! //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //? On recenving the movement of the player (NONSTOP)
    socket.on("tickMovement", (directions) => {
      GameplayController.detectCollisions(socket, rooms, directions, io);
    });

    //? Detecting a bomb placement from the player
    socket.on("placedBomb", (position) => {
      GameplayController.placedBomb(socket, position, rooms, io);
    });

    //? Sending player position and fog position back to the player
    setInterval(() => {
      if (rooms[socket.currentRoom]) {
        socket.emit("tock", {
          fog: rooms[socket.currentRoom].fogPosition,
          players: rooms[socket.currentRoom].players,
        });
      }
    }, 33);
  });
};
