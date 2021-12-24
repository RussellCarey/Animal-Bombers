let username = "";
const socket = io.connect("/");

// Main containers
const usernameScreen = document.getElementById("usernameScreen");
const welcomeScreen = document.getElementById("welcomeScreen");
const gameScreen = document.getElementById("gameScreen");
const joinRoomScreen = document.getElementById("joinRoomScreen");

// Buttons
const usernameSubmit = document.getElementById("usernameSubmit");
const roomCodeSubmit = document.getElementById("roomCodeSubmit");
const createNewButton = document.getElementById("createRoomButton");

// Inputfields
const roomCodeInput = document.getElementById("roomCodeInput");
const usernameInput = document.getElementById("usernameInput");
const people = document.getElementById("peopleNumber");

const sfxWin = new Audio("../sound/win.mp3");
const sfxLoose = new Audio("../sound/loose.mp3");
const sfxBombExplode = new Audio("../sound/exp1.mp3");
const sfxPlayerDied = new Audio("../sound/playerDied.mp3");
const sfxCollectable = new Audio("../sound/sfxCollectable.mp3");

const codeModal = document.getElementById("codeModal");
const codeModalText = document.getElementById("codeModalText");

//! ////////////////////////////////////////////////////////////////////////////////////////////////////////////
//? Event listeners
//! ////////////////////////////////////////////////////////////////////////////////////////////////////////////

usernameSubmit.addEventListener("click", () => {
  socket.emit("usernameSent", usernameInput.value);
});

createNewButton.addEventListener("click", () => {
  socket.emit("createRoomRequest", people.value);
  setTimeout(() => {
    gsap.to(joinRoomScreen, { duration: 1, x: 3000 });
  }, 2000);
});

roomCodeSubmit.addEventListener("click", () => {
  socket.emit("joinRoom", roomCodeInput.value);
  roomCodeInput.value = "";
});

//! ////////////////////////////////////////////////////////////////////////////////////////////////////////////
//? Socket Stuff
//! ////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener("load", () => {
  setTimeout(() => {
    gsap.to(welcomeScreen, { duration: 1, x: 3000 });
  }, 500);
});

// On joining the room get the name and the map
socket.on("connected", () => {
  //! When connection to the socket is okay - Show enter username button. (CHECK FOR DUPLICATE USERNAMES?);
});

socket.on("gotUsername", (userName) => {
  username = userName;

  gsap.to(usernameScreen, { duration: 1, x: 3000 });
});

socket.on("usernameTaken", () => {
  console.log("Username is taken");
  //! SHOW MODAL IF USERNAME IS TAKEN
});

// On joining the room get the name and the map
socket.on("joinedCreatedRoom", (data) => {
  console.log(`Room code is":::: ${data.roomid}`);
  codeModalText.innerText = `Room-code: ${data.roomid}`;
  //! - COPY NAME TO CLIPBOARD AND SHOW MODAL
  // var promise = navigator.clipboard.writeText(data.roomid).then(() => {
  //   console.log("clipboard written");
  // });
  mainMap = null;
  mainMap = data.map;
  gotMap = true;
  socket.emit("playerJoinedRoom");
});

// On joining the room get the map
socket.on("joinedCurrentRoom", (data) => {
  mainMap = data.map;
  gotMap = true;
  setTimeout(() => {
    socket.emit("playerJoinedRoom");
    gsap.to(joinRoomScreen, { duration: 1, x: 3000 });
  }, 1000);
});

socket.on("invalidRoomCode", () => {
  //! SHOW MODAL FOR INVALID ROOM CODE
  console.log("Invalid room code");
});

socket.on("startCountdown", () => {
  countdownRecieved = true;
  countdownStartTime = Date.now();
  start = true;
});

socket.on("tock", (data) => {
  playersData = data.players;
  fogData = data.fog;
});

socket.on("lastPlayer", (playerNameArray) => {
  if (playerNameArray[0] === username) {
    gameOutcome = "win";
    sfxWin.play();
  } else {
    gameOutcome = "loose";
    sfxLoose.play();
  }

  setTimeout(() => {
    socket.emit("endOfGameLeave");
    gsap.to(joinRoomScreen, { duration: 1, x: 0 });

    mainMap = undefined;
    gotMap = false;
    gameOutcome = "";
    animationTimer = 0;
    playersData = undefined;
    fogData = undefined;
    countdownEnded = false;
    countdownRecieved = false;
    countdownStartTime = 0;
    choosingCharacter = true;
  }, 5000);
});

socket.on("playBombSound", () => {
  sfxPlaceBomb.play();
});

socket.on("playerDiedSound", () => {
  sfxPlayerDied.play();
});

socket.on("playCollectableSound", () => {
  sfxCollectable.play();
});

socket.on("bombExplodeSound", () => {
  if (!sfxBombExplode.paused) {
    const bomb = new Audio("../sound/exp1.mp3");
    bomb.play();
  }

  sfxBombExplode.play();
});

socket.on("mapUpdate", (map) => {
  mainMap = map;
});

// Send data to the client (if holding button down);
setInterval(() => {
  if (start)
    socket.emit("tickMovement", {
      right: holdingRight,
      left: holdingLeft,
      down: holdingDown,
      up: holdingUp,
    });
}, 33);
