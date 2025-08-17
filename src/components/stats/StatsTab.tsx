import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, MessageSquare, CheckCircle, Clock } from "lucide-react";
import useFeedbackStore from "@/lib/feedbackStore";
import { useMemo } from "react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6", "#f43f5e"];

export const StatsTab = () => {
  const feedbacks = useFeedbackStore((s) => s.feedbacks);

  // 关键指标
  const total = feedbacks.length;
  const pending = feedbacks.filter(f => f.status === "pending").length;
  const resolved = feedbacks.filter(f => f.status === "resolved").length;
  const solveRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : "0.0";

  // 类型分布
  const typeStats = useMemo(() => {
    const map: Record<string, number> = {};
    feedbacks.forEach(f => {
      map[f.type] = (map[f.type] || 0) + 1;
    });
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
  }, [feedbacks]);

  // 月度统计（按月份分组）
  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    feedbacks.forEach(f => {
      const month = f.date?.slice(0, 7) || "未知"; // yyyy-mm
      map[month] = (map[month] || 0) + 1;
    });
    return Object.entries(map).map(([month, count]) => ({ month, count }));
  }, [feedbacks]);

  // 近7天趋势
  const trendData = useMemo(() => {
    const days: Record<string, number> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      days[key] = 0;
    }
    feedbacks.forEach(f => {
      if (f.date) {
        const d = new Date(f.date);
        const key = `${d.getMonth() + 1}/${d.getDate()}`;
        if (key in days) days[key]++;
      }
    });
    return Object.entries(days).map(([date, value]) => ({ date, value }));
  }, [feedbacks]);

  return (
    <div className="space-y-6">
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总反馈数</p>
                <p className="text-3xl font-bold text-primary">{total}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">待处理数</p>
                <p className="text-3xl font-bold text-warning">{pending}</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已解决数</p>
                <p className="text-3xl font-bold text-success">{resolved}</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">解决率</p>
                <p className="text-3xl font-bold text-primary">{solveRate}%</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 问题类型分布饼图 */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>问题类型分布</CardTitle>
            <CardDescription>各类问题反馈占比情况</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {typeStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* 月度反馈统计柱状图 */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>月度反馈统计</CardTitle>
            <CardDescription>按月统计反馈数量</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      {/* 客诉趋势图 */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>客诉数量变化趋势</CardTitle>
          <CardDescription>最近7天客诉数量变化情况</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};