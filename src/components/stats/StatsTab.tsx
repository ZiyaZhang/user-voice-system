import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, MessageSquare, CheckCircle, Clock } from "lucide-react";

const statsData = [
  { name: "功能问题", value: 45, color: "#3b82f6" },
  { name: "界面优化", value: 30, color: "#10b981" }, 
  { name: "操作困难", value: 15, color: "#f59e0b" },
  { name: "性能问题", value: 10, color: "#ef4444" },
];

const monthlyData = [
  { month: "1月", count: 120 },
  { month: "2月", count: 98 },
  { month: "3月", count: 156 },
  { month: "4月", count: 89 },
  { month: "5月", count: 134 },
  { month: "6月", count: 167 },
];

const trendData = [
  { date: "1/1", value: 12 },
  { date: "1/2", value: 19 },
  { date: "1/3", value: 15 },
  { date: "1/4", value: 25 },
  { date: "1/5", value: 22 },
  { date: "1/6", value: 30 },
  { date: "1/7", value: 28 },
];

export const StatsTab = () => {
  return (
    <div className="space-y-6">
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总反馈数</p>
                <p className="text-3xl font-bold text-primary">1,234</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-success mr-1" />
              <span className="text-success">+12.5%</span>
              <span className="text-muted-foreground ml-1">较上月</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">待处理数</p>
                <p className="text-3xl font-bold text-warning">89</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-warning">-8.2%</span>
              <span className="text-muted-foreground ml-1">较上月</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已解决数</p>
                <p className="text-3xl font-bold text-success">1,145</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-success mr-1" />
              <span className="text-success">+15.3%</span>
              <span className="text-muted-foreground ml-1">较上月</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">解决率</p>
                <p className="text-3xl font-bold text-primary">92.8%</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-success mr-1" />
              <span className="text-success">+2.1%</span>
              <span className="text-muted-foreground ml-1">较上月</span>
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
                  data={statsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statsData.map((entry, index) => (
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
            <CardDescription>最近6个月反馈数量变化</CardDescription>
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