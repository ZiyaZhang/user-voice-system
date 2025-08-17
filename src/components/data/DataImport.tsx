import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileSpreadsheet, Sparkles, Globe, CheckCircle, AlertCircle, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Papa from "papaparse";
import useFeedbackStore, { Feedback } from "@/lib/feedbackStore";

// 解析"异动时间区间"中的日期，返回标准 yyyy-mm-dd
function normalizeDateFromRange(range: string | undefined): string {
  if (!range) return "";
  // 抓取第一个日期片段，如 2025/6/3 或 2025-6-3
  const m = range.match(/(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (!m) return "";
  const [_, y, mo, d] = m;
  const yyyy = y.padStart(4, "0");
  const mm = mo.padStart(2, "0");
  const dd = d.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// 统一"问题类型"命名，做简单归一化
function normalizeIssueType(type: string | undefined): string {
  if (!type) return "其他";
  const t = type.replace(/\s+/g, "");
  // 取分隔符前的主类
  const main = t.split(/[\/、>|]/)[0];
  // 简单同义归一
  if (/(账户类|账号类|账户问题)/.test(main)) return "账户问题";
  if (/(功能|功能问题)/.test(main)) return "功能问题";
  if (/(界面|UI|体验|界面优化)/.test(main)) return "界面优化";
  if (/(操作|上手|流程|操作困难)/.test(main)) return "操作困难";
  if (/(性能|卡顿|慢|性能问题)/.test(main)) return "性能问题";
  return main || "其他";
}

function daysBetween(startISO: string, endISO: string): number {
  if (!startISO || !endISO) return 0;
  const s = new Date(startISO).getTime();
  const e = new Date(endISO).getTime();
  if (Number.isNaN(s) || Number.isNaN(e)) return 0;
  return Math.max(1, Math.round((e - s) / (24 * 60 * 60 * 1000)) + 1);
}

export const DataImport = () => {
  const feedbacks = useFeedbackStore((s) => s.feedbacks);
  const setFeedbacksStore = useFeedbackStore((s) => s.setFeedbacks);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [parsedFeedbacks, setParsedFeedbacks] = useState<Feedback[]>([]);
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setAnalysisResult(null);
      setParsedFeedbacks([]);
    }
  };

  const handleAIAnalysis = async () => {
    if (!uploadedFile) return;
    setIsAnalyzing(true);
    Papa.parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // 兼容字段：问题类型/异动时间区间/异动原因 + 旧字段
        const feedbacks: Feedback[] = (results.data as any[]).map((row, idx) => {
          const rawType = row["问题类型"] ?? row["客诉类型"] ?? row["类型"];
          const rawDate = row["异动时间区间"] ?? row["日期"] ?? row["时间"];
          const rawContent = row["异动原因"] ?? row["客诉内容"] ?? row["内容"];

          const normalizedType = normalizeIssueType(String(rawType || ""));
          const normalizedDate = normalizeDateFromRange(String(rawDate || ""));
          const content = String(rawContent || "");

          return {
            id: row["id"] || `csv_${Date.now()}_${idx}`,
            type: normalizedType,
            content,
            date: normalizedDate,
            product: row["产品类型"] || row["产品"] || "理财通",
          } as Feedback;
        });

        setParsedFeedbacks(feedbacks);
        // 统计分析（动态类型数与跨度天数）
        const categories: Record<string, number> = {};
        let minDate = "", maxDate = "";
        feedbacks.forEach((fb) => {
          categories[fb.type] = (categories[fb.type] || 0) + 1;
          if (fb.date) {
            if (!minDate || fb.date < minDate) minDate = fb.date;
            if (!maxDate || fb.date > maxDate) maxDate = fb.date;
          }
        });
        const spanDays = daysBetween(minDate, maxDate);
        setAnalysisResult({
          totalRecords: feedbacks.length,
          dateRange: minDate && maxDate ? `${minDate} 至 ${maxDate}` : "",
          spanDays,
          categories,
          insights: [
            `本批数据共${feedbacks.length}条，覆盖${spanDays}天，涉及${Object.keys(categories).length}类问题`,
            `最高频问题：${Object.entries(categories).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? "无"}`,
          ],
        });
        setIsAnalyzing(false);
      },
      error: () => {
        setIsAnalyzing(false);
      },
    });
  };

  const handleImport = () => {
    if (parsedFeedbacks.length > 0) {
      // 与现有数据合并而非覆盖
      const current = useFeedbackStore.getState().feedbacks;
      setFeedbacksStore([...current, ...parsedFeedbacks]);
      setUploadedFile(null);
      setParsedFeedbacks([]);
      setAnalysisResult(null);
      alert("数据已成功导入反馈库！");
    }
  };

  const handleClearAllData = () => {
    if (confirm("确定要清除所有历史数据吗？此操作不可恢复！")) {
      setFeedbacksStore([]);
      setShowClearConfirm(false);
      alert("所有历史数据已清除！");
    }
  };

  const sampleData = [
    { field: "问题类型", example: "账户问题/异常账号处理/变更姓名", required: true },
    { field: "异动时间区间", example: "2025/6/3", required: true },
    { field: "异动原因", example: "【无法脱敏数据】共84条...", required: true },
  ];

  return (
    <div className="space-y-6">
      {/* 数据管理工具栏 */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              数据导入管理中心
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                清除历史数据
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                刷新页面
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            当前反馈库共有 {feedbacks.length} 条数据记录
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="ai-analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI智能分析
          </TabsTrigger>
          <TabsTrigger value="api-integration" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            API接入
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-analysis" className="space-y-6">
          {/* CSV上传区域 */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                CSV文件上传
              </CardTitle>
              <CardDescription>
                上传包含客诉数据的CSV文件（支持字段：问题类型、异动时间区间、异动原因），系统将自动分析并提取关键信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">拖拽文件到此处或点击上传</p>
                    <p className="text-sm text-muted-foreground">支持CSV格式，最大文件大小10MB</p>
                  </div>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="mt-4" asChild>
                      <span>选择文件</span>
                    </Button>
                  </label>
                </div>

                {uploadedFile && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Badge variant="outline" className="text-success border-success">
                      已上传
                    </Badge>
                  </div>
                )}

                <Button
                  onClick={handleAIAnalysis}
                  disabled={!uploadedFile || isAnalyzing}
                  className="w-full"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      AI分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      开始AI智能分析
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 数据格式说明 */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>CSV格式要求</CardTitle>
              <CardDescription>
                为确保最佳分析效果，请确保CSV文件包含以下字段
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sampleData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={item.required ? "default" : "secondary"}>
                        {item.required ? "必需" : "可选"}
                      </Badge>
                      <span className="font-medium">{item.field}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.example}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 分析结果 */}
          {analysisResult && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  分析结果
                </CardTitle>
                <CardDescription>
                  AI已完成数据分析，以下是关键发现
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 基础统计 */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{analysisResult.totalRecords}</p>
                      <p className="text-sm text-muted-foreground">总记录数</p>
                    </div>
                    <div className="text-center p-4 bg-success/5 rounded-lg">
                      <p className="text-lg font-bold text-success">{Object.keys(analysisResult.categories).length}</p>
                      <p className="text-sm text-muted-foreground">问题类型</p>
                    </div>
                    <div className="text-center p-4 bg-warning/5 rounded-lg">
                      <p className="text-lg font-bold text-warning">{analysisResult.spanDays}天</p>
                      <p className="text-sm text-muted-foreground">时间跨度</p>
                    </div>
                  </div>

                  {/* 类别分布 */}
                  <div>
                    <h4 className="font-semibold mb-3">问题类型分布</h4>
                    <div className="space-y-2">
                      {Object.entries(analysisResult.categories).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between p-2 rounded">
                          <span>{category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{String(count)}条</span>
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(Number(count) / analysisResult.totalRecords) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI洞察 */}
                  <div>
                    <h4 className="font-semibold mb-3">AI洞察与建议</h4>
                    <div className="space-y-2">
                      {analysisResult.insights.map((insight: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-2">
                          <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleImport} className="w-full">
                    确认导入数据
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="api-integration" className="space-y-6">
          {/* API接入配置 */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                API接口配置
              </CardTitle>
              <CardDescription>
                配置外部系统API接口，实现实时数据同步
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">API端点地址</label>
                  <Input
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    placeholder="https://api.example.com/feedback"
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">请求方法</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>GET</option>
                      <option>POST</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">数据格式</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>JSON</option>
                      <option>XML</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">API密钥</label>
                  <Input
                    type="password"
                    placeholder="输入API密钥"
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    测试连接
                  </Button>
                  <Button className="flex-1">
                    保存配置
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API文档 */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>API接入说明</CardTitle>
              <CardDescription>
                系统支持以下API数据格式
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">标准JSON格式</h4>
                  <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
{`{
  "feedbacks": [
    {
      "id": "fb001",
      "content": "登录功能异常",
      "type": "功能问题",
      "date": "2024-01-15",
      "product": "理财通",
      "status": "pending"
    }
  ]
}`}
                  </pre>
                </div>
                
                <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-warning">注意事项</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        请确保API返回的数据格式符合标准，系统会自动验证数据完整性并进行智能分类。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 清除确认对话框 */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                确认清除数据
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">确定要清除所有 {feedbacks.length} 条历史数据吗？</p>
              <p className="text-sm text-muted-foreground mb-4">此操作不可恢复，请谨慎操作！</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowClearConfirm(false)} className="flex-1">
                  取消
                </Button>
                <Button variant="destructive" onClick={handleClearAllData} className="flex-1">
                  确认清除
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};