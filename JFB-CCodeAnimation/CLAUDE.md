# CCodeAnimation

A fun CLI companion that animates while you code with Claude. Watch a bouncing ball navigate through mill-like platforms, with fireworks celebrating task completion!

## Features

- **Bouncing Ball Physics**: A ball that perpetually falls through the animation panel
- **Mill Wheel Platforms**: Rotating platforms that appear as coding phases complete
- **Multiple Patterns**: Staircase, zigzag, cascade, and more platform patterns
- **Progress Tracking**: Real-time token count and phase completion display
- **Celebration Fireworks**: Colorful fireworks when coding is complete

## Project Structure

```
src/
  index.js        # CLI entry point
  animation.js    # Main animation engine and renderer
  ball.js         # Ball physics with gravity and collisions
  mill.js         # Mill wheel platform generator
  fireworks.js    # Celebration fireworks system
  tracker.js      # Phase and token tracking
```

## Commands

```bash
# Run the animation demo
npm start

# Install globally (optional)
npm link
ccode-anim
```

## How It Works

The animation runs in a split-screen layout:
- **Left panel**: Shows current phase, token count, and progress bar
- **Right panel**: Animated ball falling through mill-like platforms

As coding progresses:
1. New platforms appear with each phase
2. The ball bounces off platforms like a mill wheel
3. Platforms slowly descend and rotate
4. On completion, the ball falls and fireworks celebrate!

## Configuration

The animation is designed to be lightweight and run alongside Claude Code sessions. Adjust timing in `animation.js`:

- `frameInterval`: Animation speed (default: 66ms = ~15 FPS)
- `gravity`: Ball fall speed in `ball.js`
- `platformSpeed`: How fast platforms move in `mill.js`

## Integration Ideas

- Hook into Claude Code events to trigger phases
- Connect to actual token usage metrics
- Add custom celebration messages
