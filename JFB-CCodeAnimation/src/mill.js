// Mill wheel - generates rotating platforms as coding progresses

export class MillWheel {
  constructor(width, height) {
    this.width = width - 2;
    this.height = height;
    this.platforms = [];
    this.patterns = [
      this.patternStaircase.bind(this),
      this.patternZigzag.bind(this),
      this.patternRandom.bind(this),
      this.patternAlternating.bind(this),
      this.patternCascade.bind(this),
    ];
    this.currentPattern = 0;
    this.platformSpeed = 0.05; // How fast platforms move down
  }

  addPlatform() {
    // Get next pattern
    const pattern = this.patterns[this.currentPattern % this.patterns.length];
    this.currentPattern++;

    // Generate new platforms from pattern
    const newPlatforms = pattern();
    this.platforms.push(...newPlatforms);
  }

  update() {
    // Move all platforms down slowly (mill rotation effect)
    for (const platform of this.platforms) {
      platform.y += this.platformSpeed;

      // Add slight wave motion
      platform.x += Math.sin(platform.y * 0.1 + platform.phase) * 0.02;

      // Keep platforms in bounds
      if (platform.x < 0) platform.x = 0;
      if (platform.x + platform.width > this.width) {
        platform.x = this.width - platform.width;
      }
    }

    // Remove platforms that have moved off screen
    this.platforms = this.platforms.filter(p => p.y < this.height);
  }

  getPlatforms() {
    return this.platforms;
  }

  // Pattern generators - each creates a unique platform layout

  patternStaircase() {
    const platforms = [];
    const steps = 3;
    for (let i = 0; i < steps; i++) {
      platforms.push({
        x: (this.width / steps) * i,
        y: 2 + i * 4,
        width: 6,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return platforms;
  }

  patternZigzag() {
    const platforms = [];
    for (let i = 0; i < 4; i++) {
      platforms.push({
        x: i % 2 === 0 ? 2 : this.width - 8,
        y: 1 + i * 3,
        width: 5,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return platforms;
  }

  patternRandom() {
    const platforms = [];
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      platforms.push({
        x: Math.random() * (this.width - 6),
        y: Math.random() * 8,
        width: 4 + Math.floor(Math.random() * 4),
        phase: Math.random() * Math.PI * 2,
      });
    }
    return platforms;
  }

  patternAlternating() {
    const platforms = [];
    for (let i = 0; i < 3; i++) {
      platforms.push({
        x: i % 2 === 0 ? 0 : this.width - 10,
        y: i * 5,
        width: 10,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return platforms;
  }

  patternCascade() {
    const platforms = [];
    for (let i = 0; i < 5; i++) {
      platforms.push({
        x: (this.width - 4) * (i / 4),
        y: i * 2,
        width: 4,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return platforms;
  }

  clear() {
    this.platforms = [];
  }
}
