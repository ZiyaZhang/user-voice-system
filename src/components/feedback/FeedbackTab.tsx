import { useState } from "react";
import { Search, Filter, FileText, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Feedback {
  id: string;
  type: string;
  content: string;
  date: string;
  status: "pending" | "processing" | "resolved";
  product: string;
}

const mockFeedbacks: Feedback[] = [
  {
    id: "1",
    type: "功能问题",
    content: "理财产品收益显示异常，无法正常查看详细收益信息",
    date: "2024-01-15",
    status: "pending",
    product: "理财通"
  },
  {
    id: "2", 
    type: "界面优化",
    content: "希望能够在首页直接显示总资产变化趋势图",
    date: "2024-01-14",
    status: "processing",
    product: "理财通"
  },
  {
    id: "3",
    type: "操作困难",
    content: "购买理财产品的流程过于复杂，建议简化步骤",
    date: "2024-01-13",
    status: "resolved",
    product: "理财通"
  }
];

export const FeedbackTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [filteredFeedbacks, setFilteredFeedbacks] = useState(mockFeedbacks);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning text-warning-foreground";
      case "processing":
        return "bg-primary text-primary-foreground";
      case "resolved":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "待处理";
      case "processing":
        return "处理中";
      case "resolved":
        return "已解决";
      default:
        return "未知";
    }
  };

  return (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            搜索和筛选
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索反馈内容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="选择产品" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部产品</SelectItem>
                <SelectItem value="理财通">理财通</SelectItem>
                <SelectItem value="基金">基金</SelectItem>
                <SelectItem value="保险">保险</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="px-6">
              <Filter className="h-4 w-4 mr-2" />
              筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 反馈列表 */}
      <div className="space-y-4">
        {filteredFeedbacks.length > 0 ? (
          filteredFeedbacks.map((feedback) => (
            <Card key={feedback.id} className="shadow-card hover:shadow-elegant transition-smooth">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="text-primary border-primary">
                        {feedback.type}
                      </Badge>
                      <Badge className={getStatusColor(feedback.status)}>
                        {getStatusText(feedback.status)}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {feedback.date}
                      </div>
                    </div>
                    <p className="text-foreground leading-relaxed mb-2">
                      {feedback.content}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      产品：{feedback.product}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">没有找到相关的用户反馈</p>
              <p className="text-sm text-muted-foreground mt-2">
                尝试调整搜索条件或筛选器
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};