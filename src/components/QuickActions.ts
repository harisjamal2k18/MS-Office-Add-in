import { HostDetector } from '../office/hostDetector.ts';

export class QuickActionsComponent {
  private container: HTMLElement;
  private onSelectAction: (promptText: string, autoSend?: boolean) => void;

  constructor(container: HTMLElement, onSelectAction: (promptText: string, autoSend?: boolean) => void) {
    this.container = container;
    this.onSelectAction = onSelectAction;
    this.render();
  }

  render(): void {
    const host = HostDetector.getHost();
    let actions: { label: string; prompt: string; autoSend?: boolean }[] = [];

    if (host === 'Word') {
      actions = [
        { label: '✨ Rewrite Professionally', prompt: 'Rewrite the selected text to sound polished, authoritative, and professional while preserving all key facts.', autoSend: true },
        { label: '📝 Fix Grammar', prompt: 'Correct any grammatical, spelling, and punctuation errors in the selected text without altering the core tone.', autoSend: true },
        { label: '🔍 Summarize', prompt: 'Provide a concise, bulleted executive summary of the selected text.', autoSend: true },
        { label: '📊 Generate Table', prompt: 'Create a clean, well-formatted comparison table from this information.', autoSend: true },
        { label: '✉️ Draft Email', prompt: 'Draft a clear, professional email regarding this subject.' },
        { label: '🌐 Translate to Urdu', prompt: 'Translate the selected text into natural, professional Urdu.', autoSend: true }
      ];
    } else if (host === 'Excel') {
      actions = [
        { label: '📈 Explain Data', prompt: 'Explain the selected worksheet data, highlight key trends, and provide 3 actionable insights.', autoSend: true },
        { label: '🧮 Generate Formula', prompt: 'Write an Excel formula to solve this problem: ' },
        { label: '🔍 Find Outliers', prompt: 'Analyze this range and identify any data anomalies, duplicates, or unusual outliers.', autoSend: true },
        { label: '🏆 Top 5 Breakdown', prompt: 'Identify the top 5 records by value and summarize their contribution to the total.', autoSend: true },
        { label: '📊 Analyze Sales', prompt: 'Perform a comprehensive sales variance and trend analysis on these numbers.', autoSend: true }
      ];
    } else if (host === 'PowerPoint') {
      actions = [
        { label: '🎯 5-Slide Outline', prompt: 'Create a structured 5-slide presentation outline on: ' },
        { label: '🎤 Speaker Notes', prompt: 'Generate professional presenter speaker notes for this slide.', autoSend: true },
        { label: '✨ Improve Slide Content', prompt: 'Rewrite the slide text to be punchy, high-impact, and easy to read for an audience.', autoSend: true },
        { label: '💡 Generate Bullet Points', prompt: 'Convert this concept into 3 to 4 impactful presentation bullet points.', autoSend: true }
      ];
    } else {
      actions = [
        { label: '✨ Professional Rewrite', prompt: 'Rewrite this text professionally: ' },
        { label: '🔍 Summarize', prompt: 'Summarize the following: ' }
      ];
    }

    this.container.innerHTML = `
      <div class="quick-actions-bar">
        ${actions.map((a, i) => `<button class="chip-btn" data-index="${i}">${a.label}</button>`).join('')}
      </div>
    `;

    this.container.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).dataset.index || '0');
        const selected = actions[idx];
        this.onSelectAction(selected.prompt, selected.autoSend);
      });
    });
  }
}
