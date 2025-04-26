import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProgressCircle from "@/components/ui/progress-circle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { SavingsGoal } from "@shared/schema";

interface PiggyBankSummaryProps {
  totalSavings: number;
  monthlyGrowth: number;
  lastDeposit?: {
    amount: number;
    date: string;
  };
  nextGoal?: {
    name: string;
    targetAmount: number;
    currentAmount: number;
  };
  userId?: number;
}

const PiggyBankSummary: React.FC<PiggyBankSummaryProps> = ({
  totalSavings,
  monthlyGrowth,
  lastDeposit,
  nextGoal,
  userId,
}) => {
  const { toast } = useToast();
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [selectedGoalId, setSelectedGoalId] = useState("");

  // Calculate progress percentage for next goal
  const goalProgress = nextGoal
    ? Math.min(100, Math.round((nextGoal.currentAmount / nextGoal.targetAmount) * 100))
    : 0;

  // Fetch savings goals for the dropdown
  const { data: goals } = useQuery({
    queryKey: ['/api/savings-goals', userId],
    enabled: !!userId,
  });

  // Mutation for adding money (general deposit)
  const addMoneyMutation = useMutation({
    mutationFn: (data: { amount: number, description: string }) => {
      return apiRequest('POST', '/api/transactions', {
        userId,
        amount: data.amount,
        description: data.description,
        type: 'deposit',
        date: new Date().toISOString(),
        categoryId: 1, // Default category for testing
      });
    },
    onSuccess: async () => {
      toast({
        title: "Money added",
        description: `₹${amount.toLocaleString('en-IN')} has been added to your account`,
      });
      setAddMoneyOpen(false);
      setAmount(0);
      await queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add money. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for transferring funds to a goal
  const transferMutation = useMutation({
    mutationFn: (data: { amount: number, goalId: number, goalName: string }) => {
      return apiRequest('POST', '/api/transactions', {
        userId,
        amount: data.amount, //Corrected typo here
        description: `Transfer to ${data.goalName}`,
        type: 'deposit',
        goalId: data.goalId,
        date: new Date().toISOString(),
      });
    },
    onSuccess: async () => {
      toast({
        title: "Transfer successful",
        description: `₹${transferAmount.toLocaleString('en-IN')} has been transferred to your goal`,
      });
      setTransferOpen(false);
      setTransferAmount(0);
      setSelectedGoalId("");
      await queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/savings-goals', userId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to transfer funds. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddMoney = () => {
    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a positive amount",
        variant: "destructive",
      });
      return;
    }

    addMoneyMutation.mutate({ 
      amount,
      description: "General deposit" 
    });
  };

  const handleTransfer = () => {
    if (transferAmount <= 0 || !selectedGoalId) {
      toast({
        title: "Invalid input",
        description: "Please enter a positive amount and select a goal",
        variant: "destructive",
      });
      return;
    }

    const selectedGoal = goals?.find(goal => goal.id === parseInt(selectedGoalId));
    if (!selectedGoal) return;

    transferMutation.mutate({
      amount: transferAmount,
      goalId: parseInt(selectedGoalId),
      goalName: selectedGoal.name,
    });
  };

  return (
    <>
      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Your Digital Piggy Bank</h2>
            <button className="text-primary hover:text-primary/80 font-medium text-sm flex items-center">
              <span>View Details</span>
              <span className="material-icons text-sm ml-1">chevron_right</span>
            </button>
          </div>

        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="relative w-48 h-48 mb-4 md:mb-0 md:mr-6 flex-shrink-0">
            <ProgressCircle
              percentage={goalProgress}
              size={170}
              strokeWidth={4}
              circleColor="#E0E0E0"
              progressColor="#FFD700"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="material-icons text-5xl text-primary mb-1">savings</span>
                  <p className="text-sm font-medium">{goalProgress}%</p>
                </div>
              </div>
            </ProgressCircle>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Total Savings</p>
                <p className="font-mono font-semibold text-2xl">₹{totalSavings.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Monthly Growth</p>
                <div className="flex items-center">
                  <p className={`font-mono font-semibold text-2xl ${monthlyGrowth >= 0 ? 'text-accent' : 'text-red-500'}`}>
                    {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}%
                  </p>
                  <span className={`material-icons ml-1 ${monthlyGrowth >= 0 ? 'text-accent' : 'text-red-500'}`}>
                    {monthlyGrowth >= 0 ? 'trending_up' : 'trending_down'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Last Deposit</p>
                {lastDeposit ? (
                  <>
                    <p className="font-mono font-semibold text-xl">₹{lastDeposit.amount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(lastDeposit.date), "MMM d, yyyy")}
                    </p>
                  </>
                ) : (
                  <p className="font-mono text-muted-foreground">No recent deposits</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Next Goal Target</p>
                {nextGoal ? (
                  <>
                    <div className="flex items-center">
                      <p className="font-mono font-semibold text-xl">₹{nextGoal.targetAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-full h-2 bg-slate-200 rounded-full mt-1">
                        <div 
                          className="h-full bg-secondary rounded-full" 
                          style={{ width: `${goalProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs ml-2 font-medium">{goalProgress}%</span>
                    </div>
                  </>
                ) : (
                  <p className="font-mono text-muted-foreground">No goals set</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <Button 
                className="mr-3 bg-primary hover:bg-primary/90"
                onClick={() => setAddMoneyOpen(true)}
              >
                Add Money
              </Button>
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/10"
                onClick={() => setTransferOpen(true)}
              >
                Transfer Funds
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

      {/* Add Money Dialog */}
      <Dialog open={addMoneyOpen} onOpenChange={setAddMoneyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Money to Your Piggy Bank</DialogTitle>
            <DialogDescription>Enter the amount you want to add to your account.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="1000" 
                value={amount || ''}
                onChange={(e) => setAmount(parseInt(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMoneyOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddMoney} 
              disabled={addMoneyMutation.isPending || amount <= 0}
            >
              {addMoneyMutation.isPending ? "Processing..." : "Add Money"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Funds Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer to Savings Goal</DialogTitle>
            <DialogDescription>Transfer money to one of your savings goals.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="goal">Select Goal</Label>
              <Select 
                value={selectedGoalId} 
                onValueChange={setSelectedGoalId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  {goals && Array.isArray(goals) && goals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id.toString()}>
                      {goal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="transfer-amount">Amount (₹)</Label>
              <Input 
                id="transfer-amount" 
                type="number" 
                placeholder="1000" 
                value={transferAmount || ''}
                onChange={(e) => setTransferAmount(parseInt(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleTransfer} 
              disabled={transferMutation.isPending || transferAmount <= 0 || !selectedGoalId}
            >
              {transferMutation.isPending ? "Processing..." : "Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PiggyBankSummary;