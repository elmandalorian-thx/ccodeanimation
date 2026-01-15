import { BallPhysics } from './ball.js';
import { MillWheel } from './mill.js';
import { Fireworks } from './fireworks.js';
import { Tracker } from './tracker.js';

// ANSI escape codes
const ESC = '\x1b';
const CLEAR = `${ESC}[2J`;
const HOME = `${ESC}[H`;
const HIDE_CURSOR = `${ESC}[?25l`;
const SHOW_CURSOR = `${ESC}[?25h`;
const BOLD = `${ESC}[1m`;
const RESET = `${ESC}[0m`;

// Colors
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

export class Animation {
  constructor() {
    this.width = process.stdout.columns || 80;
    this.height = process.stdout.rows || 24;
    this.animWidth = 30; // Width of animation panel on right
    this.running = false;
    this.frame = 0;
    this.ball = new BallPhysics(this.animWidth, this.height - 4);
    this.mill = new MillWheel(this.animWidth, this.height - 4);
    this.fireworks = new Fireworks(this.animWidth, this.height - 4);
    this.tracker = new Tracker();
    this.showingFireworks = false;
    this.frameInterval = null;
  }

  start() {
    this.running = true;
    process.stdout.write(HIDE_CURSOR);
    process.stdout.write(CLEAR);

    // Start animation loop at 15 FPS
    this.frameInterval = setInterval(() => this.render(), 66);

    // Simulate coding progress for demo
    this.simulateProgress();
  }

