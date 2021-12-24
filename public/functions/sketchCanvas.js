let mainMap;
let playersData;
let fogData;

let gotMap = false;
let start = false;
let myPosition;
let xSpace = 750 / 15;
let ySpace = 750 / 15;

let holdingUp;
let holdingDown;
let holdingLeft;
let holdingRight;

let spriteBorder;
let spriteHashira;
let spriteBomb;
let spritePlayer;
let spriteExplosion;
let spriteBush2;
let spriteBush3;
let spriteBush4;
let spriteFloor2;
let spriteFloor3;
let spriteFloor4;

let spriteRightArrow;
let spriteLeftArrow;
let blackBG;
let currentCharacter = 0;

let playerSpritesArray = [];

let spriteCollectable;
let spriteSpeed;

let fogTop;
let fogRight;
let fogBottom;
let fogLeft;

let youwin;
let youloose;
let waiting;

let one;
let two;
let three;

let gameOutcome;

const bushArray = [];
const floorArray = [];

let countdownRecieved = false;
let countdownStartTime = 0;
let countdownEnded = false;

let choosingCharacter = true;

const sfxPlaceBomb = new Audio("../sound/placeBomb.mp3");
const bgmMusic = new Audio("../sound/bgm.mp3");

function preload() {
  spriteBomb = loadImage("../images/testBomb.png");
  //
  spritePlayer = loadImage("../images/testSchmoobly3.png");
  spritePlayerRabbit = loadImage("../images/testPlayerRabbit.png");

  blackBG = loadImage("../images/blackBackground.png");
  playerSpritesArray.push([spritePlayer, "red"]);
  playerSpritesArray.push([spritePlayerRabbit, "pink"]);
  //
  spriteHashira = loadImage("../images/testHashira.png");
  spriteExplosion = loadImage("../images/testExplosion.png");
  spriteCollectable = loadImage("../images/testCollectable.png");
  spriteSpeed = loadImage("../images/testSpeed.png");

  spriteBush3 = loadImage("../images/testBush3.png");
  spriteBush4 = loadImage("../images/testBush4.png");
  spriteBush5 = loadImage("../images/testBush5.png");
  spriteFloor2 = loadImage("../images/testFloor2.png");
  spriteFloor3 = loadImage("../images/testFloor3.png");
  spriteFloor4 = loadImage("../images/testFloor4.png");

  youloose = loadImage("../images/youloose.png");
  youwin = loadImage("../images/youwin.png");
  waiting = loadImage("../images/waiting.png");

  fogTop = loadImage("../images/fogTop.png");
  fogRight = loadImage("../images/fogRight.png");
  fogBottom = loadImage("../images/fogBottom.png");
  fogLeft = loadImage("../images/fogLeft.png");

  one = loadImage("../images/1.png");
  two = loadImage("../images/2.png");
  three = loadImage("../images/3.png");

  spriteLeftArrow = loadImage("../images/leftArrow.png");
  spriteRightArrow = loadImage("../images/rightArrow.png");
  spriteLeftArrowBig = loadImage("../images/leftArrowBig.png");
  spriteRightArrowBig = loadImage("../images/rightArrowBig.png");
  spriteReadyButton = loadImage("../images/readyButton.png");
}

function setup() {
  const canvas = createCanvas(750, 750);
  canvas.parent("gameScreen__gamewindow");

  bushArray.push(spriteBush3);
  bushArray.push(spriteBush4);
  bushArray.push(spriteBush5);
  floorArray.push(spriteFloor2);
  floorArray.push(spriteFloor3);
  floorArray.push(spriteFloor4);
}

/////////////////////////////////////////////////////////////////
//! Socket
/////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
//! DRAWWWW
/////////////////////////////////////////////////////////////////
function draw() {
  if (gotMap) {
    renderSquares();
    renderPlayers();
    renderFog();

    if (gameOutcome === "win") {
      image(youwin, 0, 0, 750, 750);
    } else if (gameOutcome === "loose") {
      image(youloose, 0, 0, 750, 750);
    } else if (!countdownRecieved) {
      image(waiting, 0, 0, 750, 750);
    }

    countdown();
    characterSelect();
  }

  if (!gotMap) {
    bgmMusic.pause();
    bgmMusic.currentTime = 0;
  }
}

/////////////////////////////////////////////////////////////////
//! Functions
/////////////////////////////////////////////////////////////////

function countdown() {
  if (countdownRecieved === true) {
    if (Math.floor(Date.now() - countdownStartTime) < 2000) {
      image(three, 0, 0, 750, 750);
    } else if (Math.floor(Date.now() - countdownStartTime) < 3000) {
      image(two, 0, 0, 750, 750);
    } else if (Math.floor(Date.now() - countdownStartTime) < 4200) {
      image(one, 0, 0, 750, 750);
    } else {
      countdownEnded = true;
      bgmMusic.volume = 0.1;
      bgmMusic.play();
    }
  }
}

