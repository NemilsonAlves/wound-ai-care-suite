export type AIProviderName = 'openai' | 'groq' | 'claude';

export interface AIProviderConfig {
  provider: AIProviderName;
  openai?: { apiKey?: string; model?: string };
  groq?: { apiKey?: string; model?: string };
  claude?: { apiKey?: string; model?: string };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
}

const LS_KEYS = {
  provider: 'ai.provider',
  openaiKey: 'ai.openai.key',
  openaiModel: 'ai.openai.model',
  groqKey: 'ai.groq.key',
  groqModel: 'ai.groq.model',
  claudeKey: 'ai.claude.key',
  claudeModel: 'ai.claude.model',
};

export class AIProviderService {
  getConfig(): AIProviderConfig {
    const provider = (localStorage.getItem(LS_KEYS.provider) as AIProviderName) || 'openai';
    const config: AIProviderConfig = {
      provider,
      openai: {
        apiKey: localStorage.getItem(LS_KEYS.openaiKey) || import.meta.env.VITE_OPENAI_API_KEY || '',
        model: localStorage.getItem(LS_KEYS.openaiModel) || import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      },
      groq: {
        apiKey: localStorage.getItem(LS_KEYS.groqKey) || import.meta.env.VITE_GROQ_API_KEY || '',
        model: localStorage.getItem(LS_KEYS.groqModel) || import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant',
      },
      claude: {
        apiKey: localStorage.getItem(LS_KEYS.claudeKey) || import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        model: localStorage.getItem(LS_KEYS.claudeModel) || import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
      },
    };
    return config;
  }

  saveConfig(config: Partial<AIProviderConfig>) {
    if (config.provider) localStorage.setItem(LS_KEYS.provider, config.provider);
    if (config.openai?.apiKey !== undefined) localStorage.setItem(LS_KEYS.openaiKey, config.openai.apiKey || '');
    if (config.openai?.model !== undefined) localStorage.setItem(LS_KEYS.openaiModel, config.openai.model || '');
    if (config.groq?.apiKey !== undefined) localStorage.setItem(LS_KEYS.groqKey, config.groq.apiKey || '');
    if (config.groq?.model !== undefined) localStorage.setItem(LS_KEYS.groqModel, config.groq.model || '');
    if (config.claude?.apiKey !== undefined) localStorage.setItem(LS_KEYS.claudeKey, config.claude.apiKey || '');
    if (config.claude?.model !== undefined) localStorage.setItem(LS_KEYS.claudeModel, config.claude.model || '');
  }

  isConfigured(provider?: AIProviderName): boolean {
    const cfg = this.getConfig();
    const p = provider || cfg.provider;
    switch (p) {
      case 'openai': return !!cfg.openai?.apiKey;
      case 'groq': return !!cfg.groq?.apiKey;
      case 'claude': return !!cfg.claude?.apiKey;
      default: return false;
    }
  }

  async testConnection(provider?: AIProviderName): Promise<{ ok: boolean; message?: string }> {
    const cfg = this.getConfig();
    const p = provider || cfg.provider;
    try {
      switch (p) {
        case 'openai': {
          if (!cfg.openai?.apiKey) return { ok: false, message: 'Chave OpenAI ausente' };
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${cfg.openai.apiKey}`,
            },
            body: JSON.stringify({
              model: cfg.openai.model,
              messages: [{ role: 'user', content: 'Responda "ok"' }],
              max_tokens: 5,
            }),
          });
          return { ok: res.ok, message: res.ok ? 'Conectado' : `Erro ${res.status}` };
        }
        case 'groq': {
          if (!cfg.groq?.apiKey) return { ok: false, message: 'Chave Groq ausente' };
          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${cfg.groq.apiKey}`,
            },
            body: JSON.stringify({
              model: cfg.groq.model,
              messages: [{ role: 'user', content: 'Responda "ok"' }],
              max_tokens: 5,
            }),
          });
          return { ok: res.ok, message: res.ok ? 'Conectado' : `Erro ${res.status}` };
        }
        case 'claude': {
          if (!cfg.claude?.apiKey) return { ok: false, message: 'Chave Claude ausente' };
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': cfg.claude.apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: cfg.claude.model,
              max_tokens: 16,
              messages: [{ role: 'user', content: 'Responda "ok"' }],
            }),
          });
          return { ok: res.ok, message: res.ok ? 'Conectado' : `Erro ${res.status}` };
        }
        default:
          return { ok: false, message: 'Provedor inválido' };
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Falha na conexão';
      return { ok: false, message };
    }
  }

  async chat(req: ChatRequest, provider?: AIProviderName): Promise<string> {
    const cfg = this.getConfig();
    const p = provider || cfg.provider;
    switch (p) {
      case 'openai':
        return this.chatOpenAI(req, cfg);
      case 'groq':
        return this.chatGroq(req, cfg);
      case 'claude':
        return this.chatClaude(req, cfg);
      default:
        throw new Error('Provedor de IA não configurado');
    }
  }

  private async chatOpenAI(req: ChatRequest, cfg: AIProviderConfig): Promise<string> {
    if (!cfg.openai?.apiKey) throw new Error('Chave OpenAI ausente');
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: req.model || cfg.openai.model,
        messages: req.messages,
        temperature: req.temperature ?? 0.2,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI erro ${res.status}`);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? '';
  }

  private async chatGroq(req: ChatRequest, cfg: AIProviderConfig): Promise<string> {
    if (!cfg.groq?.apiKey) throw new Error('Chave Groq ausente');
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.groq.apiKey}`,
      },
      body: JSON.stringify({
        model: req.model || cfg.groq.model,
        messages: req.messages,
        temperature: req.temperature ?? 0.2,
      }),
    });
    if (!res.ok) throw new Error(`Groq erro ${res.status}`);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? '';
  }

  private async chatClaude(req: ChatRequest, cfg: AIProviderConfig): Promise<string> {
    if (!cfg.claude?.apiKey) throw new Error('Chave Claude ausente');
    // Convert OpenAI-like messages to Anthropic format
    const userContent = req.messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n');
    const systemMsg = req.messages.find(m => m.role === 'system')?.content;
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': cfg.claude.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: req.model || cfg.claude.model,
        max_tokens: 512,
        system: systemMsg,
        messages: [{ role: 'user', content: userContent }],
      }),
    });
    if (!res.ok) throw new Error(`Claude erro ${res.status}`);
    const data = await res.json();
    return data?.content?.[0]?.text ?? '';
  }
}

export const aiProviderService = new AIProviderService();
