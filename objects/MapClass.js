const Square = require("./squareClass");

///// Lets gooooo
class Map {
  constructor(maxPeople) {
    this.map = {};
    this.size = 15;
    this.fogPosition = {
      left: { x1: -500, x2: 0 },
      right: { x1: 750, x2: 1250 },
    };

    this.bombs;
    this.explosions;

    this.gameStarted = false;
    this.gameStartTime;
    this.currentTime = 0;

    this.players = {};
    this.playerCount = 1;
    this.alivePlayers = 1;
    this.playerNames = {};
    this.readyNumber = 0;
    this.maxPeople = maxPeople;

    this.suddenDeathStartTime = 150000;

    this.checkPeopleNumber();
    this.generateMapArray();
  }

  checkPeopleNumber() {
    if (this.maxPeople == undefined) this.maxPeople = 1;
    if (this.maxPeople > 4) this.maxPeople = 4;
    if (this.maxPeople < 1) this.maxPeople = 1;
  }

  generateMapArray() {
    for (let i = 0; i < this.size; i++) {
      this.map[i] = [];

      for (let k = 0; k < this.size; k++) {
        this.map[i].push(new Square(k, i, k));
      }
    }
  }
}

module.exports = Map;