function renderSquares() {
  // Generate Map Tiles
  Object.keys(mainMap.map).forEach((val) => {
    mainMap.map[val].forEach((el) => {
      if (el.state === "floor" && !el.hasCollectable && !el.hasSpeedBoost) {
        image(floorArray[el.sprite], el.x, el.y, el.w, el.h);
      } else if (el.state === "border") {
        image(spriteHashira, el.x, el.y, el.w, el.h);
      } else if (el.state === "hashira") {
        image(spriteHashira, el.x, el.y, el.w, el.h);
      }

      if (el.state === "floor" && el.hasSpeedBoost === true) {
        image(spriteSpeed, el.x, el.y, el.w, el.h);
      } else if (el.state === "floor" && el.hasBombUp === true) {
        image(spriteCollectable, el.x, el.y, el.w, el.h);
      }

      if (el.state === "wall") {
        image(bushArray[el.sprite], el.x, el.y, el.w, el.h);
      }
      if (el.hasBomb) {
        image(spriteBomb, el.x, el.y, el.w, el.h);
      }

      if (el.hasExplosion) {
        image(spriteExplosion, el.x, el.y, el.w, el.h);
      }
    });
  });
}

function characterSelect() {
  if (choosingCharacter) {
    image(blackBG, 0, 0, 750, 750);
    image(spriteLeftArrow, 50, 225, 150, 250);
    image(spriteRightArrow, 560, 225, 150, 250);
    image(spriteReadyButton, 230, 575, 300, 100);
    image(playerSpritesArray[currentCharacter][0], 280, 200, 200, 300);

    if (mouseX > 50 && mouseX < 200 && mouseY > 255 && mouseY < 475) {
      console.log("Inside left arrow");
      image(spriteLeftArrowBig, 50, 225, 150, 250);
    }

    if (mouseX > 560 && mouseX < 680 && mouseY > 255 && mouseY < 475) {
      console.log("Inside right arrow");
      image(spriteRightArrowBig, 560, 225, 150, 250);
    }

    if (mouseX > 225 && mouseX < 750 - 225 && mouseY > 575 && mouseY < 675) {
      console.log("Inside select button");
    }
  }
}

function renderPlayers() {
  if (!choosingCharacter && playersData) {
    Object.entries(playersData).forEach((player) => {
      if (player[1].username === username) {
        myPosition = [player[1].x, player[1].y];
      }

      if (player[1].character === "red") {
        image(
          playerSpritesArray[0][0],
          player[1].x - 25,
          player[1].y - 70,
          50,
          75
        );
      }

      if (player[1].character === "pink") {
        image(
          playerSpritesArray[1][0],
          player[1].x - 25,
          player[1].y - 70,
          50,
          75
        );
      }
    });
  }
}

function renderFog() {
  if (fogData) {
    image(fogRight, fogData.right.x1, 0, 500, 800);
    image(fogLeft, fogData.left.x1, 0, 500, 800);
  }
}

/////////////////////////////////////////////////////////////////
//! KEYPRESSES
/////////////////////////////////////////////////////////////////
function mouseClicked() {
  if (gotMap && choosingCharacter) {
    if (mouseX > 50 && mouseX < 200 && mouseY > 255 && mouseY < 475) {
      currentCharacter--;
      if (currentCharacter < 0) {
        currentCharacter = playerSpritesArray.length - 1;
      }
    }

    if (mouseX > 530 && mouseX < 680 && mouseY > 255 && mouseY < 475) {
      currentCharacter++;
      if (currentCharacter > playerSpritesArray.length - 1) {
        currentCharacter = 0;
      }
    }

    if (mouseX > 225 && mouseX < 750 - 225 && mouseY > 575 && mouseY < 675) {
      socket.emit("playerChosen", playerSpritesArray[currentCharacter][1]);
      choosingCharacter = false;
    }
  }
}

function keyPressed() {
  if (countdownEnded) {
    // Right
    if (keyCode === 68) {
      holdingRight = true;
    }

    // Left
    if (keyCode === 65) {
      holdingLeft = true;
    }

    // Up
    if (keyCode === 87) {
      holdingUp = true;
    }

    // Down
    if (keyCode === 83) {
      holdingDown = true;
    }

    // Arrow keys
    // Right
    if (keyCode === RIGHT_ARROW) {
      holdingRight = true;
    }

    // Left
    if (keyCode === LEFT_ARROW) {
      holdingLeft = true;
    }

    // Up
    if (keyCode === 38) {
      holdingUp = true;
    }

    // Down
    if (keyCode === 40) {
      holdingDown = true;
    }
  }
}

function keyReleased() {
  if (keyCode === 32) {
    placeBomb();
  }

  if (keyCode === 68) {
    holdingRight = false;
  }

  // Left
  if (keyCode === 65) {
    holdingLeft = false;
  }

  // Up
  if (keyCode === 87) {
    holdingUp = false;
  }

  // Down
  if (keyCode === 83) {
    holdingDown = false;
  }

  // Arrow keys
  // Right
  if (keyCode === RIGHT_ARROW) {
    holdingRight = false;
  }

  // Left
  if (keyCode === LEFT_ARROW) {
    holdingLeft = false;
  }

  // Up
  if (keyCode === 38) {
    holdingUp = false;
  }

  // Down
  if (keyCode === 40) {
    holdingDown = false;
  }
}

function placeBomb() {
  // Loop through all the tiles and check if the tile
  if (start) {
    Object.entries(mainMap.map).forEach((val) => {
      val[1].forEach((el) => {
        if (
          myPosition[0] > el.x &&
          myPosition[0] < el.x + xSpace &&
          myPosition[1] > el.y &&
          myPosition[1] < el.y + ySpace
        ) {
          sfxPlaceBomb.play();
          socket.emit("placedBomb", el);
        }
      });
    });
  }
}
