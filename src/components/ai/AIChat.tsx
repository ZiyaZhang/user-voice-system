import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles, BarChart3, FileText, TrendingUp, AlertCircle, RefreshCw, Zap, Trash2 } from "lucide-react";
import useFeedbackStore from "@/lib/feedbackStore";
import { DeepSeekAPI, DeepSeekMessage } from "@/lib/deepseekApi";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  isError?: boolean;
  isStreaming?: boolean;
}

export const AIChat = () => {
  const feedbacks = useFeedbackStore((s) => s.feedbacks);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "您好！我是腾讯理财通智能反馈分析助手。我可以帮助您：\n\n✨ 分析客诉数据趋势\n📊 生成统计报告\n🔍 查找特定问题类型\n💡 提供改进建议\n📈 展示实时图表\n\n请告诉我您需要什么帮助？",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [useStreaming, setUseStreaming] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    // 添加用户消息到对话历史
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // 构建完整的对话历史，包括所有之前的对话
      const conversationHistory: DeepSeekMessage[] = [
        {
          role: 'system',
          content: DeepSeekAPI.buildSystemPrompt(feedbacks)
        },
        // 添加所有历史对话（除了系统消息）
        ...messages.map(msg => ({
          role: (msg.type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: msg.content
        })),
        {
          role: 'user',
          content: inputMessage
        }
      ];

      if (useStreaming) {
        // 流式输出
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: "",
          timestamp: new Date(),
          isStreaming: true
        };
        
        // 添加AI消息到对话历史
        setMessages(prev => [...prev, aiMessage]);
        
        await DeepSeekAPI.chatStream(conversationHistory, (chunk) => {
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessage.id 
              ? { ...msg, content: msg.content + chunk }
              : msg
          ));
        });
        
        // 完成流式输出
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessage.id 
            ? { ...msg, isStreaming: false }
            : msg
        ));
      } else {
        // 非流式输出
        const aiResponse = await DeepSeekAPI.chat(conversationHistory);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: aiResponse,
          timestamp: new Date()
        };
        
        // 添加AI消息到对话历史
        setMessages(prev => [...prev, aiMessage]);
      }
      
      setIsConnected(true);
    } catch (error) {
      console.error('AI对话错误:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `抱歉，我遇到了一些问题：${error instanceof Error ? error.message : '未知错误'}\n\n请稍后再试或重新表述您的问题。`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetry = () => {
    if (messages.length > 1) {
      // 移除最后一条AI消息，重新生成
      setMessages(prev => prev.slice(0, -1));
      const lastUserMessage = messages[messages.length - 2];
      if (lastUserMessage && lastUserMessage.type === 'user') {
        setInputMessage(lastUserMessage.content);
        setTimeout(() => handleSendMessage(), 100);
      }
    }
  };

  const handleClearHistory = () => {
    if (confirm("确定要清除所有对话历史吗？此操作不可恢复！")) {
      setMessages([
        {
          id: "1",
          type: "ai",
          content: "您好！我是腾讯理财通智能反馈分析助手。我可以帮助您：\n\n✨ 分析客诉数据趋势\n📊 生成统计报告\n🔍 查找特定问题类型\n💡 提供改进建议\n📈 展示实时图表\n\n请告诉我您需要什么帮助？",
          timestamp: new Date()
        }
      ]);
    }
  };

  const quickActions = [
    { icon: BarChart3, text: "查看数据统计", action: "请显示最新的数据统计信息" },
    { icon: TrendingUp, text: "分析趋势变化", action: "请分析最近的趋势变化" },
    { icon: FileText, text: "获取改进建议", action: "基于当前数据给出改进建议" },
    { icon: AlertCircle, text: "问题类型分析", action: "请分析各种问题类型的分布" },
  ];

  const getConnectionStatus = () => {
    if (isLoading) return { status: "loading", text: "AI思考中...", color: "text-primary" };
    if (isConnected) return { status: "connected", text: "AI已连接", color: "text-success" };
    return { status: "disconnected", text: "AI连接异常", color: "text-destructive" };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="space-y-6">
      {/* AI助手介绍 */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI智能分析助手
          </CardTitle>
          <CardDescription>
            基于DeepSeek的智能客诉数据分析系统，实时分析{feedbacks.length}条反馈数据，帮助您快速理解数据趋势、生成报告并提供改进建议
          </CardDescription>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connectionStatus.status === 'connected' ? 'bg-success' : connectionStatus.status === 'loading' ? 'bg-primary animate-pulse' : 'bg-destructive'}`} />
              <span className={connectionStatus.color}>{connectionStatus.text}</span>
              {!isConnected && (
                <Button size="sm" variant="outline" onClick={handleRetry} className="ml-2">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  重试
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={useStreaming ? "default" : "outline"}
                onClick={() => setUseStreaming(!useStreaming)}
                className="flex items-center gap-1"
              >
                <Zap className="h-3 w-3" />
                {useStreaming ? "流式输出" : "普通输出"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearHistory}
                className="flex items-center gap-1"
                title="清除对话历史"
              >
                <Trash2 className="h-3 w-3" />
                清空历史
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearHistory}
                className="flex items-center gap-1"
                title="清除对话历史"
              >
                <Trash2 className="h-3 w-3" />
                清空历史
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 快捷操作 */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-sm">快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInputMessage(action.action)}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <action.icon className="h-4 w-4" />
                {action.text}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 聊天区域 */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>对话窗口</span>
            <span className="text-sm text-muted-foreground">
              共 {messages.length} 条消息
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea ref={scrollAreaRef} className="h-96 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[80%] gap-3 ${
                      message.type === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground"
                          : message.isError
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {message.type === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-3 ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground"
                          : message.isError
                          ? "bg-destructive/10 text-destructive border border-destructive/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">
                        {message.content}
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
                        )}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                        <p className="text-xs opacity-50">
                          #{index + 1}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted text-muted-foreground rounded-lg p-3">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* 输入区域 */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入您的问题..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              支持自然语言对话，AI将基于{feedbacks.length}条反馈数据为您提供专业分析
              {useStreaming && "（流式输出模式）"}
              {messages.length > 1 && ` • 当前对话：${messages.length}条消息`}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};