  stop() {
    this.running = false;
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
    }
    process.stdout.write(SHOW_CURSOR);
    process.stdout.write(CLEAR);
    process.stdout.write(HOME);
  }

  simulateProgress() {
    // Simulate phases of coding
    const phases = [
      { name: 'Reading files', tokens: 1500, duration: 3000 },
      { name: 'Analyzing code', tokens: 2000, duration: 4000 },
      { name: 'Planning changes', tokens: 800, duration: 2000 },
      { name: 'Writing code', tokens: 3500, duration: 5000 },
      { name: 'Testing', tokens: 1200, duration: 3000 },
    ];

    let delay = 0;
    phases.forEach((phase, index) => {
      setTimeout(() => {
        this.tracker.startPhase(phase.name);
        this.mill.addPlatform(); // Add new mill blade when phase starts
      }, delay);

      // Simulate token accumulation during phase
      const tokenInterval = phase.duration / 10;
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          this.tracker.addTokens(Math.floor(phase.tokens / 10));
        }, delay + tokenInterval * (i + 1));
      }

      setTimeout(() => {
        this.tracker.completePhase();
      }, delay + phase.duration);

      delay += phase.duration + 500;
    });

    // Show fireworks at the end
    setTimeout(() => {
      this.showingFireworks = true;
      this.fireworks.start();

      // End after fireworks
      setTimeout(() => {
        this.stop();
        console.log('\n✨ Coding session complete! ✨\n');
        console.log(this.tracker.getSummary());
        process.exit(0);
      }, 5000);
    }, delay + 1000);
  }

  render() {
    this.frame++;

    // Update physics
    const platforms = this.mill.getPlatforms();
    this.ball.update(platforms);
    this.mill.update();

    if (this.showingFireworks) {
      this.fireworks.update();
    }

    // Build the frame buffer
    const buffer = this.buildFrame();

    // Output
    process.stdout.write(HOME);
    process.stdout.write(buffer);
  }

  buildFrame() {
    const lines = [];

    // Get animation elements
    const ballPos = this.ball.getPosition();
    const platforms = this.mill.getPlatforms();
    const fireworkParticles = this.showingFireworks ? this.fireworks.getParticles() : [];
    const trackerStats = this.tracker.getStats();

    // Header
    lines.push(this.buildHeader(trackerStats));
    lines.push('');

    // Build animation area
    for (let y = 0; y < this.height - 6; y++) {
      let line = '';

      // Left side - stats panel
      if (y === 0) {
        line += `${colors.cyan}╭${'─'.repeat(this.width - this.animWidth - 4)}╮${RESET}`;
      } else if (y === this.height - 7) {
        line += `${colors.cyan}╰${'─'.repeat(this.width - this.animWidth - 4)}╯${RESET}`;
      } else if (y === 2) {
        const phase = trackerStats.currentPhase || 'Waiting...';
        line += `${colors.cyan}│${RESET} ${colors.yellow}Phase:${RESET} ${phase.padEnd(this.width - this.animWidth - 12)}${colors.cyan}│${RESET}`;
      } else if (y === 4) {
        const tokens = `${trackerStats.tokens.toLocaleString()} tokens`;
        line += `${colors.cyan}│${RESET} ${colors.green}Tokens:${RESET} ${tokens.padEnd(this.width - this.animWidth - 14)}${colors.cyan}│${RESET}`;
      } else if (y === 6) {
        const completed = `${trackerStats.completedPhases}/${trackerStats.totalPhases} phases`;
        line += `${colors.cyan}│${RESET} ${colors.magenta}Progress:${RESET} ${completed.padEnd(this.width - this.animWidth - 16)}${colors.cyan}│${RESET}`;
      } else if (y === 8) {
        const bar = this.buildProgressBar(trackerStats.completedPhases, trackerStats.totalPhases, this.width - this.animWidth - 10);
        line += `${colors.cyan}│${RESET} ${bar} ${colors.cyan}│${RESET}`;
      } else {
        line += `${colors.cyan}│${RESET}${' '.repeat(this.width - this.animWidth - 4)}${colors.cyan}│${RESET}`;
      }

      line += ' '; // Separator

      // Right side - animation
      line += `${colors.blue}│${RESET}`;

      for (let x = 0; x < this.animWidth - 2; x++) {
        let char = ' ';
        let color = RESET;

        // Check for ball
        if (Math.round(ballPos.x) === x && Math.round(ballPos.y) === y) {
          char = '●';
          color = colors.brightYellow;
        }
        // Check for platforms (mill blades)
        else if (this.isOnPlatform(x, y, platforms)) {
          char = '█';
          color = colors.cyan;
        }
        // Check for fireworks
        else if (this.showingFireworks) {
          const particle = fireworkParticles.find(p =>
            Math.round(p.x) === x && Math.round(p.y) === y
          );
          if (particle) {
            char = particle.char;
            color = particle.color;
          }
        }

        line += color + char + RESET;
      }

      line += `${colors.blue}│${RESET}`;
      lines.push(line);
    }

    // Footer
    lines.push('');
    lines.push(this.buildFooter());

    return lines.join('\n');
  }

  buildHeader(stats) {
    const title = ' 🤖 Claude Coding Companion ';
    const left = '═'.repeat(Math.floor((this.width - title.length) / 2));
    const right = '═'.repeat(Math.ceil((this.width - title.length) / 2));
    return `${colors.brightCyan}${left}${BOLD}${title}${RESET}${colors.brightCyan}${right}${RESET}`;
  }

  buildProgressBar(current, total, width) {
    const progress = total > 0 ? current / total : 0;
    const filled = Math.floor(progress * width);
    const empty = width - filled;
    const bar = `${colors.green}${'█'.repeat(filled)}${colors.white}${'░'.repeat(empty)}${RESET}`;
    return bar;
  }

  buildFooter() {
    const msg = this.showingFireworks ? '🎆 Task Complete! 🎆' : '⚡ Press Ctrl+C to exit ⚡';
    const padding = Math.floor((this.width - msg.length) / 2);
    return ' '.repeat(padding) + msg;
  }

  isOnPlatform(x, y, platforms) {
    for (const platform of platforms) {
      if (y === Math.round(platform.y) &&
          x >= platform.x &&
          x < platform.x + platform.width) {
        return true;
      }
    }
    return false;
  }
}
