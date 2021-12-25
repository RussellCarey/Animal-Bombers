// ! EACH SQUARE CLASS
class Square {
  constructor(numberK, numberI) {
    this.i = numberI;
    this.k = numberK;
    this.size = 15;

    this.xSpace = 750 / 15;
    this.ySpace = 750 / 15;

    this.sprite;
    this.hasPlayer = "";

    this.state;
    this.hasBomb = false;
    this.bombBangTime;
    this.hasBombUp;
    this.hasSpeedBoost;

    this.floorImages = [0, 1, 2];
    this.bushImages = [0, 1, 2];

    this.hasExplosion = false;
    this.explosionEndTime;
    this.w;
    this.h;
    this.x = numberK * this.xSpace;
    this.y = numberI * this.ySpace;
    this.getSize();
    this.squares = [];
    this.getBlock();
    this.getSprite("wall", this.bushImages);
    this.getSprite("floor", this.floorImages);
  }

  getBlock() {
    const random = Math.random() * 100;
    const collectRandom = Math.random() * 100;

    if (random > 8) {
      this.state = "wall";
    } else {
      this.state = "floor";
    }

    if (this.k % 2 === 0 && this.i % 2 === 0) {
      this.state = "hashira";
    }

    if (this.i === 0 || this.i === this.size - 1) {
      this.state = "border";
    }

    if (this.k === 0 || this.k === this.size - 1) {
      this.state = "border";
    }

    if (this.i === 1 && this.k === 1) this.state = "floor";
    if (this.i === 1 && this.k === 2) this.state = "floor";
    if (this.i === 2 && this.k === 1) this.state = "floor";

    if (this.i === this.size - 2 && this.k === 1) this.state = "floor";
    if (this.i === this.size - 2 && this.k === 2) this.state = "floor";
    if (this.i === this.size - 3 && this.k === 1) this.state = "floor";

    if (this.i === 1 && this.k === this.size - 3) this.state = "floor";
    if (this.i === 1 && this.k === this.size - 2) this.state = "floor";
    if (this.i === 2 && this.k === this.size - 2) this.state = "floor";

    if (this.i === this.size - 2 && this.k === this.size - 2) this.state = "floor";
    if (this.i === this.size - 2 && this.k === this.size - 3) this.state = "floor";
    if (this.i === this.size - 3 && this.k === this.size - 2) this.state = "floor";

    if (collectRandom > 80 && this.state === "wall") {
      const random = Math.random() * 100;

      if (random >= 50) {
        this.hasSpeedBoost = true;
        this.hasBombUp = false;
      } else if (random < 50) {
        this.hasBombUp = true;
        this.hasSpeedBoost = false;
      }
    }
  }

  getSprite(state, images) {
    if (this.state === state) {
      const maxValue = images.length;
      const random = Math.floor(Math.random() * maxValue);
      this.sprite = images[random];
    }
  }

  getSize() {
    this.w = this.xSpace;
    this.h = this.ySpace;
  }
}

module.exports = Square;
