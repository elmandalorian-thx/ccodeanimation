// Fireworks celebration when coding is complete

const ESC = '\x1b';
const colors = {
  red: `${ESC}[31m`,
  green: `${ESC}[32m`,
  yellow: `${ESC}[33m`,
  blue: `${ESC}[34m`,
  magenta: `${ESC}[35m`,
  cyan: `${ESC}[36m`,
  white: `${ESC}[37m`,
  brightRed: `${ESC}[91m`,
  brightGreen: `${ESC}[92m`,
  brightYellow: `${ESC}[93m`,
  brightBlue: `${ESC}[94m`,
  brightMagenta: `${ESC}[95m`,
  brightCyan: `${ESC}[96m`,
};

const colorValues = Object.values(colors);
const sparkChars = ['*', '✦', '✧', '⋆', '·', '○', '◌', '+', '×'];

export class Fireworks {
  constructor(width, height) {
    this.width = width - 2;
    this.height = height;
    this.particles = [];
    this.rockets = [];
    this.active = false;
    this.launchInterval = null;
  }

  start() {
    this.active = true;
    // Launch rockets periodically
    this.launchRocket();
    this.launchInterval = setInterval(() => {
      if (this.active) {
        this.launchRocket();
      }
    }, 800);
  }

  stop() {
    this.active = false;
    if (this.launchInterval) {
      clearInterval(this.launchInterval);
    }
  }

  launchRocket() {
    const rocket = {
      x: Math.random() * this.width,
      y: this.height,
      vy: -0.8 - Math.random() * 0.4,
      explodeAt: 3 + Math.random() * (this.height / 2),
      color: colorValues[Math.floor(Math.random() * colorValues.length)],
    };
    this.rockets.push(rocket);
  }

  explode(rocket) {
    const particleCount = 12 + Math.floor(Math.random() * 8);
    const color = rocket.color;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 0.3 + Math.random() * 0.3;

      this.particles.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 20 + Math.floor(Math.random() * 15),
        color: color,
        char: sparkChars[Math.floor(Math.random() * sparkChars.length)],
      });
    }

    // Add some random sparkles
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: rocket.x + (Math.random() - 0.5) * 4,
        y: rocket.y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 10 + Math.floor(Math.random() * 10),
        color: colors.white,
        char: '·',
      });
    }
  }

  update() {
    // Update rockets
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const rocket = this.rockets[i];
      rocket.y += rocket.vy;

      if (rocket.y <= rocket.explodeAt) {
        this.explode(rocket);
        this.rockets.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Apply gravity
      p.vy += 0.02;

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Fade
      p.life--;

      // Remove dead particles
      if (p.life <= 0 || p.y >= this.height || p.y < 0 || p.x < 0 || p.x >= this.width) {
        this.particles.splice(i, 1);
      }
    }
  }

  getParticles() {
    // Combine rockets and particles for rendering
    const all = [];

    // Add rocket trails
    for (const rocket of this.rockets) {
      all.push({
        x: rocket.x,
        y: rocket.y,
        char: '│',
        color: rocket.color,
      });
      // Trail
      all.push({
        x: rocket.x,
        y: rocket.y + 1,
        char: '·',
        color: colors.yellow,
      });
    }

    // Add explosion particles
    for (const p of this.particles) {
      all.push({
        x: p.x,
        y: p.y,
        char: p.char,
        color: p.color,
      });
    }

    return all;
  }
}
