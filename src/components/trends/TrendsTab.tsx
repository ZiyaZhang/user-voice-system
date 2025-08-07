import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";

const weeklyData = [
  { date: "周一", value: 15, resolved: 12 },
  { date: "周二", value: 23, resolved: 18 },
  { date: "周三", value: 18, resolved: 15 },
  { date: "周四", value: 31, resolved: 25 },
  { date: "周五", value: 28, resolved: 22 },
  { date: "周六", value: 12, resolved: 10 },
  { date: "周日", value: 8, resolved: 7 },
];

const monthlyTrendData = [
  { month: "1月", total: 234, functional: 89, ui: 67, operation: 45, performance: 33 },
  { month: "2月", total: 198, functional: 76, ui: 58, operation: 38, performance: 26 },
  { month: "3月", total: 267, functional: 102, ui: 78, operation: 52, performance: 35 },
  { month: "4月", total: 189, functional: 72, ui: 55, operation: 37, performance: 25 },
  { month: "5月", total: 245, functional: 94, ui: 71, operation: 48, performance: 32 },
  { month: "6月", total: 289, functional: 110, ui: 85, operation: 57, performance: 37 },
];

export const TrendsTab = () => {
  const [timeRange, setTimeRange] = useState("7days");
  const [dataType, setDataType] = useState("total");

  return (
    <div className="space-y-6">
      {/* 时间范围和数据类型选择 */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            趋势分析设置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="选择时间范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">最近7天</SelectItem>
                <SelectItem value="30days">最近30天</SelectItem>
                <SelectItem value="3months">最近3个月</SelectItem>
                <SelectItem value="6months">最近6个月</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dataType} onValueChange={setDataType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="选择数据类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">总体趋势</SelectItem>
                <SelectItem value="category">分类趋势</SelectItem>
                <SelectItem value="resolution">解决率趋势</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              导出数据
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 趋势指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">本周增长率</p>
                <p className="text-2xl font-bold text-success">+12.5%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">较上周同期</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">解决速度</p>
                <p className="text-2xl font-bold text-primary">2.3天</p>
              </div>
              <TrendingDown className="h-8 w-8 text-success" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">平均解决时间</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">峰值时段</p>
                <p className="text-2xl font-bold text-warning">14:00-16:00</p>
              </div>
              <Calendar className="h-8 w-8 text-warning" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">反馈集中时间</p>
          </CardContent>
        </Card>
      </div>

      {/* 主要趋势图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {timeRange === "7days" && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>每日反馈趋势</CardTitle>
              <CardDescription>最近7天反馈数量和解决情况</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="总反馈"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="resolved" 
                    stackId="2"
                    stroke="#10b981" 
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="已解决"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {timeRange === "6months" && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>月度分类趋势</CardTitle>
              <CardDescription>最近6个月各类问题变化趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="functional" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="功能问题"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ui" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="界面优化"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="operation" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    name="操作困难"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="性能问题"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 趋势洞察 */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>趋势洞察</CardTitle>
          <CardDescription>基于数据分析的关键发现</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
              <h4 className="font-semibold text-primary mb-2">📈 增长趋势</h4>
              <p className="text-sm text-muted-foreground">
                本周反馈数量较上周增长12.5%，主要集中在功能问题类别，建议重点关注产品稳定性。
              </p>
            </div>
            
            <div className="p-4 bg-success/5 rounded-lg border-l-4 border-success">
              <h4 className="font-semibold text-success mb-2">✅ 改善亮点</h4>
              <p className="text-sm text-muted-foreground">
                平均解决时间从3.1天降低至2.3天，解决效率提升25.8%，用户满意度明显提升。
              </p>
            </div>
            
            <div className="p-4 bg-warning/5 rounded-lg border-l-4 border-warning">
              <h4 className="font-semibold text-warning mb-2">⚠️ 注意事项</h4>
              <p className="text-sm text-muted-foreground">
                下午2-4点为反馈高峰期，建议在此时段增加客服人员配置以提高响应速度。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};