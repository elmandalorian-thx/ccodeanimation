#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENT_FILE = path.join(__dirname, '..', 'events.json');
const STATE_FILE = path.join(__dirname, '..', 'state.json');

// ANSI escape codes
const ESC = '\x1b';
const CLEAR = `${ESC}[2J`;
const HOME = `${ESC}[H`;
const HIDE_CURSOR = `${ESC}[?25l`;
const SHOW_CURSOR = `${ESC}[?25h`;
const BOLD = `${ESC}[1m`;
const RESET = `${ESC}[0m`;

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
  gray: `${ESC}[90m`,
};

class LiveAnimation {
  constructor() {
    this.width = Math.min(process.stdout.columns || 120, 120);
    this.height = Math.min(process.stdout.rows || 30, 30);
    this.animWidth = 40;
    this.animHeight = this.height - 6;

    // Ball with enhanced physics
    this.ball = {
      x: this.animWidth / 2,
      y: 0,
      vx: 0.5,
      vy: 0,
      trail: [], // Trail effect
    };

    // Blocks that move sideways
    this.blocks = [];

    // Particles for effects
    this.particles = [];

    // Fireworks
    this.fireworks = [];
    this.rockets = [];

    // Tracking stats
    this.stats = {
      prompts: 0,
      tokens: 0,
      tools: [],
      currentTool: null,
      lastEvent: null,
      sessionStart: Date.now(),
    };

    this.running = false;
    this.lastEventCheck = 0;
    this.celebrating = false;
  }

  start() {
    this.running = true;

    // Initialize event file
    this.initEventFile();

    process.stdout.write(HIDE_CURSOR);
    process.stdout.write(CLEAR);

    // Main loop at 20 FPS
    this.loop = setInterval(() => this.update(), 50);

    // Check for events every 100ms
    this.eventLoop = setInterval(() => this.checkEvents(), 100);

    console.log('🎮 Live animation started! Waiting for Claude Code events...\n');
  }

  stop() {
    this.running = false;
    clearInterval(this.loop);
    clearInterval(this.eventLoop);
    process.stdout.write(SHOW_CURSOR);
    process.stdout.write(CLEAR + HOME);
  }

  initEventFile() {
    // Create empty event file if it doesn't exist
    if (!fs.existsSync(EVENT_FILE)) {
      fs.writeFileSync(EVENT_FILE, JSON.stringify({ events: [] }));
    }
    // Save initial state
    this.saveState();
  }

  saveState() {
    fs.writeFileSync(STATE_FILE, JSON.stringify({
      stats: this.stats,
      running: this.running,
    }));
  }

  checkEvents() {
    try {
      if (!fs.existsSync(EVENT_FILE)) return;

      const data = JSON.parse(fs.readFileSync(EVENT_FILE, 'utf8'));
      const events = data.events || [];

      // Process new events
      for (const event of events) {
        this.handleEvent(event);
      }

      // Clear processed events
      if (events.length > 0) {
        fs.writeFileSync(EVENT_FILE, JSON.stringify({ events: [] }));
        this.saveState();
      }
    } catch (e) {
      // Ignore parse errors during file updates
    }
  }

  handleEvent(event) {
    this.stats.lastEvent = event;

    switch (event.type) {
      case 'prompt':
        this.stats.prompts++;
        this.stats.tokens += event.tokens || 100;
        this.addBlocks(3); // Add blocks on prompt
        this.spawnParticles(this.ball.x, this.ball.y, colors.brightCyan, 5);
        break;

      case 'tool_start':
        this.stats.currentTool = event.tool;
        this.stats.tools.push(event.tool);
        this.addBlocks(1);
        break;

      case 'tool_end':
        this.stats.tokens += event.tokens || 50;
        this.stats.currentTool = null;
        this.spawnParticles(this.ball.x, this.ball.y, colors.brightGreen, 3);
        break;

      case 'response':
        this.stats.tokens += event.tokens || 200;
        this.addBlocks(2);
        this.spawnParticles(this.ball.x, this.ball.y, colors.brightYellow, 8);
        break;

      case 'complete':
        this.celebrating = true;
        this.launchFireworks();
        break;

      case 'bounce':
        // Manual bounce trigger
        this.ball.vy = -2;
        this.spawnParticles(this.ball.x, this.ball.y, colors.brightMagenta, 10);
        break;
    }
  }

  addBlocks(count) {
    const patterns = ['wave', 'zigzag', 'scatter', 'stair'];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    for (let i = 0; i < count; i++) {
      let x, width, vx;

      switch (pattern) {
        case 'wave':
          x = (this.animWidth / 2) + Math.sin(i * 0.5) * 10;
          width = 5 + Math.random() * 5;
          vx = Math.sin(Date.now() * 0.001 + i) * 0.3;
          break;
        case 'zigzag':
          x = i % 2 === 0 ? 2 : this.animWidth - 12;
          width = 8;
          vx = i % 2 === 0 ? 0.2 : -0.2;
          break;
        case 'scatter':
          x = Math.random() * (this.animWidth - 10);
          width = 4 + Math.random() * 6;
          vx = (Math.random() - 0.5) * 0.4;
          break;
        case 'stair':
          x = (i / count) * (this.animWidth - 8);
          width = 6;
          vx = 0.1;
          break;
      }

      this.blocks.push({
        x,
        y: -2 - i * 3,
        width,
        vx,
        vy: 0.15 + Math.random() * 0.1, // Fall speed
        phase: Math.random() * Math.PI * 2,
        color: [colors.cyan, colors.blue, colors.magenta, colors.green][Math.floor(Math.random() * 4)],
      });
    }
  }

  spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * (0.5 + Math.random() * 0.5),
        vy: Math.sin(angle) * (0.5 + Math.random() * 0.5),
        life: 15 + Math.random() * 10,
        color,
        char: ['✦', '✧', '*', '·', '+'][Math.floor(Math.random() * 5)],
      });
    }
  }

  launchFireworks() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.rockets.push({
          x: Math.random() * this.animWidth,
          y: this.animHeight,
          vy: -1.2 - Math.random() * 0.5,
          color: [colors.brightRed, colors.brightYellow, colors.brightCyan, colors.brightMagenta][Math.floor(Math.random() * 4)],
        });
      }, i * 400);
    }
  }

  update() {
    // Update ball physics - MORE BOUNCY!
    this.ball.vy += 0.12; // Gravity

    // Add slight horizontal wobble
    this.ball.vx += Math.sin(Date.now() * 0.005) * 0.02;

    // Update position
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    // Trail effect
    this.ball.trail.unshift({ x: this.ball.x, y: this.ball.y });
    if (this.ball.trail.length > 5) this.ball.trail.pop();

    // Wall bounces with extra bounce
    if (this.ball.x <= 0) {
      this.ball.x = 0;
      this.ball.vx = Math.abs(this.ball.vx) * 0.9;
      this.spawnParticles(0, this.ball.y, colors.brightBlue, 3);
    } else if (this.ball.x >= this.animWidth - 3) {
      this.ball.x = this.animWidth - 3;
      this.ball.vx = -Math.abs(this.ball.vx) * 0.9;
      this.spawnParticles(this.animWidth - 3, this.ball.y, colors.brightBlue, 3);
    }

    // Block collisions - SUPER BOUNCY
    for (const block of this.blocks) {
      if (this.ball.vy > 0 &&
          this.ball.y >= block.y - 1 &&
          this.ball.y <= block.y + 1 &&
          this.ball.x >= block.x - 1 &&
          this.ball.x <= block.x + block.width + 1) {

        this.ball.y = block.y - 1;
        this.ball.vy = -Math.abs(this.ball.vy) * 1.1; // Extra bouncy!
        this.ball.vy = Math.max(this.ball.vy, -2.5); // Cap upward velocity

        // Transfer some block momentum
        this.ball.vx += block.vx * 0.5;

        // Particles on bounce
        this.spawnParticles(this.ball.x, this.ball.y, block.color, 4);
      }
    }

    // Wrap ball vertically
    if (this.ball.y >= this.animHeight) {
      this.ball.y = 0;
      this.ball.vy = 0.5;
      this.ball.vx = (Math.random() - 0.5) * 0.8;
    }
    if (this.ball.y < 0) {
      this.ball.y = 0;
      this.ball.vy = Math.abs(this.ball.vy) * 0.7;
    }

    // Update blocks - move sideways!
    for (let i = this.blocks.length - 1; i >= 0; i--) {
      const block = this.blocks[i];

      // Move down
      block.y += block.vy;

      // Move sideways with oscillation
      block.x += block.vx + Math.sin(block.y * 0.2 + block.phase) * 0.15;

      // Bounce off walls
      if (block.x <= 0) {
        block.x = 0;
        block.vx = Math.abs(block.vx);
      } else if (block.x + block.width >= this.animWidth - 2) {
        block.x = this.animWidth - 2 - block.width;
        block.vx = -Math.abs(block.vx);
      }

      // Remove blocks that fell off
      if (block.y > this.animHeight) {
        this.blocks.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // Particle gravity
      p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Update rockets/fireworks
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.y += r.vy;
      if (r.y <= this.animHeight * 0.3) {
        // Explode!
        this.spawnParticles(r.x, r.y, r.color, 20);
        this.rockets.splice(i, 1);
      }
    }

    // Render
    this.render();
  }

  render() {
    let output = HOME;

    // Header
    const title = ' 🎮 Claude Code Live Companion ';
    const elapsed = Math.floor((Date.now() - this.stats.sessionStart) / 1000);
    const timeStr = `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`;
    output += `${colors.brightCyan}${'═'.repeat(10)}${BOLD}${title}${RESET}${colors.brightCyan}${'═'.repeat(10)}${RESET} ${colors.gray}${timeStr}${RESET}\n\n`;

    // Build frame buffer
    const buffer = Array(this.animHeight).fill(null).map(() => Array(this.width).fill(' '));
    const colorBuffer = Array(this.animHeight).fill(null).map(() => Array(this.width).fill(RESET));

    // Draw stats panel (left side)
    const statsWidth = this.width - this.animWidth - 4;
    for (let y = 0; y < this.animHeight; y++) {
      // Border
      buffer[y][0] = '│';
      colorBuffer[y][0] = colors.cyan;
      buffer[y][statsWidth + 1] = '│';
      colorBuffer[y][statsWidth + 1] = colors.cyan;
    }

    // Stats content
    const writeText = (y, text, color = RESET) => {
      for (let i = 0; i < Math.min(text.length, statsWidth); i++) {
        buffer[y][2 + i] = text[i];
        colorBuffer[y][2 + i] = color;
      }
    };

    writeText(1, `Prompts: ${this.stats.prompts}`, colors.yellow);
    writeText(3, `Tokens: ${this.stats.tokens.toLocaleString()}`, colors.green);
    writeText(5, `Tools: ${this.stats.tools.length}`, colors.magenta);

    if (this.stats.currentTool) {
      writeText(7, `Active: ${this.stats.currentTool}`, colors.brightCyan);
    }

    // Progress bar
    const progress = Math.min(this.stats.tokens / 10000, 1);
    const barWidth = statsWidth - 4;
    const filled = Math.floor(progress * barWidth);
    for (let i = 0; i < barWidth; i++) {
      buffer[9][2 + i] = i < filled ? '█' : '░';
      colorBuffer[9][2 + i] = i < filled ? colors.green : colors.gray;
    }

    // Recent tools
    writeText(11, 'Recent:', colors.gray);
    const recentTools = this.stats.tools.slice(-5);
    for (let i = 0; i < recentTools.length; i++) {
      const tool = recentTools[i].substring(0, 15);
      writeText(12 + i, `  ${tool}`, colors.cyan);
    }

    // Animation panel (right side)
    const animStart = statsWidth + 3;

    // Draw blocks
    for (const block of this.blocks) {
      const by = Math.round(block.y);
      const bx = Math.round(block.x);
      if (by >= 0 && by < this.animHeight) {
        for (let i = 0; i < block.width; i++) {
          const x = animStart + bx + i;
          if (x >= animStart && x < this.width - 1) {
            buffer[by][x] = '█';
            colorBuffer[by][x] = block.color;
          }
        }
      }
    }

    // Draw ball trail
    for (let i = 1; i < this.ball.trail.length; i++) {
      const t = this.ball.trail[i];
      const tx = Math.round(t.x);
      const ty = Math.round(t.y);
      if (ty >= 0 && ty < this.animHeight) {
        const x = animStart + tx;
        if (x >= animStart && x < this.width - 1) {
          buffer[ty][x] = '○';
          colorBuffer[ty][x] = colors.yellow;
        }
      }
    }

    // Draw ball
    const bx = Math.round(this.ball.x);
    const by = Math.round(this.ball.y);
    if (by >= 0 && by < this.animHeight) {
      const x = animStart + bx;
      if (x >= animStart && x < this.width - 1) {
        buffer[by][x] = '●';
        colorBuffer[by][x] = colors.brightYellow;
      }
    }

    // Draw particles
    for (const p of this.particles) {
      const px = Math.round(p.x);
      const py = Math.round(p.y);
      if (py >= 0 && py < this.animHeight) {
        const x = animStart + px;
        if (x >= animStart && x < this.width - 1) {
          buffer[py][x] = p.char;
          colorBuffer[py][x] = p.color;
        }
      }
    }

    // Draw rockets
    for (const r of this.rockets) {
      const rx = Math.round(r.x);
      const ry = Math.round(r.y);
      if (ry >= 0 && ry < this.animHeight) {
        const x = animStart + rx;
        if (x >= animStart && x < this.width - 1) {
          buffer[ry][x] = '│';
          colorBuffer[ry][x] = r.color;
          if (ry + 1 < this.animHeight) {
            buffer[ry + 1][x] = '·';
            colorBuffer[ry + 1][x] = colors.yellow;
          }
        }
      }
    }

    // Animation border
    for (let y = 0; y < this.animHeight; y++) {
      buffer[y][animStart - 1] = '│';
      colorBuffer[y][animStart - 1] = colors.blue;
      buffer[y][this.width - 1] = '│';
      colorBuffer[y][this.width - 1] = colors.blue;
    }

    // Render buffer
    for (let y = 0; y < this.animHeight; y++) {
      let line = '';
      let currentColor = RESET;
      for (let x = 0; x < this.width; x++) {
        if (colorBuffer[y][x] !== currentColor) {
          currentColor = colorBuffer[y][x];
          line += currentColor;
        }
        line += buffer[y][x];
      }
      output += line + RESET + '\n';
    }

    // Footer
    output += `\n${colors.gray}  Ctrl+C to exit | Events: ${EVENT_FILE}${RESET}`;

    process.stdout.write(output);
  }
}

// Handle shutdown
const animation = new LiveAnimation();

process.on('SIGINT', () => {
  animation.stop();
  console.log('\n\n✨ Session ended!\n');
  console.log(`  Prompts: ${animation.stats.prompts}`);
  console.log(`  Tokens: ${animation.stats.tokens.toLocaleString()}`);
  console.log(`  Tools used: ${animation.stats.tools.length}`);
  process.exit(0);
});

animation.start();
