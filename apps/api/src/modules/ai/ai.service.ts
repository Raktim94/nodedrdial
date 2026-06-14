import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  private async chat(messages: { role: string; content: string }[], model?: string): Promise<string> {
    const apiKey = this.config.get('OPENROUTER_API_KEY');
    const baseUrl = this.config.get('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1');
    const defaultModel = this.config.get('OPENROUTER_DEFAULT_MODEL', 'google/gemini-2.0-flash-exp:free');

    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      { model: model || defaultModel, messages, max_tokens: 500 },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://github.com/twilioHub-oss',
          'X-Title': 'TwilioHub OSS',
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      },
    );

    return response.data.choices[0]?.message?.content || '';
  }

  async suggestReply(incomingMessage: string, contactName?: string): Promise<string[]> {
    try {
      const content = await this.chat([
        {
          role: 'system',
          content: 'You are a helpful customer service assistant. Generate 3 short, professional SMS reply suggestions (max 160 chars each). Return ONLY a JSON array of strings.',
        },
        {
          role: 'user',
          content: `Customer${contactName ? ` (${contactName})` : ''} sent: "${incomingMessage}"\n\nSuggest 3 replies as JSON array.`,
        },
      ]);

      try {
        const parsed = JSON.parse(content.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
        return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
      } catch {
        return [];
      }
    } catch (err) {
      this.logger.warn(`AI reply suggestion failed: ${err.message}`);
      return [];
    }
  }

  async generateCampaignMessage(context: {
    productName: string;
    offer: string;
    tone: 'professional' | 'casual' | 'urgent';
  }): Promise<string> {
    try {
      const content = await this.chat([
        {
          role: 'system',
          content: 'Generate a concise, effective SMS marketing message. Max 160 characters. No emojis unless specified.',
        },
        {
          role: 'user',
          content: `Product: ${context.productName}\nOffer: ${context.offer}\nTone: ${context.tone}\n\nWrite one SMS message.`,
        },
      ]);
      return content.trim().substring(0, 160);
    } catch (err) {
      this.logger.warn(`AI campaign generation failed: ${err.message}`);
      return '';
    }
  }

  async classifyMessage(message: string): Promise<string> {
    try {
      const content = await this.chat([
        {
          role: 'system',
          content: 'Classify the SMS message intent. Return ONLY one word: inquiry, complaint, order, opt-out, feedback, spam, or other.',
        },
        { role: 'user', content: message },
      ]);
      return content.trim().toLowerCase();
    } catch {
      return 'other';
    }
  }

  async summarizeConversation(messages: string[]): Promise<string> {
    try {
      const content = await this.chat([
        {
          role: 'system',
          content: 'Summarize this SMS conversation in 2-3 sentences for a CRM note.',
        },
        {
          role: 'user',
          content: messages.slice(-20).join('\n'),
        },
      ]);
      return content.trim();
    } catch {
      return '';
    }
  }
}
