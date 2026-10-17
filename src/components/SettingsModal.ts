import { StorageService } from '../services/storageService.ts';
import { ProviderRegistry } from '../services/providerRegistry.ts';
import { ToastComponent } from './Toast.ts';

export class SettingsModalComponent {
  private container: HTMLElement;
  private isOpen = false;
  private onClose: () => void;
  private onSaved: () => void;

  constructor(container: HTMLElement, callbacks: { onClose: () => void; onSaved: () => void }) {
    this.container = container;
    this.onClose = callbacks.onClose;
    this.onSaved = callbacks.onSaved;
  }

  open(): void {
    this.isOpen = true;
    this.render();
  }

  close(): void {
    this.isOpen = false;
    this.render();
    this.onClose();
  }

  render(): void {
    const keys = StorageService.getApiKeys();
    const settings = StorageService.getSettings();

    this.container.innerHTML = `
      <div class="modal-overlay ${this.isOpen ? 'open' : ''}" id="settingsOverlay">
        <div class="modal-drawer">
          <div class="modal-header">
            <span class="modal-title">Settings & AI Providers</span>
            <button class="icon-btn" id="closeSettingsBtn" title="Close">✕</button>
          </div>
          <div class="modal-body">
            <!-- Provider API Keys Section -->
            <div class="modal-section">
              <span class="modal-section-title">AI Provider Credentials</span>
              

              <!-- Google Gemini -->
              <div class="provider-card">
                <div class="provider-card-header">
                  <span class="provider-name">Google Gemini</span>
                  <div class="test-status" id="status-gemini"></div>
                </div>
                <div class="form-group">
                  <input type="password" class="form-input" id="key-gemini" placeholder="AIzaSy..." value="${keys['gemini'] || 'AIzaSyCNxCH18ujqzuYU-clbV4qP7KP8G-1zqKc'}" />
                </div>
                <div class="btn-row">
                  <button class="btn-secondary test-btn" data-provider="gemini">Test Connection</button>
                </div>
              </div>

              <!-- NVIDIA NIM -->
              <div class="provider-card">
                <div class="provider-card-header">
                  <span class="provider-name">NVIDIA NIM</span>
                  <div class="test-status" id="status-nvidia"></div>
                </div>
                <div class="form-group">
                  <input type="password" class="form-input" id="key-nvidia"
                    placeholder="nvapi-..."
                    value="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"
                    title="Pre-configured NVIDIA NIM key — no changes needed" />
                </div>
                <div class="btn-row">
                  <button class="btn-secondary test-btn" data-provider="nvidia">Test Connection</button>
                </div>
              </div>

              <!-- OpenRouter -->
              <div class="provider-card">
                <div class="provider-card-header">
                  <span class="provider-name">OpenRouter</span>
                  <div class="test-status" id="status-openrouter"></div>
                </div>
                <div class="form-group">
                  <input type="password" class="form-input" id="key-openrouter" placeholder="sk-or-..." value="${keys['openrouter'] || ''}" />
                </div>
                <div class="btn-row">
                  <button class="btn-secondary test-btn" data-provider="openrouter">Test Connection</button>
                </div>
              </div>

              <!-- Pollinations.ai (Images) -->
              <div class="provider-card">
                <div class="provider-card-header">
                  <span class="provider-name">Pollinations.ai (Images)</span>
                  <div class="test-status" id="status-pollinations"></div>
                </div>
                <div class="form-group">
                  <input type="password" class="form-input" id="key-pollinations"
                    placeholder="sk_..."
                    value="${keys['pollinations'] || 'sk_BxKRwDPsUUbNK4UcQgUhBoGojw3fAyzw'}"
                    title="Stored securely on server via .env" />
                </div>
                <div class="btn-row">
                  <button class="btn-secondary test-btn" data-provider="pollinations">Test Connection</button>
                </div>
              </div>

              <!-- Custom / Local -->
              <div class="provider-card">
                <div class="provider-card-header">
                  <span class="provider-name">Custom / Local LLM</span>
                  <div class="test-status" id="status-custom"></div>
                </div>
                <div class="form-group">
                  <label class="form-label">Base URL (Ollama, vLLM, etc.)</label>
                  <input type="text" class="form-input" id="custom-base-url" placeholder="http://localhost:11434/v1" value="${settings.customBaseUrl || 'http://localhost:11434/v1'}" />
                </div>
                <div class="form-group">
                  <label class="form-label">API Key (Optional)</label>
                  <input type="password" class="form-input" id="key-custom" placeholder="Optional" value="${keys['custom'] || ''}" />
                </div>
                <div class="btn-row">
                  <button class="btn-secondary test-btn" data-provider="custom">Test Connection</button>
                </div>
              </div>
            </div>

            <!-- Custom Model Adder -->
            <div class="modal-section">
              <span class="modal-section-title">Add Custom Model</span>
              <div class="provider-card">
                <div class="form-group">
                  <label class="form-label">Model Identifier (e.g. meta-llama/llama-3.3-70b-instruct)</label>
                  <input type="text" class="form-input" id="customModelId" placeholder="provider/model-name" />
                </div>
                <div class="form-group">
                  <label class="form-label">Display Name</label>
                  <input type="text" class="form-input" id="customModelName" placeholder="My Custom Model" />
                </div>
                <div class="form-group">
                  <label class="form-label">Target Provider</label>
                  <select class="form-input" id="customModelProvider">
                    <option value="openrouter">OpenRouter</option>
                    <option value="custom">Custom / Local</option>
                    <option value="openai">OpenAI</option>
                  </select>
                </div>
                <button class="btn-secondary" id="addModelBtn">+ Add Model</button>
              </div>
            </div>

            <!-- Parameters & System Prompt -->
            <div class="modal-section">
              <span class="modal-section-title">Model Parameters</span>
              <div class="form-group">
                <label class="form-label">Temperature: <span id="tempVal">${settings.temperature}</span></label>
                <input type="range" min="0" max="1" step="0.05" value="${settings.temperature}" id="tempSlider" />
              </div>
              <div class="form-group">
                <label class="form-label">System Prompt</label>
                <textarea class="form-input form-textarea" id="systemPrompt">${settings.systemPrompt}</textarea>
              </div>
            </div>

            <!-- Theme & Appearance -->
            <div class="modal-section">
              <span class="modal-section-title">Theme</span>
              <div class="form-group">
                <select class="form-input" id="themeSelect">
                  <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark Mode</option>
                  <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light Mode</option>
                </select>
              </div>
            </div>

            <!-- Save Action -->
            <div style="margin-top: 10px;">
              <button class="btn-primary" id="saveSettingsBtn" style="width: 100%;">Save Settings</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const overlay = this.container.querySelector('#settingsOverlay');
    const closeBtn = this.container.querySelector('#closeSettingsBtn');
    const saveBtn = this.container.querySelector('#saveSettingsBtn');
    const tempSlider = this.container.querySelector('#tempSlider') as HTMLInputElement;
    const tempVal = this.container.querySelector('#tempVal');
    const addModelBtn = this.container.querySelector('#addModelBtn');

    closeBtn?.addEventListener('click', () => this.close());
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    tempSlider?.addEventListener('input', () => {
      if (tempVal) tempVal.textContent = tempSlider.value;
    });

    // Test Connection buttons
    this.container.querySelectorAll('.test-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const provider = (e.currentTarget as HTMLElement).dataset.provider || '';
        const statusEl = this.container.querySelector(`#status-${provider}`) as HTMLElement;
        const keyInput = this.container.querySelector(`#key-${provider}`) as HTMLInputElement;
        const baseUrlInput = this.container.querySelector('#custom-base-url') as HTMLInputElement;

        const apiKey = keyInput?.value?.trim() || '';
        
        // Client-side validation: API key is required for most providers
        const providersRequiringKey = ['openai', 'gemini', 'openrouter'];
        if (providersRequiringKey.includes(provider) && !apiKey) {
          if (statusEl) {
            statusEl.textContent = '✗ Please enter an API key first';
            statusEl.className = 'test-status error';
          }
          return;
        }

        if (statusEl) {
          statusEl.textContent = 'Testing...';
          statusEl.className = 'test-status';
        }

        const pInstance = ProviderRegistry.getProvider(provider);
        if (!pInstance) return;

        const res = await pInstance.validateApiKey(apiKey, baseUrlInput?.value);
        if (statusEl) {
          if (res.valid) {
            statusEl.textContent = '✓ Connected';
            statusEl.className = 'test-status success';
          } else {
            statusEl.textContent = `✗ ${res.message || 'Failed'}`;
            statusEl.className = 'test-status error';
          }
        }
      });
    });

    // Add Custom Model
    addModelBtn?.addEventListener('click', () => {
      const idInput = this.container.querySelector('#customModelId') as HTMLInputElement;
      const nameInput = this.container.querySelector('#customModelName') as HTMLInputElement;
      const providerSelect = this.container.querySelector('#customModelProvider') as HTMLSelectElement;

      if (!idInput.value.trim()) return;

      StorageService.saveCustomModel({
        id: idInput.value.trim(),
        name: nameInput.value.trim() || idInput.value.trim(),
        capabilities: {
          textGeneration: true,
          imageInput: false,
          imageGeneration: false,
          streaming: true,
          functionCalling: false,
          structuredOutput: true
        },
        ...({ providerId: providerSelect.value } as any)
      });

      ToastComponent.show(`Custom model "${idInput.value}" added!`, 'success');
      idInput.value = '';
      nameInput.value = '';
      this.onSaved();
    });

    // Save All Settings
    saveBtn?.addEventListener('click', () => {

      const geminiKey = (this.container.querySelector('#key-gemini') as HTMLInputElement)?.value.trim();
      const nvidiaKey = (this.container.querySelector('#key-nvidia') as HTMLInputElement)?.value.trim();
      const openrouterKey = (this.container.querySelector('#key-openrouter') as HTMLInputElement)?.value.trim();
      const pollinationsKey = (this.container.querySelector('#key-pollinations') as HTMLInputElement)?.value.trim();
      const customKey = (this.container.querySelector('#key-custom') as HTMLInputElement)?.value.trim();
      const customBaseUrl = (this.container.querySelector('#custom-base-url') as HTMLInputElement)?.value.trim();
      const systemPrompt = (this.container.querySelector('#systemPrompt') as HTMLTextAreaElement)?.value;
      const theme = (this.container.querySelector('#themeSelect') as HTMLSelectElement)?.value as 'dark' | 'light';
      const temperature = parseFloat(tempSlider?.value || '0.7');


      if (geminiKey) StorageService.setApiKey('gemini', geminiKey);
      if (nvidiaKey) StorageService.setApiKey('nvidia', nvidiaKey);
      if (openrouterKey) StorageService.setApiKey('openrouter', openrouterKey);
      if (pollinationsKey) StorageService.setApiKey('pollinations', pollinationsKey);
      if (customKey) StorageService.setApiKey('custom', customKey);

      StorageService.saveSettings({
        systemPrompt,
        temperature,
        theme,
        customBaseUrl
      });

      // Apply theme to document
      document.documentElement.setAttribute('data-theme', theme);

      this.close();
      this.onSaved();
    });
  }
}
