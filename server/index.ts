import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { estimateCost } from './utils/costEstimator.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'anthropic-version']
}));
app.use(express.json({ limit: '25mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString(), version: '1.0.0' });
});

// Test Connection / Validate API Key
app.post('/api/validate', async (req: Request, res: Response) => {
  const { provider, apiKey, baseUrl } = req.body;
  const resolvedApiKey = apiKey
    || (provider === 'openai' ? process.env.OPENAI_API_KEY : undefined)
    || (provider === 'gemini' ? process.env.GEMINI_API_KEY : undefined)
    || (provider === 'pollinations' ? (process.env.POLLINATIONS_API_KEY || 'sk_BxKRwDPsUUbNK4UcQgUhBoGojw3fAyzw') : undefined)
    || (provider === 'nvidia' ? (process.env.NVIDIA_API_KEY || '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') : undefined);

  if (!resolvedApiKey && provider !== 'custom' && provider !== 'nvidia') {
    return res.status(400).json({ valid: false, message: 'API Key is required.' });
  }

  try {
    let isValid = false;
    let message = 'Connection successful';

    switch (provider) {
      case 'openai': {
        const r = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${resolvedApiKey}` }
        });
        isValid = r.ok;
        if (!r.ok) {
          const errData = await r.json().catch(() => ({}));
          message = errData.error?.message || `HTTP ${r.status}`;
        }
        break;
      }
      case 'nvidia': {
        const NVIDIA_BASE = 'https://integrate.api.nvidia.com/v1';
        const r = await fetch(`${NVIDIA_BASE}/models`, {
          headers: { Authorization: `Bearer ${resolvedApiKey}` }
        });
        isValid = r.ok;
        if (!r.ok) {
          const errData = await r.json().catch(() => ({}));
          message = (errData as any).message || `HTTP ${r.status}`;
        } else {
          message = 'NVIDIA NIM connected';
        }
        break;
      }
      case 'gemini': {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${resolvedApiKey}`);
        isValid = r.ok;
        if (!r.ok) {
          const errData = await r.json().catch(() => ({}));
          message = errData.error?.message || `HTTP ${r.status}`;
        }
        break;
      }
      case 'openrouter': {
        const r = await fetch('https://openrouter.ai/api/v1/auth/key', {
          headers: { Authorization: `Bearer ${apiKey}` }
        });
        isValid = r.ok;
        if (!r.ok) {
          const errData = await r.json().catch(() => ({}));
          message = errData.error?.message || `HTTP ${r.status}`;
        }
        break;
      }
      case 'pollinations': {
        try {
          const r = await fetch('https://gen.pollinations.ai/account/key', {
            headers: { Authorization: `Bearer ${resolvedApiKey}` }
          });
          isValid = r.ok;
          if (!r.ok) {
            const errData = await r.json().catch(() => ({}));
            message = (errData as any).error?.message || `HTTP ${r.status}`;
          } else {
            const info: any = await r.json().catch(() => ({}));
            message = `Connected (${info.name || 'Pollinations.ai'})`;
          }
        } catch (e: any) {
          isValid = false;
          message = e.message || 'Connection failed';
        }
        break;
      }
      case 'custom': {
        const targetUrl = (baseUrl || 'http://localhost:11434/v1').replace(/\/$/, '') + '/models';
        const headers: Record<string, string> = {};
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
        const r = await fetch(targetUrl, { headers });
        isValid = r.ok;
        if (!r.ok) message = `Custom endpoint returned HTTP ${r.status}`;
        break;
      }
      default:
        return res.status(400).json({ valid: false, message: `Unknown provider: ${provider}` });
    }

    res.json({ valid: isValid, message });
  } catch (err: any) {
    res.status(500).json({ valid: false, message: err.message || 'Connection failed' });
  }
});

