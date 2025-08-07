import { TrendingUp, MessageSquare } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-white shadow-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg shadow-elegant">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              用户之声
            </h1>
            <p className="text-muted-foreground text-sm">
              腾讯理财通智能反馈分析系统
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};