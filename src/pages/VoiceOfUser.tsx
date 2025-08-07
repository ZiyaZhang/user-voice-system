import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedbackTab } from "@/components/feedback/FeedbackTab";
import { StatsTab } from "@/components/stats/StatsTab";
import { TrendsTab } from "@/components/trends/TrendsTab";
import { AIChat } from "@/components/ai/AIChat";
import { DataImport } from "@/components/data/DataImport";
import { DataManagement } from "@/components/data/DataManagement";
import { Header } from "@/components/layout/Header";

const VoiceOfUser = () => {
  const [activeTab, setActiveTab] = useState("feedback");

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-card rounded-xl p-1">
            <TabsTrigger 
              value="feedback" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium transition-smooth"
            >
              问题反馈
            </TabsTrigger>
            <TabsTrigger 
              value="stats"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium transition-smooth"
            >
              数据统计
            </TabsTrigger>
            <TabsTrigger 
              value="trends"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium transition-smooth"
            >
              趋势分析
            </TabsTrigger>
            <TabsTrigger 
              value="ai"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium transition-smooth"
            >
              AI对话
            </TabsTrigger>
            <TabsTrigger 
              value="import"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium transition-smooth"
            >
              数据导入
            </TabsTrigger>
            <TabsTrigger 
              value="manage"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium transition-smooth"
            >
              数据管理
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="feedback" className="space-y-4">
              <FeedbackTab />
            </TabsContent>
            
            <TabsContent value="stats" className="space-y-4">
              <StatsTab />
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-4">
              <TrendsTab />
            </TabsContent>
            
            <TabsContent value="ai" className="space-y-4">
              <AIChat />
            </TabsContent>
            
            <TabsContent value="import" className="space-y-4">
              <DataImport />
            </TabsContent>
            
            <TabsContent value="manage" className="space-y-4">
              <DataManagement />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default VoiceOfUser;