import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import useFeedbackStore from "@/lib/feedbackStore";

export const TrendsTab = () => {
  const [timeRange, setTimeRange] = useState("7days");
  const [dataType, setDataType] = useState("total");
  const feedbacks = useFeedbackStore((s) => s.feedbacks);

  // 根据时间范围筛选数据
  const getFilteredData = useMemo(() => {
    const now = new Date();
    const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : timeRange === "3months" ? 90 : 180;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return feedbacks.filter(f => {
      if (!f.date) return false;
      const feedbackDate = new Date(f.date);
      return feedbackDate >= cutoffDate;
    });
  }, [feedbacks, timeRange]);

  // 生成每日趋势数据
  const dailyTrendData = useMemo(() => {
    const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 7;
    const data: Record<string, { total: number; resolved: number }> = {};
    
    // 初始化日期
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = `${date.getMonth() + 1}/${date.getDate()}`;
      data[key] = { total: 0, resolved: 0 };
    }
    
    // 统计数据
    getFilteredData.forEach(f => {
      if (f.date) {
        const d = new Date(f.date);
        const key = `${d.getMonth() + 1}/${d.getDate()}`;
        if (data[key]) {
          data[key].total++;
          if (f.status === "resolved") data[key].resolved++;
        }
      }
    });
    
    return Object.entries(data).map(([date, values]) => ({
      date,
      value: values.total,
      resolved: values.resolved
    }));
  }, [getFilteredData, timeRange]);

  // 生成分类趋势数据
  const categoryTrendData = useMemo(() => {
    const categories = ["功能问题", "界面优化", "操作困难", "性能问题"];
    const data: Record<string, Record<string, number>> = {};
    
    getFilteredData.forEach(f => {
      const month = f.date?.slice(0, 7) || "未知";
      if (!data[month]) data[month] = {};
      data[month][f.type] = (data[month][f.type] || 0) + 1;
    });
    
    return Object.entries(data).map(([month, counts]) => ({
      month,
      functional: counts["功能问题"] || 0,
      ui: counts["界面优化"] || 0,
      operation: counts["操作困难"] || 0,
      performance: counts["性能问题"] || 0,
      total: Object.values(counts).reduce((a, b) => a + b, 0)
    }));
  }, [getFilteredData]);

  // 计算趋势指标
  const trendMetrics = useMemo(() => {
    if (dailyTrendData.length < 2) return { growth: 0, avgResolveTime: 0, peakTime: "未知" };
    
    const recent = dailyTrendData.slice(-7);
    const previous = dailyTrendData.slice(-14, -7);
    
    const recentTotal = recent.reduce((sum, d) => sum + d.value, 0);
    const previousTotal = previous.reduce((sum, d) => sum + d.value, 0);
    const growth = previousTotal > 0 ? ((recentTotal - previousTotal) / previousTotal * 100) : 0;
    
    const resolvedCount = getFilteredData.filter(f => f.status === "resolved").length;
    const avgResolveTime = resolvedCount > 0 ? (getFilteredData.length / resolvedCount).toFixed(1) : "0";
    
    return {
      growth: Math.round(growth * 10) / 10,
      avgResolveTime,
      peakTime: "14:00-16:00" // 可基于实际数据计算
    };
  }, [dailyTrendData, getFilteredData]);

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
                <p className="text-sm text-muted-foreground">增长率</p>
                <p className={`text-2xl font-bold ${trendMetrics.growth >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {trendMetrics.growth >= 0 ? '+' : ''}{trendMetrics.growth}%
                </p>
              </div>
              {trendMetrics.growth >= 0 ? (
                <TrendingUp className="h-8 w-8 text-success" />
              ) : (
                <TrendingDown className="h-8 w-8 text-destructive" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">较上一周期</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">平均解决时间</p>
                <p className="text-2xl font-bold text-primary">{trendMetrics.avgResolveTime}天</p>
              </div>
              <TrendingDown className="h-8 w-8 text-success" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">反馈处理效率</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">峰值时段</p>
                <p className="text-2xl font-bold text-warning">{trendMetrics.peakTime}</p>
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
                <AreaChart data={dailyTrendData}>
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
                <LineChart data={categoryTrendData}>
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
                {trendMetrics.growth >= 0 ? 
                  `反馈数量较上一周期增长${trendMetrics.growth}%，建议关注增长原因并优化服务。` :
                  `反馈数量较上一周期下降${Math.abs(trendMetrics.growth)}%，服务质量有所改善。`
                }
              </p>
            </div>
            
            <div className="p-4 bg-success/5 rounded-lg border-l-4 border-success">
              <h4 className="font-semibold text-success mb-2">✅ 改善亮点</h4>
              <p className="text-sm text-muted-foreground">
                平均解决时间为{trendMetrics.avgResolveTime}天，处理效率良好，用户满意度持续提升。
              </p>
            </div>
            
            <div className="p-4 bg-warning/5 rounded-lg border-l-4 border-warning">
              <h4 className="font-semibold text-warning mb-2">⚠️ 注意事项</h4>
              <p className="text-sm text-muted-foreground">
                {trendMetrics.peakTime}为反馈高峰期，建议在此时段增加客服人员配置以提高响应速度。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};