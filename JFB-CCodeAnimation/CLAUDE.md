# CCodeAnimation

A fun CLI companion that animates **live** while you code with Claude! Watch a bouncing ball navigate through platforms as you prompt, with fireworks celebrating task completion.

## Features

- **Live Tracking**: Hooks into your Claude Code session to animate in real-time
- **Super Bouncy Ball**: Enhanced physics with trails and particle effects
- **Moving Platforms**: Blocks drift sideways with wave patterns
- **Real-time Stats**: Tracks prompts, tokens, and tool usage
- **Celebration Fireworks**: Colorful explosions when you complete tasks

## Quick Start

### 1. Start the live animation (in a separate terminal)
```bash
cd "C:/GIT Folder/JFB-CCodeAnimation"
npm run live
```

### 2. The animation will react to your Claude Code session!
- Each prompt adds blocks
- Tool calls create particles
- Responses add more action

## Project Structure

```
src/
  live.js         # Live animation with event tracking
  send-event.js   # CLI to send events
  index.js        # Demo animation (standalone)
  animation.js    # Animation engine
  ball.js         # Ball physics
  mill.js         # Platform generator
  fireworks.js    # Celebration effects
  tracker.js      # Stats tracking

hooks/            # Hook scripts for Claude Code
.claude/          # Claude Code settings with hooks
```

## Commands

```bash
# Run live animation (tracks your session)
npm run live

# Run standalone demo
npm start

# Send manual events
npm run event prompt
npm run event tool_start '{"tool": "Read"}'
npm run event complete    # Triggers fireworks!
npm run event bounce      # Manual bounce
```

## How It Works

1. **Hooks**: Claude Code hooks call `send-event.js` on prompts/tools
2. **Event File**: Events are written to `events.json`
3. **Animation**: `live.js` reads events and updates the display
4. **Physics**: Ball bounces off moving platforms with particle effects

## Event Types

| Event | Trigger | Effect |
|-------|---------|--------|
| `prompt` | User submits prompt | Adds 3 blocks + cyan particles |
| `tool_start` | Tool begins | Adds 1 block |
| `tool_end` | Tool finishes | Green particles |
| `response` | Claude responds | Adds 2 blocks + yellow particles |
| `complete` | Task done | 🎆 Fireworks! |
| `bounce` | Manual | Extra bouncy ball |

## Configuration

Settings are in `.claude/settings.local.json`. Hooks automatically trigger on:
- `PreToolUse` - Before each tool runs
- `PostToolUse` - After each tool completes
- `UserPromptSubmit` - When you send a message

## Troubleshooting

**Animation not updating?**
- Make sure hooks are configured in `.claude/settings.local.json`
- Check that `events.json` is being written to
- Restart Claude Code to reload hooks

**Ball moves too fast/slow?**
- Adjust physics constants in `live.js`:
  - Gravity: `this.ball.vy += 0.12`
  - Bounce: `this.ball.vy * 1.1`