// Unified Streaming Chat Endpoint (SSE)
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  const { provider, apiKey, model, messages, temperature, maxTokens, baseUrl, images } = req.body;

  const resolvedApiKey = apiKey
    || (provider === 'openai' ? process.env.OPENAI_API_KEY : undefined)
    || (provider === 'gemini' ? process.env.GEMINI_API_KEY : undefined)
    || (provider === 'nvidia' ? (process.env.NVIDIA_API_KEY || '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') : undefined);

  if (!resolvedApiKey && provider !== 'custom') {
    return res.status(400).json({ error: 'API Key is required' });
  }

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const sendChunk = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // nvidia uses the OpenAI-compatible endpoint — route to the same handler
    if (provider === 'openai' || provider === 'openrouter' || provider === 'custom' || provider === 'nvidia') {
      const NVIDIA_BASE = 'https://integrate.api.nvidia.com/v1';

      const endpoint = provider === 'openrouter'
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : provider === 'openai'
        ? 'https://api.openai.com/v1/chat/completions'
        : provider === 'nvidia'
        ? `${NVIDIA_BASE}/chat/completions`
        : `${(baseUrl || 'http://localhost:11434/v1').replace(/\/$/, '')}/chat/completions`;

      // Transform messages if images present
      const formattedMessages = messages.map((m: any, idx: number) => {
        if (idx === messages.length - 1 && images && images.length > 0) {
          const contentParts: any[] = [{ type: 'text', text: m.content }];
          for (const img of images) {
            contentParts.push({
              type: 'image_url',
              image_url: { url: img.data.startsWith('data:') ? img.data : `data:${img.mimeType || 'image/png'};base64,${img.data}` }
            });
          }
          return { role: m.role, content: contentParts };
        }
        return m;
      });

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (resolvedApiKey) headers['Authorization'] = `Bearer ${resolvedApiKey}`;
      if (provider === 'openrouter') {
        headers['HTTP-Referer'] = 'https://localhost:3000';
        headers['X-Title'] = 'Office AI Copilot';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature: temperature ?? 0.7,
          max_tokens: maxTokens || undefined,
          stream: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        sendChunk({ error: `Provider returned HTTP ${response.status}: ${errorText}` });
        res.write('data: [DONE]\n\n');
        return res.end();
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream from provider');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') {
            sendChunk({ done: true });
            continue;
          }

          try {
            const parsed = JSON.parse(dataStr);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            const finishReason = parsed.choices?.[0]?.finish_reason;
            if (delta) {
              sendChunk({ delta });
            }
            if (finishReason) {
              sendChunk({ finishReason });
            }
          } catch {
            // Ignore parse errors on partial lines
          }
        }
      }

      res.write('data: [DONE]\n\n');
      return res.end();
    }

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${resolvedApiKey}`;

      // Format contents for Gemini API
      const contents = messages.map((m: any, idx: number) => {
        const parts: any[] = [];
        if (idx === messages.length - 1 && images && images.length > 0) {
          for (const img of images) {
            const cleanBase64 = img.data.replace(/^data:[^;]+;base64,/, '');
            parts.push({
              inline_data: {
                mime_type: img.mimeType || 'image/png',
                data: cleanBase64
              }
            });
          }
        }
        parts.push({ text: m.content });
        return {
          role: m.role === 'assistant' ? 'model' : 'user',
          parts
        };
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: temperature ?? 0.7,
            maxOutputTokens: maxTokens || undefined
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        sendChunk({ error: `Gemini API error (${response.status}): ${errText}` });
        res.write('data: [DONE]\n\n');
        return res.end();
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream from Gemini');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (text) sendChunk({ delta: text });
          } catch {
            // Ignore incomplete chunks
          }
        }
      }

      res.write('data: [DONE]\n\n');
      return res.end();
    }



    sendChunk({ error: `Unsupported provider: ${provider}` });
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    sendChunk({ error: err.message || 'Stream processing error' });
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Image Generation Endpoint
app.post('/api/image/generate', async (req: Request, res: Response) => {
  const { provider, apiKey, prompt, model, size } = req.body;

  const resolvedApiKey = apiKey
    || (provider === 'pollinations' ? (process.env.POLLINATIONS_API_KEY || 'sk_BxKRwDPsUUbNK4UcQgUhBoGojw3fAyzw') : undefined)
    || (provider === 'openai' ? process.env.OPENAI_API_KEY : undefined)
    || (provider === 'gemini' ? process.env.GEMINI_API_KEY : undefined);

  if (!resolvedApiKey && provider !== 'pollinations') {
    return res.status(400).json({ error: 'API Key is required for image generation.' });
  }

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'A prompt is required for image generation.' });
  }

  try {
    // Pollinations.ai (tongyi-mai/z-image-turbo & microsoft/mai-image-2.5-flash)
    if (provider === 'pollinations') {
      const polKey = resolvedApiKey || process.env.POLLINATIONS_API_KEY || 'sk_BxKRwDPsUUbNK4UcQgUhBoGojw3fAyzw';
      const targetModel = model || 'tongyi-mai/z-image-turbo';

      try {
        let width = 1024;
        let height = 1024;
        if (size && typeof size === 'string' && size.includes('x')) {
          const [w, h] = size.split('x').map(n => parseInt(n, 10));
          if (!isNaN(w) && !isNaN(h)) {
            width = w;
            height = h;
          }
        }

        const encodedPrompt = encodeURIComponent(prompt.trim());
        const queryParams = new URLSearchParams({
          model: targetModel,
          width: width.toString(),
          height: height.toString(),
          nologo: 'true',
          key: polKey
        });

        const polUrl = `https://gen.pollinations.ai/image/${encodedPrompt}?${queryParams.toString()}`;

        const polResponse = await fetch(polUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${polKey}`
          }
        });

        if (!polResponse.ok) {
          const errData = await polResponse.json().catch(() => ({}));
          const errMsg = (errData as any).error?.message || (errData as any).message || `HTTP ${polResponse.status}`;

          if (polResponse.status === 401) {
            return res.status(401).json({ error: 'Pollinations.ai authentication failed. Please verify your POLLINATIONS_API_KEY in .env.' });
          }
          if (polResponse.status === 402) {
            return res.status(402).json({ error: `Pollinations.ai Key Budget Exhausted: ${errMsg}` });
          }
          if (polResponse.status === 429) {
            return res.status(429).json({ error: 'Pollinations.ai rate limit reached. Please wait a moment and try again.' });
          }

          return res.status(polResponse.status).json({ error: `Pollinations.ai Error: ${errMsg}` });
        }

        const arrayBuffer = await polResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const b64 = buffer.toString('base64');
        const mimeType = polResponse.headers.get('content-type') || 'image/jpeg';

        return res.json({
          imageUrl: `data:${mimeType};base64,${b64}`,
          imageBase64: b64,
          prompt: prompt.trim(),
          model: targetModel
        });
      } catch (polErr: any) {
        console.error('[Pollinations Image Gen Error]:', polErr);
        const errMsg = polErr.message || String(polErr);
        return res.status(500).json({ error: `Pollinations.ai Error: ${errMsg}` });
      }
    }

    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resolvedApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model || 'dall-e-3',
          prompt,
          n: 1,
          size: size || '1024x1024'
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } }));
        return res.status(response.status).json({ error: `Image generation error: ${err.error?.message || JSON.stringify(err)}` });
      }

      const data = await response.json();
      const imageUrl = data.data?.[0]?.url;
      const revisedPrompt = data.data?.[0]?.revised_prompt;

      if (!imageUrl) {
        return res.status(500).json({ error: 'No image URL returned by DALL-E 3' });
      }

      // Download image and convert to base64 to keep CSP compliance
      const imgRes = await fetch(imageUrl);
      const imgBuffer = await imgRes.arrayBuffer();
      const b64 = Buffer.from(imgBuffer).toString('base64');

      return res.json({
        imageUrl: `data:image/png;base64,${b64}`,
        imageBase64: b64,
        revisedPrompt
      });
    }

    if (provider === 'gemini') {
      // Imagen 3 via Gemini API
      const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${resolvedApiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '1:1'
          }
        })
      });

      if (!response.ok) {
        const err = await response.text();
        return res.status(response.status).json({ error: `Imagen generation failed: ${err}` });
      }

      const data = await response.json();
      const b64 = data.predictions?.[0]?.bytesBase64Encoded;
      if (!b64) throw new Error('No image returned by Imagen 3');

      return res.json({
        imageUrl: `data:image/png;base64,${b64}`,
        imageBase64: b64
      });
    }

    return res.status(400).json({ error: `Image generation is not supported for provider: ${provider}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Image generation error' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`[Office AI Proxy] Server running on http://localhost:${PORT}`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[Error] Port ${PORT} is already in use by another process.`);
    console.error(`To release port ${PORT}, run: npm run clean-ports\n`);
  } else {
    console.error('[Office AI Proxy Error]:', err);
  }
});
