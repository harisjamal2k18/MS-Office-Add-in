import { ProviderRegistry } from './services/providerRegistry.ts';
import { StorageService } from './services/storageService.ts';
import { HostDetector } from './office/hostDetector.ts';
import { HeaderComponent } from './components/Header.ts';
import { ModelSelectorComponent } from './components/ModelSelector.ts';
import { ContextBarComponent } from './components/ContextBar.ts';
import { QuickActionsComponent } from './components/QuickActions.ts';
import { ChatViewComponent } from './components/ChatView.ts';
import { PromptBoxComponent } from './components/PromptBox.ts';
import { SettingsModalComponent } from './components/SettingsModal.ts';
import { HistoryModalComponent } from './components/HistoryModal.ts';
import { ToastComponent } from './components/Toast.ts';
import { ChatService } from './services/chatService.ts';

declare const Office: any;

async function bootstrap() {
  console.log('[Office AI] Bootstrapping Add-in...');

  // Initialize Theme
  const settings = StorageService.getSettings();
  document.documentElement.setAttribute('data-theme', settings.theme || 'dark');

  // Initialize Providers
  ProviderRegistry.initialize();

  // Mount Containers
  const headerMount = document.getElementById('headerMount')!;
  const modelSelectorMount = document.getElementById('modelSelectorMount')!;
  const contextBarMount = document.getElementById('contextBarMount')!;
  const quickActionsMount = document.getElementById('quickActionsMount')!;
  const chatViewMount = document.getElementById('chatViewMount')!;
  const promptBoxMount = document.getElementById('promptBoxMount')!;
  const settingsMount = document.getElementById('settingsMount')!;
  const historyMount = document.getElementById('historyMount')!;

  // Forward references
  let promptBox: PromptBoxComponent;
  let modelSelector: ModelSelectorComponent;
  let contextBar: ContextBarComponent;
  let chatView: ChatViewComponent;
  let settingsModal: SettingsModalComponent;
  let historyModal: HistoryModalComponent;
  let chatService: ChatService;

  // Initialize ChatService
  let _streamingMsgId: string | null = null;
  chatService = new ChatService((session, isStreaming) => {
    const lastMsg = session.messages[session.messages.length - 1];

    if (isStreaming && lastMsg?.isStreaming) {
      if (_streamingMsgId !== lastMsg.id) {
        // New streaming session — do full render to paint the initial bubble
        _streamingMsgId = lastMsg.id;
        chatView?.render(session.messages, true);
      } else {
        // Subsequent chunks — patch only the streaming bubble (no jitter)
        chatView?.updateStreamingBubble(lastMsg.id, lastMsg.content);
      }
    } else {
      // Streaming finished or non-streaming update — full render to attach action buttons
      _streamingMsgId = null;
      chatView?.render(session.messages, isStreaming);
    }

    promptBox?.setGenerating(isStreaming);

    // Update cost display on last message
    if (lastMsg && lastMsg.cost !== undefined) {
      modelSelector?.updateCostDisplay(lastMsg.cost, lastMsg.tokens?.total);
    }
  });

  // Settings Modal
  settingsModal = new SettingsModalComponent(settingsMount, {
    onClose: () => {},
    onSaved: () => {
      modelSelector.render();
      ToastComponent.show('Settings saved');
    }
  });

  // History Modal
  historyModal = new HistoryModalComponent(historyMount, {
    onClose: () => {},
    onLoadSession: (session) => {
      chatService.loadSession(session);
      ToastComponent.show(`Loaded: ${session.title}`);
    }
  });

  // Header
  new HeaderComponent(headerMount, {
    onNewChat: () => {
      chatService.createNewSession();
      ToastComponent.show('New conversation started');
    },
    onOpenHistory: () => historyModal.open(),
    onOpenSettings: () => settingsModal.open()
  });

  // Model Selector
  modelSelector = new ModelSelectorComponent(modelSelectorMount, (providerId, modelId) => {
    const modelInfo = ProviderRegistry.getModelInfo(providerId, modelId);
    promptBox?.setVisionSupported(modelInfo?.capabilities.imageInput ?? true);
  });

  // Context Bar
  contextBar = new ContextBarComponent(contextBarMount);

  // Quick Action Chips
  new QuickActionsComponent(quickActionsMount, (promptText, autoSend) => {
    if (autoSend) {
      const { providerId, modelId } = modelSelector.getCurrent();
      const attachedCtx = contextBar.getAttachedContext();
      chatService.sendMessage(promptText, [], attachedCtx, providerId, modelId);
    } else {
      promptBox.setInput(promptText);
    }
  });

  // Chat View
  chatView = new ChatViewComponent(chatViewMount, {
    onRegenerate: (msgId) => {
      const { providerId, modelId } = modelSelector.getCurrent();
      chatService.regenerate(msgId, providerId, modelId);
    },
    onShowToast: (msg) => ToastComponent.show(msg)
  });

  // Prompt Box
  promptBox = new PromptBoxComponent(promptBoxMount, {
    onSend: (text, images) => {
      const { providerId, modelId } = modelSelector.getCurrent();
      const attachedCtx = contextBar.getAttachedContext();
      chatService.sendMessage(text, images, attachedCtx, providerId, modelId);
    },
    onStop: () => {
      chatService.stopGeneration();
    }
  });

  // Initial Vision Capability Check
  const initialCurrent = modelSelector.getCurrent();
  const initialModelInfo = ProviderRegistry.getModelInfo(initialCurrent.providerId, initialCurrent.modelId);
  promptBox.setVisionSupported(initialModelInfo?.capabilities.imageInput ?? true);

  // Initial render of chat view
  chatView.render(chatService.getCurrentSession().messages);

  // Auto-refresh context when user focuses or changes selection
  window.addEventListener('focus', () => {
    contextBar.refresh();
  });
}

// Office.js bootstrap
if (typeof Office !== 'undefined') {
  Office.onReady(() => {
    bootstrap();
  });
} else {
  // Standalone browser mode fallback
  document.addEventListener('DOMContentLoaded', () => {
    bootstrap();
  });
}
