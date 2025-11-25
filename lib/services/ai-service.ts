// lib/services/ai-service.ts
export interface AIOptions {
  maxLength?: number;
  temperature?: number;
}

class AIService {
  private apiUrl = '/api/ai';

  private async callAPI(action: string, text: string, targetLang?: string) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          text,
          targetLang,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  async improveText(text: string): Promise<string> {
    return this.callAPI('improve', text);
  }

  async summarize(text: string): Promise<string> {
    return this.callAPI('summarize', text);
  }

  async expandText(text: string): Promise<string> {
    return this.callAPI('expand', text);
  }

  async fixGrammar(text: string): Promise<string> {
    return this.callAPI('grammar', text);
  }

  async translate(text: string, targetLang: string = 'es'): Promise<string> {
    return this.callAPI('translate', text, targetLang);
  }

  async changeTone(text: string, tone: 'formal' | 'casual' | 'professional'): Promise<string> {
    return this.callAPI('tone', text);
  }

  async complete(text: string): Promise<string> {
    return this.callAPI('expand', text);
  }
}

// Create singleton instance
let aiService: AIService | null = null;

export const initAIService = () => {
  if (!aiService) {
    aiService = new AIService();
  }
  return aiService;
};

export const getAIService = (): AIService => {
  if (!aiService) {
    aiService = new AIService();
  }
  return aiService;
};

export default AIService;