exports.placedBomb = (socket, el, rooms, io) => {
  const currentRoom = rooms[socket.currentRoom];

  // Loop through all the tiles and check if the tile
  if (currentRoom && currentRoom.gameStarted) {
    // currentRoom.map[el.i][el.k] = el;
    currentRoom.map[el.i][el.k].hasBomb = true;
    currentRoom.map[el.i][el.k].bombBangTime = getCurrentTime(socket, rooms) + 3000;

    io.in(socket.currentRoom).emit("mapUpdate", currentRoom);
    io.in(socket.currentRoom).emit("playBombSound");

    return true;
  }
};

exports.detectCollisions = (socket, room, directions, io) => {
  const currentRoom = room[socket.currentRoom];
  if (currentRoom && currentRoom.gameStarted) {
    Object.keys(currentRoom.map).forEach((val) => {
      const currentPlayer = currentRoom.players[socket.username];

      currentRoom.map[val].forEach((el) => {
        checkBombs(socket, el, io, room);

        if (
          currentPlayer.x > el.x - 2 &&
          currentPlayer.x < el.x + el.xSpace + 2 &&
          currentPlayer.y > el.y - 2 &&
          currentPlayer.y < el.y + el.ySpace + 2
        ) {
          if (el.hasExplosion) {
            killPlayer(socket, room, io);
            return;
          }

          if (el.hasBombUp) {
            socket.emit("playCollectableSound");
            currentPlayer.strength++;
            el.hasBombUp = false;
            io.in(socket.currentRoom).emit("mapUpdate", currentRoom);
            return;
          }

          if (el.hasSpeedBoost) {
            socket.emit("playCollectableSound");
            currentPlayer.speed += 0.5;
            el.hasSpeedBoost = false;
            io.in(socket.currentRoom).emit("mapUpdate", currentRoom);
            return;
          }

          if (el.state === "floor" && el.hasBomb) {
            movePlayer(0.5, socket, directions, room);
            return;
          }

          if (el.state === "hashira") {
            stopPlayerMovement(socket, currentRoom);
          }

          if (el.state === "floor") {
            currentPlayer.oldSafePlace = [currentPlayer.x, currentPlayer.y];
            movePlayer(1, socket, directions, room);

            return;
          }

          if (el.state !== "floor") {
            stopPlayerMovement(socket, currentRoom);
            return;
          }
        }
      });
    });

    moveFog(socket, room, currentRoom.fogPosition);
    checkFogDeath(socket, room[socket.currentRoom].fogPosition, room, io);
  }
};

function stopPlayerMovement(socket, room) {
  const currentPlayer = room.players[socket.username];
  currentPlayer.x = currentPlayer.oldSafePlace[0];
  currentPlayer.y = currentPlayer.oldSafePlace[1];
}

function getCurrentTime(socket, rooms) {
  return Date.now() - rooms[socket.currentRoom].gameStartTime;
}

function checkBombs(socket, tile, io, room) {
  if (tile.bombBangTime < getCurrentTime(socket, room)) {
    io.in(socket.currentRoom).emit("bombExplodeSound");
    checkExplosion(tile, socket, room, io);
    tile.bombBangTime = undefined;
  }

  if (tile.explosionEndTime < getCurrentTime(socket, room)) {
    tile.hasExplosion = false;
    tile.explosionEndTime = undefined;
    io.in(socket.currentRoom).emit("mapUpdate", room[socket.currentRoom]);
  }
}

function moveFog(socket, room, fogPosition) {
  const currentRoom = room[socket.currentRoom];
  if (currentRoom && currentRoom.gameStarted && getCurrentTime(socket, room) > currentRoom.suddenDeathStartTime) {
    fogPosition.left.x1 += 0.1;
    fogPosition.left.x2 += 0.1;
    fogPosition.right.x1 -= 0.1;
    fogPosition.right.x2 -= 0.1;
  }
}

function movePlayer(speed, socket, directs, rooms) {
  const currentPlayer = rooms[socket.currentRoom].players[socket.username];

  if (directs.up) {
    currentPlayer.y -= speed * 2;
    return;
  }

  if (directs.down) {
    currentPlayer.y += speed * 2;
    return;
  }

  if (directs.left) {
    currentPlayer.x -= speed * 2;
    return;
  }

  if (directs.right) {
    currentPlayer.x += speed * 2;
    return;
  }
}

function checkExplosion(el, socket, rooms, io) {
  el.hasExplosion = true;
  el.explosionEndTime = getCurrentTime(socket, rooms) + 1100;

  // Check up
  checkExplosionDirection(el, socket, -1, 0, rooms, io);
  // Check down
  checkExplosionDirection(el, socket, 1, 0, rooms, io);
  // Check left
  checkExplosionDirection(el, socket, 0, -1, rooms, io);
  // Check right
  checkExplosionDirection(el, socket, 0, 1, rooms, io);

  el.hasBomb = false;
  io.in(socket.currentRoom).emit("mapUpdate", rooms[socket.currentRoom]);
}

function checkExplosionDirection(el, socket, changeX, changeY, rooms, io) {
  const strength = rooms[socket.currentRoom].players[socket.username].strength;

  for (let i = 1; i < strength; i++) {
    const xvalue = el.i + i * changeX;
    const kvalue = el.k + i * changeY;
    console.log(xvalue, kvalue);
    const square = rooms[socket.currentRoom].map[xvalue][kvalue];

    if (kvalue > 14 || xvalue > 14) {
      break;
    }

    if (kvalue < 0 || xvalue < 0) {
      break;
    }

    // Guard
    if (!square) break;

    if (square.state === "hashira") {
      break;
    }

    if (square.state === "floor") {
      square.hasExplosion = true;
      square.explosionEndTime = getCurrentTime(socket, rooms) + 1100;
    }

    if (square.state === "wall") {
      // Guard - stop it hopping over the stone
      square.hasExplosion = true;
      square.explosionEndTime = getCurrentTime(socket, rooms) + 1100;
      square.state = "floor";
      break;
    }
  }
}

function killPlayer(socket, room, io) {
  const currentRoom = room;

  const alivePlayers = currentRoom[socket.currentRoom].alivePlayers;
  if (socket.isDead) return;

  if (alivePlayers > 1) {
    io.in(socket.currentRoom).emit("playerDiedSound");
    currentRoom.players[socket.username].isDead = true;
    currentRoom.players[socket.username].x = 5000;
    currentRoom[socket.currentRoom].alivePlayers--;
    delete currentRoom.playerNames[socket.username];
  }

  if (alivePlayers <= 1) {
    socket.emit("playerDiedSound");
    io.in(socket.currentRoom).emit("lastPlayer", Object.keys(currentRoom[socket.currentRoom].playerNames));
  }
}

function checkFogDeath(socket, fogPosition, rooms, io) {
  // right fog
  checkPlayerInBounds(socket, fogPosition.right.x1 + 50, fogPosition.right.x2, rooms, io);
  // left fog
  checkPlayerInBounds(socket, fogPosition.left.x1, fogPosition.left.x2 - 50, rooms, io);
}

function checkPlayerInBounds(socket, p1, p2, rooms, io) {
  const currentPlayer = rooms[socket.currentRoom].players[socket.username];

  if (currentPlayer.x > p1 && currentPlayer.x < p2) {
    killPlayer(socket, rooms[socket.currentRoom], io);
  }
}
