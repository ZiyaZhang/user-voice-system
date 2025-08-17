const DEEPSEEK_API_KEY = 'sk-65529f43a6054c4e8d2cec9877bfb14f';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class DeepSeekAPI {
  private static async makeRequest(messages: DeepSeekMessage[], stream: boolean = false): Promise<DeepSeekResponse> {
    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: stream,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API Error:', response.status, errorText);
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('DeepSeek API Request Error:', error);
      throw error;
    }
  }

  // 流式聊天
  static async chatStream(messages: DeepSeekMessage[], onChunk: (chunk: string) => void): Promise<void> {
    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('DeepSeek Stream API error:', error);
      throw error;
    }
  }

  static async chat(messages: DeepSeekMessage[]): Promise<string> {
    try {
      const response = await this.makeRequest(messages, false);
      return response.choices[0]?.message?.content || '抱歉，我没有得到有效的回复。';
    } catch (error) {
      console.error('DeepSeek API error:', error);
      
      // 如果是API错误，提供友好的错误信息
      if (error instanceof Error && error.message.includes('DeepSeek API error')) {
        throw new Error(`DeepSeek API调用失败，请检查API密钥和网络连接。错误详情：${error.message}`);
      }
      
      throw new Error(`API调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 构建系统提示词，包含客诉数据上下文
  static buildSystemPrompt(feedbacks: any[]): string {
    const total = feedbacks.length;
    
    const typeStats: Record<string, number> = {};
    feedbacks.forEach(f => {
      typeStats[f.type] = (typeStats[f.type] || 0) + 1;
    });
    
    const typeList = Object.entries(typeStats)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => `${type}: ${count}条`)
      .join(', ');

    return `你是腾讯理财通智能反馈分析助手，专门分析用户反馈数据并提供专业建议。

当前数据统计：
- 总反馈数：${total}条
- 问题类型分布：${typeList}

你的职责：
1. 基于真实数据提供准确的分析报告
2. 识别问题趋势和模式
3. 提供具体的改进建议
4. 回答用户关于数据统计、趋势分析、问题分类等问题
5. 使用专业但易懂的语言

请始终保持专业、准确、有帮助的回答。`;
  }

  // 测试API连接
  static async testConnection(): Promise<boolean> {
    try {
      const testMessage: DeepSeekMessage[] = [
        { role: 'user', content: '你好' }
      ];
      await this.makeRequest(testMessage, false);
      return true;
    } catch (error) {
      console.error('API连接测试失败:', error);
      return false;
    }
  }
}
