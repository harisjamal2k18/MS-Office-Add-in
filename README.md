# Office AI Copilot - Unified Microsoft Office AI Add-in

A production-ready Microsoft Office Add-in that operates seamlessly inside **Microsoft Word**, **Microsoft Excel**, and **Microsoft PowerPoint**. It connects directly to multiple frontier AI providers (**OpenAI**, **Google Gemini**, **Anthropic Claude**, **OpenRouter**, and **Local LLMs via Ollama/vLLM**) through a unified, modern interface.

---

## 🚀 Key Features

### 1. Multi-Host Office Integration
- **Microsoft Word**: Read selected text or full document body. One-click actions to *Rewrite Professionally*, *Fix Grammar*, *Summarize*, *Generate Comparison Tables*, and *Replace Selection*.
- **Microsoft Excel**: Live inspection of selected cells (values, formulas, coordinates). Analyzes tabular trends, extracts outliers, and generates tested Excel formulas with a 1-click **"Insert Formula"** action targeting active cells.
- **Microsoft PowerPoint**: Inspects slide content and speaker notes. Generates multi-slide presentation outlines, creates new slides directly using `PowerPoint.run`, and creates presenter speaker notes.

### 2. Multi-Provider & Dynamic Model Architecture
- **OpenAI**: GPT-4o, GPT-4o Mini, o1, o3-mini, and DALL-E 3 image generation.
- **Google Gemini**: Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 2.0 Flash, and Imagen 3.
- **Anthropic Claude**: Claude 3.7 Sonnet (with hybrid reasoning), Claude 3.5 Sonnet, Claude 3.5 Haiku.
- **OpenRouter**: DeepSeek R1, Meta Llama 3.3 70B, Qwen 2.5, Mistral Large.
- **Custom / Local**: Connect to local Ollama (`http://localhost:11434/v1`), vLLM, or any OpenAI-compatible server.
- **Custom Model Support**: Dynamically add any newly released model identifier in the UI without modifying code.

### 3. Real-Time Streaming & Visual Multimodal UX
- Fast Server-Sent Events (SSE) streaming responses with animated cursor.
- Markdown renderer with formatted headers, lists, code blocks with 1-click copy, and responsive tables.
- Multimodal Vision: Drag & drop or upload screenshots/images for chart analysis, document transcription, and diagram explanations.
- Automatic capability detection: UI dynamically disables vision or image generation controls if the active model does not support them.
- Live cost & token tracking based on current provider pricing matrices.

---

## 📁 Project Architecture

```
├── genai-manifest.xml           # Office Add-in XML Manifest for Word, Excel, PowerPoint
├── package.json                 # Dependencies and build scripts
├── vite.config.ts               # Vite configuration with HTTPS and proxy support
├── tsconfig.json                # Strict TypeScript configuration
├── server/                      # Secure Node.js/Express Proxy
│   ├── index.ts                 # Express proxy server (SSE streaming, CORS, validation)
│   └── utils/costEstimator.ts   # Pricing and token calculator
├── src/
│   ├── main.ts                  # Office.onReady bootstrap and component wiring
│   ├── office/                  # Office Host Interop
│   │   ├── hostDetector.ts      # Detects Word, Excel, PowerPoint, or Standalone Preview
│   │   ├── contextManager.ts    # Extracts selected text, cell ranges, or slide content
│   │   ├── actionDispatcher.ts  # Inserts text, formulas, native tables, slides, images
│   │   ├── wordService.ts       # Word.run native API bridge
│   │   ├── excelService.ts      # Excel.run native API bridge
│   │   └── powerpointService.ts # PowerPoint.run native API bridge
│   ├── providers/               # AI Provider Adapters
│   │   ├── types.ts             # Core contracts, capabilities, and message schemas
│   │   ├── baseProvider.ts      # Base streaming and image generation class
│   │   ├── openAIProvider.ts    # OpenAI adapter
│   │   ├── geminiProvider.ts    # Google Gemini adapter
│   │   ├── anthropicProvider.ts # Anthropic Claude adapter
│   │   ├── openRouterProvider.ts# OpenRouter adapter
│   │   └── customProvider.ts    # Custom / Local LLM adapter
│   ├── services/
│   │   ├── providerRegistry.ts  # Central registry for providers and dynamic models
│   │   ├── chatService.ts       # Conversation management, context enrichment, streaming
│   │   └── storageService.ts    # Encrypted local storage for keys, settings, history
│   ├── components/              # UI Components
│   │   ├── Header.ts            # Host badge, brand, new chat, settings triggers
│   │   ├── ModelSelector.ts     # Provider & Model cascading dropdowns
│   │   ├── ContextBar.ts        # Attached document context indicator
│   │   ├── QuickActions.ts      # Host-tailored prompt chips
│   │   ├── ChatView.ts          # Virtualized message list, markdown, action bars
│   │   ├── PromptBox.ts         # Multi-line input, image upload, send/stop buttons
│   │   ├── SettingsModal.ts     # API key manager, connection testing, system prompt
│   │   ├── HistoryModal.ts      # Saved conversations, search, and restore
│   │   └── Toast.ts             # Non-intrusive action feedback toasts
│   ├── styles/                  # Design System
│   │   ├── theme.css            # Dark/Light design tokens, typography, gradients
│   │   ├── layout.css           # 300px-450px sidebar layout
│   │   ├── chat.css             # Chat bubbles, markdown tables, action buttons
│   │   └── components.css       # Modals, cards, drawers, forms
│   └── utils/
│       ├── markdown.ts          # Safe HTML markdown renderer
│       └── logger.ts            # Key-redacting sanitized logger
└── assets/                      # High-res icons (16, 32, 64, 80 px)
```

