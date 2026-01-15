// Tracker - keeps track of coding phases and token usage

export class Tracker {
  constructor() {
    this.tokens = 0;
    this.phases = [];
    this.currentPhase = null;
    this.startTime = Date.now();
    this.totalPhases = 5; // Expected number of phases
  }

  startPhase(name) {
    if (this.currentPhase) {
      this.completePhase();
    }

    this.currentPhase = {
      name,
      startTime: Date.now(),
      tokens: 0,
    };
  }

  completePhase() {
    if (this.currentPhase) {
      this.currentPhase.endTime = Date.now();
      this.currentPhase.duration = this.currentPhase.endTime - this.currentPhase.startTime;
      this.phases.push(this.currentPhase);
      this.currentPhase = null;
    }
  }

  addTokens(count) {
    this.tokens += count;
    if (this.currentPhase) {
      this.currentPhase.tokens += count;
    }
  }

  getStats() {
    return {
      tokens: this.tokens,
      currentPhase: this.currentPhase?.name || null,
      completedPhases: this.phases.length,
      totalPhases: this.totalPhases,
      phases: this.phases,
      elapsedTime: Date.now() - this.startTime,
    };
  }

  getSummary() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const lines = [
      '┌─────────────────────────────────┐',
      '│      Session Summary            │',
      '├─────────────────────────────────┤',
      `│ Total Tokens: ${this.tokens.toLocaleString().padEnd(17)}│`,
      `│ Phases Completed: ${this.phases.length.toString().padEnd(14)}│`,
      `│ Duration: ${elapsed}s`.padEnd(34) + '│',
      '├─────────────────────────────────┤',
    ];

    for (const phase of this.phases) {
      const duration = ((phase.duration || 0) / 1000).toFixed(1);
      const line = `│ ✓ ${phase.name}`.padEnd(34) + '│';
      lines.push(line);
    }

    lines.push('└─────────────────────────────────┘');
    return lines.join('\n');
  }
}
