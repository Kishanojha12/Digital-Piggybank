import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { format, isValid, parseISO } from "date-fns";

interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon: string;
  color: string;
}

interface SavingsGoalsProps {
  goals: SavingsGoal[];
}

const SavingsGoals: React.FC<SavingsGoalsProps> = ({ goals = [] }) => {
  const [_, navigate] = useLocation();

  // Add a demo goal
  const createDemoGoal = async () => {
    await fetch('/api/savings-goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: "Emergency Fund",
        targetAmount: 50000,
        currentAmount: 10000,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        userId: goals[0]?.userId || 1,
        icon: "savings",
        color: "#4CAF50"
      })
    });
  };

  // Create demo goal if none exist
  useEffect(() => {
    if (goals.length === 0) {
      createDemoGoal();
    }
  }, [goals]);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Savings Goals</h2>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary/80 hover:bg-transparent p-0 flex items-center gap-1"
            onClick={() => navigate("/goals")}
          >
            <span className="material-icons text-sm">add</span>
            <span className="text-sm font-medium">New Goal</span>
          </Button>
        </div>
        
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
              <span className="material-icons text-primary">flag</span>
            </div>
            <p className="font-medium mb-2">No savings goals yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Set up your first financial goal to start saving
            </p>
            <Button onClick={() => navigate("/goals")}>Create Goal</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.slice(0, 3).map((goal) => {
              const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              
              return (
                <div key={goal.id} className="bg-muted/30 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <span className="material-icons text-primary mr-3" style={{ color: goal.color }}>{goal.icon}</span>
                      <div>
                        <h3 className="font-medium">{goal.name}</h3>
                        <p className="text-sm text-muted-foreground">Target: ₹{goal.targetAmount.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold">₹{goal.currentAmount.toLocaleString('en-IN')}</p>
                      {goal.deadline && (
                        <p className="text-xs text-muted-foreground">
                          {format(isValid(new Date(goal.deadline)) ? new Date(goal.deadline) : new Date(), "MMM yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${progress}%`, backgroundColor: goal.color }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}

            {goals.length > 3 && (
              <Button 
                variant="ghost" 
                className="w-full mt-2 text-primary hover:text-primary/80"
                onClick={() => navigate("/goals")}
              >
                Show All Goals
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavingsGoals;
