// Ball physics with gravity and platform collisions

export class BallPhysics {
  constructor(width, height) {
    this.width = width - 2; // Account for borders
    this.height = height;

    // Ball position and velocity
    this.x = width / 2;
    this.y = 0;
    this.vx = 0.3 + Math.random() * 0.2; // Slight horizontal drift
    this.vy = 0;

    // Physics constants
    this.gravity = 0.15;
    this.bounce = 0.6;
    this.friction = 0.98;
    this.maxSpeed = 2;
  }

  update(platforms) {
    // Apply gravity
    this.vy += this.gravity;

    // Cap velocity
    this.vy = Math.min(this.vy, this.maxSpeed);

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off walls
    if (this.x <= 0) {
      this.x = 0;
      this.vx = Math.abs(this.vx) * this.bounce;
    } else if (this.x >= this.width - 1) {
      this.x = this.width - 1;
      this.vx = -Math.abs(this.vx) * this.bounce;
    }

    // Check platform collisions
    for (const platform of platforms) {
      if (this.collidesWithPlatform(platform)) {
        // Land on platform
        this.y = platform.y - 1;
        this.vy = -Math.abs(this.vy) * this.bounce;

        // Roll off platform edges
        if (this.x < platform.x + platform.width / 2) {
          this.vx -= 0.1;
        } else {
          this.vx += 0.1;
        }
      }
    }

    // Wrap around vertically (like a mill)
    if (this.y >= this.height) {
      this.y = 0;
      this.vy = 0.5;
      // Randomize horizontal direction when respawning
      this.vx = (Math.random() - 0.5) * 0.6;
    }

    // Apply friction
    this.vx *= this.friction;
  }

  collidesWithPlatform(platform) {
    const ballRadius = 0.5;
    const nextY = this.y + this.vy;

    // Check if ball is moving downward and will intersect platform
    if (this.vy > 0 &&
        this.y <= platform.y &&
        nextY >= platform.y - 1 &&
        this.x >= platform.x - ballRadius &&
        this.x <= platform.x + platform.width + ballRadius) {
      return true;
    }
    return false;
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  // Apply a force (used for interactions)
  applyForce(fx, fy) {
    this.vx += fx;
    this.vy += fy;
  }
}
