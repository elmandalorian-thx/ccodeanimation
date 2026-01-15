#!/usr/bin/env node

import { Animation } from './animation.js';
import { BallPhysics } from './ball.js';
import { MillWheel } from './mill.js';
import { Fireworks } from './fireworks.js';
import { Tracker } from './tracker.js';

const animation = new Animation();

// Handle graceful shutdown
process.on('SIGINT', () => {
  animation.stop();
  process.exit(0);
});

// Start the animation
animation.start();
