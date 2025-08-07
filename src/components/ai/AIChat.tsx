import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles, BarChart3, FileText } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "您好！我是腾讯理财通智能反馈分析助手。我可以帮助您：\n\n✨ 分析客诉数据趋势\n📊 生成统计报告\n🔍 查找特定问题类型\n💡 提供改进建议\n\n请告诉我您需要什么帮助？",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // 模拟AI回复
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: getAIResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const getAIResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes("统计") || lowerInput.includes("数据")) {
      return "根据最新数据分析：\n\n📊 本月总反馈数：1,234条\n📈 较上月增长：12.5%\n✅ 解决率：92.8%\n⏱️ 平均解决时间：2.3天\n\n主要问题类型：\n• 功能问题（45%）\n• 界面优化（30%）\n• 操作困难（15%）\n• 性能问题（10%）\n\n需要我生成详细报告吗？";
    }
    
    if (lowerInput.includes("趋势") || lowerInput.includes("变化")) {
      return "📈 反馈趋势分析：\n\n近期趋势：\n• 本周反馈量较上周增长12.5%\n• 功能问题反馈显著增加\n• 解决效率提升25.8%\n• 下午2-4点为反馈高峰期\n\n建议措施：\n1. 加强产品稳定性测试\n2. 优化高峰期客服配置\n3. 完善问题分类机制\n\n您希望查看具体的趋势图表吗？";
    }
    
    if (lowerInput.includes("建议") || lowerInput.includes("改进")) {
      return "💡 基于数据分析的改进建议：\n\n优先级一：\n• 重点解决功能稳定性问题\n• 简化用户操作流程\n• 优化界面用户体验\n\n优先级二：\n• 提升系统性能表现\n• 增强错误提示机制\n• 完善帮助文档\n\n实施建议：\n1. 建立问题优先级处理机制\n2. 定期进行用户体验评估\n3. 建立快速响应通道\n\n需要我详细分析某个具体问题吗？";
    }
    
    return "我理解您的问题。作为智能分析助手，我可以帮您：\n\n🔍 分析客诉数据模式\n📋 生成统计报告\n💡 提供解决方案建议\n📊 展示趋势图表\n\n请告诉我您希望了解哪个方面的信息，我会为您提供详细的分析结果。";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: BarChart3, text: "查看数据统计", action: "请显示最新的数据统计信息" },
    { icon: FileText, text: "生成分析报告", action: "请生成一份详细的分析报告" },
    { icon: Sparkles, text: "获取改进建议", action: "基于当前数据给出改进建议" },
  ];

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
            基于深度学习的客诉数据分析系统，可以帮助您快速理解数据趋势、生成报告并提供改进建议
          </CardDescription>
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
          <CardTitle>对话窗口</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
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
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};