import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Trash2, 
  Download, 
  RefreshCw, 
  Search, 
  Filter,
  Archive,
  CheckCircle,
  AlertTriangle,
  FileDown
} from "lucide-react";
import useFeedbackStore, { Feedback } from "@/lib/feedbackStore";
import Papa from "papaparse";

export const DataManagement = () => {
  const feedbacks = useFeedbackStore((s) => s.feedbacks);
  const setFeedbacks = useFeedbackStore((s) => s.setFeedbacks);
  const updateFeedback = useFeedbackStore((s) => s.updateFeedback);
  const removeFeedback = useFeedbackStore((s) => s.removeFeedback);

  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectRecord = (recordId: string) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const handleSelectAll = () => {
    const filteredRecords = getFilteredRecords();
    const allSelected = filteredRecords.every(record => selectedRecords.includes(record.id));
    if (allSelected) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(filteredRecords.map(record => record.id));
    }
  };

  const getFilteredRecords = () => {
    return feedbacks.filter(record => {
      const matchesSearch = record.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const handleBatchOperation = async (operation: string) => {
    if (selectedRecords.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      switch (operation) {
        case "delete":
          selectedRecords.forEach(id => removeFeedback(id));
          break;
        case "archive":
          selectedRecords.forEach(id => updateFeedback(id, { status: "archived" }));
          break;
        case "resolve":
          selectedRecords.forEach(id => updateFeedback(id, { status: "resolved" }));
          break;
      }
      setSelectedRecords([]);
      setIsProcessing(false);
    }, 500);
  };

  const handleExport = (format: string) => {
    const dataToExport = selectedRecords.length > 0 
      ? feedbacks.filter(record => selectedRecords.includes(record.id))
      : getFilteredRecords();
    if (format === "csv") {
      const csv = Papa.unparse(dataToExport);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "feedbacks.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    // 可扩展excel导出
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning text-warning-foreground";
      case "processing":
        return "bg-primary text-primary-foreground";
      case "resolved":
        return "bg-success text-success-foreground";
      case "archived":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredRecords = getFilteredRecords();

  return (
    <div className="space-y-6">
      {/* 数据管理工具栏 */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            数据管理中心
          </CardTitle>
          <CardDescription>
            对客诉数据进行清理、管理和导出操作
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 搜索和筛选 */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="搜索内容或类型..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待处理</SelectItem>
                  <SelectItem value="processing">处理中</SelectItem>
                  <SelectItem value="resolved">已解决</SelectItem>
                  <SelectItem value="archived">已归档</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                高级筛选
              </Button>
            </div>

            {/* 批量操作 */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  已选择 {selectedRecords.length} 条记录
                </span>
                {selectedRecords.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBatchOperation("resolve")}
                      disabled={isProcessing}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      标记已解决
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBatchOperation("archive")}
                      disabled={isProcessing}
                      className="flex items-center gap-1"
                    >
                      <Archive className="h-4 w-4" />
                      归档
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBatchOperation("delete")}
                      disabled={isProcessing}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      删除
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExport("csv")}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  导出CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExport("excel")}
                  className="flex items-center gap-1"
                >
                  <FileDown className="h-4 w-4" />
                  导出Excel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总记录数</p>
                <p className="text-2xl font-bold text-primary">{feedbacks.length}</p>
              </div>
              <Database className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已选择</p>
                <p className="text-2xl font-bold text-warning">{selectedRecords.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">待处理</p>
                <p className="text-2xl font-bold text-destructive">
                  {feedbacks.filter(r => r.status === "pending").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已归档</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {feedbacks.filter(r => r.status === "archived").length}
                </p>
              </div>
              <Archive className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 数据表格 */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>数据记录</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={filteredRecords.length > 0 && filteredRecords.every(record => selectedRecords.includes(record.id))}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">全选</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className={`p-4 border rounded-lg transition-colors hover:bg-muted/50 ${
                  selectedRecords.includes(record.id) ? "bg-primary/5 border-primary" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedRecords.includes(record.id)}
                    onCheckedChange={() => handleSelectRecord(record.id)}
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{record.id}</span>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status === "pending" && "待处理"}
                        {record.status === "processing" && "处理中"}
                        {record.status === "resolved" && "已解决"}
                        {record.status === "archived" && "已归档"}
                      </Badge>
                      <Badge className={getPriorityColor(record.priority)}>
                        {record.priority === "high" && "高"}
                        {record.priority === "medium" && "中"}
                        {record.priority === "low" && "低"}
                      </Badge>
                      <Badge variant="outline">{record.type}</Badge>
                    </div>
                    
                    <p className="text-sm text-foreground">{record.content}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>产品：{record.product}</span>
                      <span>日期：{record.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredRecords.length === 0 && (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">没有找到匹配的记录</p>
                <p className="text-sm text-muted-foreground mt-2">
                  尝试调整搜索条件或筛选器
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 数据清理工具 */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            数据清理工具
          </CardTitle>
          <CardDescription>
            定期清理和优化数据存储
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Archive className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">自动归档</p>
                <p className="text-xs text-muted-foreground">归档30天前已解决的反馈</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Trash2 className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">清理重复</p>
                <p className="text-xs text-muted-foreground">检测并合并重复的反馈记录</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <RefreshCw className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">数据优化</p>
                <p className="text-xs text-muted-foreground">压缩存储空间，提升查询性能</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};