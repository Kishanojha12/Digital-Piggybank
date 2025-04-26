import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface AiAdviceProps {
  recommendations: Array<{
    id: number;
    content: string;
    type: "savings" | "investment" | "expense";
    title?: string;
  }>;
  onGenerateInsights: () => Promise<void>;
}

const AiAdvice: React.FC<AiAdviceProps> = ({ recommendations = [], onGenerateInsights }) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateInsights = async () => {
    try {
      setIsGenerating(true);
      await onGenerateInsights();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to get appropriate icon and style based on recommendation type
  const getRecommendationStyles = (type: string) => {
    switch (type) {
      case "savings":
        return {
          icon: "tips_and_updates",
          bgColor: "bg-primary-light bg-opacity-10",
          borderColor: "border-primary",
          iconColor: "text-primary",
          title: "Smart Saving Tip"
        };
      case "investment":
        return {
          icon: "trending_up",
          bgColor: "bg-accent-light bg-opacity-10",
          borderColor: "border-accent",
          iconColor: "text-accent",
          title: "Investment Opportunity"
        };
      case "expense":
        return {
          icon: "receipt_long",
          bgColor: "bg-warning-DEFAULT bg-opacity-10",
          borderColor: "border-warning-DEFAULT",
          iconColor: "text-warning-DEFAULT",
          title: "Expense Management"
        };
      default:
        return {
          icon: "auto_awesome",
          bgColor: "bg-primary-light bg-opacity-10",
          borderColor: "border-primary",
          iconColor: "text-primary",
          title: "Financial Insight"
        };
    }
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">AI Insights</h2>
          <span className="material-icons text-primary">auto_awesome</span>
        </div>
        
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.slice(0, 2).map((recommendation) => {
              const styles = getRecommendationStyles(recommendation.type);
              return (
                <div
                  key={recommendation.id}
                  className={`${styles.bgColor} rounded-lg p-4 border-l-4 ${styles.borderColor}`}
                >
                  <div className="flex items-start">
                    <span className={`material-icons ${styles.iconColor} mr-3`}>{styles.icon}</span>
                    <div>
                      <h3 className="font-medium text-foreground">{recommendation.title || styles.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{recommendation.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
              <span className="material-icons text-primary">lightbulb</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Generate AI insights based on your financial data
            </p>
          </div>
        )}
        
        <Button
          onClick={handleGenerateInsights}
          disabled={isGenerating}
          variant="outline"
          className="w-full mt-4 border-primary text-primary hover:bg-primary/10"
        >
          <span className="material-icons mr-2 text-sm">refresh</span>
          <span>{isGenerating ? "Generating..." : "Get More Insights"}</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default AiAdvice;
