#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENT_FILE = path.join(__dirname, '..', 'events.json');

// Get event type and data from command line args
const args = process.argv.slice(2);
const eventType = args[0];
const eventData = args[1] ? JSON.parse(args[1]) : {};

if (!eventType) {
  console.log('Usage: send-event.js <type> [data]');
  console.log('');
  console.log('Event types:');
  console.log('  prompt     - User submitted a prompt');
  console.log('  tool_start - Tool started (include: {"tool": "name"})');
  console.log('  tool_end   - Tool finished');
  console.log('  response   - Claude responded');
  console.log('  complete   - Session complete (triggers fireworks!)');
  console.log('  bounce     - Manual bounce trigger');
  console.log('');
  console.log('Examples:');
  console.log('  node send-event.js prompt');
  console.log('  node send-event.js tool_start \'{"tool": "Read"}\'');
  console.log('  node send-event.js complete');
  process.exit(1);
}

// Read current events
let data = { events: [] };
try {
  if (fs.existsSync(EVENT_FILE)) {
    data = JSON.parse(fs.readFileSync(EVENT_FILE, 'utf8'));
  }
} catch (e) {
  data = { events: [] };
}

// Add new event
const event = {
  type: eventType,
  timestamp: Date.now(),
  ...eventData,
};

data.events.push(event);

// Write back
fs.writeFileSync(EVENT_FILE, JSON.stringify(data, null, 2));

console.log(`Event sent: ${eventType}`);
