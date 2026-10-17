import { ProviderRegistry } from '../services/providerRegistry.ts';
import { StorageService } from '../services/storageService.ts';

export class ModelSelectorComponent {
  private container: HTMLElement;
  private onChange: (providerId: string, modelId: string) => void;
  private currentProvider: string;
  private currentModel: string;

  constructor(
    container: HTMLElement,
    onChange: (providerId: string, modelId: string) => void
  ) {
    this.container = container;
    this.onChange = onChange;
    this.currentProvider = StorageService.getActiveProvider('gemini');
    this.currentModel = StorageService.getActiveModel('gemini-3.6-flash');
    this.render();
  }

  getCurrent(): { providerId: string; modelId: string } {
    return { providerId: this.currentProvider, modelId: this.currentModel };
  }

  updateCostDisplay(cost: number | null, tokens?: number): void {
    const costEl = this.container.querySelector('#costDisplay');
    if (!costEl) return;

    if (cost !== null && cost > 0) {
      costEl.textContent = `$${cost.toFixed(4)}`;
      costEl.setAttribute('title', `${tokens || 0} tokens estimated`);
    } else {
      const modelInfo = ProviderRegistry.getModelInfo(this.currentProvider, this.currentModel);
      costEl.textContent = modelInfo?.contextWindow ? `${Math.round(modelInfo.contextWindow / 1000)}k ctx` : 'Ready';
    }
  }

  render(): void {
    const providers = ProviderRegistry.getAllProviders();

    // If current provider is not in the active providers list (e.g. OpenAI was removed), fallback to first available
    if (!providers.some(p => p.id === this.currentProvider) && providers.length > 0) {
      this.currentProvider = providers[0].id;
      StorageService.setActiveProvider(this.currentProvider);
    }

    const models = ProviderRegistry.getModelsForProvider(this.currentProvider);

    // Verify current model exists in provider models, else select first
    if (!models.some(m => m.id === this.currentModel) && models.length > 0) {
      this.currentModel = models[0].id;
      StorageService.setActiveModel(this.currentModel);
    }

    const providerOptions = providers
      .map(p => `<option value="${p.id}" ${p.id === this.currentProvider ? 'selected' : ''}>${p.name}</option>`)
      .join('');

    const modelOptions = models
      .map(m => `<option value="${m.id}" ${m.id === this.currentModel ? 'selected' : ''}>${m.name}</option>`)
      .join('');

    const activeModelInfo = ProviderRegistry.getModelInfo(this.currentProvider, this.currentModel);
    const ctxText = activeModelInfo?.capabilities?.imageGeneration
      ? '🎨 Image Gen'
      : activeModelInfo?.contextWindow
      ? `${Math.round(activeModelInfo.contextWindow / 1000)}k ctx`
      : 'Ready';

    this.container.innerHTML = `
      <div class="model-toolbar">
        <div class="model-pickers">
          <select class="picker-select" id="providerSelect" title="Select AI Provider">
            ${providerOptions}
          </select>
          <select class="picker-select" id="modelSelect" title="Select Model">
            ${modelOptions}
          </select>
        </div>
        <div class="cost-pill" id="costDisplay" title="Model context window and session cost">${ctxText}</div>
      </div>
    `;

    const providerSelect = this.container.querySelector('#providerSelect') as HTMLSelectElement;
    const modelSelect = this.container.querySelector('#modelSelect') as HTMLSelectElement;

    providerSelect.addEventListener('change', () => {
      this.currentProvider = providerSelect.value;
      StorageService.setActiveProvider(this.currentProvider);
      
      const newModels = ProviderRegistry.getModelsForProvider(this.currentProvider);
      if (newModels.length > 0) {
        this.currentModel = newModels[0].id;
        StorageService.setActiveModel(this.currentModel);
      }

      this.render();
      this.onChange(this.currentProvider, this.currentModel);
    });

    modelSelect.addEventListener('change', () => {
      this.currentModel = modelSelect.value;
      StorageService.setActiveModel(this.currentModel);
      this.updateCostDisplay(null);
      this.onChange(this.currentProvider, this.currentModel);
    });
  }
}
