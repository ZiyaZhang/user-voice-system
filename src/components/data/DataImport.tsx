import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileSpreadsheet, Sparkles, Globe, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const DataImport = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [apiEndpoint, setApiEndpoint] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setAnalysisResult(null);
    }
  };

  const handleAIAnalysis = async () => {
    if (!uploadedFile) return;
    
    setIsAnalyzing(true);
    
    // 模拟AI分析过程
    setTimeout(() => {
      setAnalysisResult({
        totalRecords: 1234,
        dateRange: "2024-01-01 至 2024-01-15",
        categories: {
          "功能问题": 567,
          "界面优化": 234,
          "操作困难": 123,
          "性能问题": 89,
          "其他": 221
        },
        insights: [
          "检测到567条功能问题反馈，占比46%",
          "发现集中在登录模块的问题较多",
          "用户满意度平均分为4.2/5",
          "建议优先处理高频功能问题"
        ]
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const sampleData = [
    { field: "客诉内容", example: "登录时出现异常错误", required: true },
    { field: "日期", example: "2024-01-15", required: true },
    { field: "客诉类型", example: "功能问题", required: true },
    { field: "用户ID", example: "user123", required: false },
    { field: "产品类型", example: "理财通", required: false },
  ];

  return (
    <div className="space-y-6">
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
                上传包含客诉数据的CSV文件，AI将自动分析并提取关键信息
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
                      <p className="text-lg font-bold text-success">5</p>
                      <p className="text-sm text-muted-foreground">问题类型</p>
                    </div>
                    <div className="text-center p-4 bg-warning/5 rounded-lg">
                      <p className="text-lg font-bold text-warning">15天</p>
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

                  <Button className="w-full">
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
      "date": "2024-01-15T10:30:00Z",
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
    </div>
  );
};