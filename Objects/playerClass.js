class Player {
  constructor(username, x, y) {
    this.username = username;
    this.size = 50;
    this.x = x;
    this.y = y;
    this.speed = 4;
    this.strength = 2;
    this.isHoldingLeft;
    this.isHoldingRight;
    this.isHoldingUp;
    this.isHoldingDown;
    this.isDead = false;
    this.oldSafePlace = [this.x, this.y];
    this.startingX = 0;
    this.startingY = 0;
    this.character = "";
  }
}

module.exports = Player;