---

## 🛠️ Installation & Local Development

### 1. Prerequisites
- **Node.js** v18 or higher (Node v20+ recommended).
- Microsoft Office (Word, Excel, PowerPoint) installed on Windows, Mac, or Office on the Web (Office 365).

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm start
```
This runs both:
- **Express Proxy Server** at `http://localhost:3001` (handling SSE streaming, CORS bypass, and key validation).
- **Vite HTTPS Taskpane Server** at `https://localhost:3000` (auto-generating local SSL certificates).

> **Tip:** You can also preview the taskpane directly in your web browser at `https://localhost:3000` for testing and design adjustments before sideloading into Office!

---

## 💻 Sideloading into Microsoft Office

### Sideloading in Microsoft Word / Excel / PowerPoint (Desktop on Windows)
1. Open Windows File Explorer and navigate to a local folder you wish to share (or create `C:\OfficeAddins`).
2. Copy `genai-manifest.xml` into this folder.
3. Right-click the folder -> **Properties** -> **Sharing** tab -> click **Share...** -> add your user account with Read permission.
4. Note the Network Path (e.g. `\\YOUR-PC\OfficeAddins`).
5. Open **Word**, **Excel**, or **PowerPoint**:
   - Go to **File** -> **Options** -> **Trust Center** -> **Trust Center Settings...** -> **Trusted Add-in Catalogs**.
   - In **Catalog URL**, paste the network path (`\\YOUR-PC\OfficeAddins`), click **Add Catalog**, and check **Show in Menu**.
   - Click **OK** and restart the Office app.
6. In Word, Excel, or PowerPoint:
   - Go to **Insert** -> **Add-ins** (or **Get Add-ins**) -> select the **SHARED FOLDER** tab.
   - Click **Office AI Copilot** -> **Add**.
7. The **AI Assistant** tab and **AI Copilot** button will appear in the ribbon! Click it to open the taskpane.

### Sideloading in Office on the Web (Word / Excel / PowerPoint for Web)
1. Open [Office.com](https://www.office.com) and create or open a document in Word, Excel, or PowerPoint.
2. Click **Insert** -> **Add-ins** -> **More Add-ins**.
3. In the dialog, click **Manage My Add-ins** -> **Upload My Add-in**.
4. Select `genai-manifest.xml` from your project folder and click **Upload**.
5. The taskpane will open immediately in the right sidebar.

---

## 🔒 Security & Privacy Architecture

1. **No Hardcoded API Keys**:
   - API keys are never stored in client-side bundles or source code.
   - Keys are entered by the user in the Settings panel and saved in local browser storage (`localStorage`) or can be passed via environment variables on the backend proxy.
2. **Selective Document Context**:
   - The add-in does **not** send your entire document or workbook to the AI automatically.
   - Only the content explicitly selected by the user (or summarized via the active context mode) is attached.
   - The user can detach context with a single click at any time.
3. **Key Masking & Sanitized Logging**:
   - The built-in logger (`src/utils/logger.ts`) scrubs all API keys and bearer tokens, preventing accidental credential exposure in developer tools.
4. **Proxy Architecture**:
   - Direct browser calls to LLMs often hit browser CORS restrictions. The included lightweight Express server proxies requests securely while supporting real-time SSE streaming.

---

## ⚙️ Configuration & Custom Models

1. Open the Add-in Taskpane in Word, Excel, or PowerPoint.
2. Click the ⚙️ **Settings** icon in the top right.
3. Enter your API key for your preferred provider(s):
   - **OpenAI**: `sk-...`
   - **Google Gemini**: `AIzaSy...`
   - **Anthropic Claude**: `sk-ant-...`
   - **OpenRouter**: `sk-or-...`
   - **Custom / Local**: Specify your endpoint URL (e.g. `http://localhost:11434/v1` for Ollama).
4. Click **Test Connection** to confirm connectivity.
5. Click **Save Settings**.

### Adding Any Custom Model ID
To use newly released models (e.g. `meta-llama/llama-3.3-70b-instruct` or a custom fine-tuned model):
1. In Settings, scroll to **Add Custom Model**.
2. Enter the Model Identifier, Display Name, and Target Provider.
3. Click **+ Add Model**. The model will instantly appear in the Model dropdown selector.

---

## 🚢 Production Deployment

1. Build the production assets:
   ```bash
   npm run build
   ```
   This generates the optimized bundle in `dist/`.
2. Host the `dist/` static files on any HTTPS-enabled server or cloud platform (e.g., Azure Static Web Apps, AWS S3/CloudFront, Cloudflare Pages, Vercel, or Nginx).
3. Deploy the backend proxy (`server/index.ts`) to Azure App Service, AWS ECS, or Render, and update CORS origins to match your domain.
4. Update `genai-manifest.xml` replacing `https://localhost:3000` with your production HTTPS URL.
5. Deploy the manifest organization-wide via the **Microsoft 365 Admin Center** (Settings -> Integrated Apps -> Upload custom apps) so all users in your organization receive the Add-in automatically across Word, Excel, and PowerPoint.
