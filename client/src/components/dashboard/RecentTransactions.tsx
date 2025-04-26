import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { format } from "date-fns";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: "deposit" | "withdrawal" | "expense";
  categoryId?: number;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions = [] }) => {
  const [_, navigate] = useLocation();

  // Function to determine icon based on transaction type or category
  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === "deposit") return "savings";
    if (transaction.type === "withdrawal") return "money_off";
    
    // Default icons for expenses by category (this could be enhanced with actual category data)
    const categoryIcons: Record<number, string> = {
      1: "restaurant", // Food & Dining
      2: "directions_car", // Transportation
      3: "local_movies", // Entertainment
      4: "shopping_bag", // Shopping
      5: "home", // Housing
      6: "power", // Utilities
      7: "local_hospital", // Healthcare
      8: "person", // Personal
      9: "school", // Education
      10: "more_horiz" // Other
    };
    
    return transaction.categoryId && categoryIcons[transaction.categoryId]
      ? categoryIcons[transaction.categoryId]
      : "receipt_long";
  };

  // Function to get appropriate color class for the transaction type
  const getAmountColorClass = (type: string) => {
    return type === "deposit" ? "text-accent" : "text-error";
  };

  // Function to format amount with + or - sign
  const formatAmount = (amount: number, type: string) => {
    return type === "deposit" ? `+₹${amount.toLocaleString('en-IN')}` : `-₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Recent Transactions</h2>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary/80 hover:bg-transparent p-0"
            onClick={() => navigate("/transactions")}
          >
            <span>View All</span>
            <span className="material-icons text-sm ml-1">chevron_right</span>
          </Button>
        </div>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
              <span className="material-icons text-primary">receipt_long</span>
            </div>
            <p className="font-medium mb-2">No transactions yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Start tracking your expenses and deposits
            </p>
            <Button onClick={() => navigate("/transactions")}>Add Transaction</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b border-border">
                  <th className="py-3 font-medium">Description</th>
                  <th className="py-3 font-medium">Category</th>
                  <th className="py-3 font-medium">Date</th>
                  <th className="py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-muted last:border-0">
                    <td className="py-3 text-sm">
                      <div className="flex items-center">
                        <span className={`material-icons ${transaction.type === 'deposit' ? 'text-primary' : 'text-muted-foreground'} mr-2`}>
                          {getTransactionIcon(transaction)}
                        </span>
                        <span>{transaction.description}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs 
                        ${transaction.type === 'deposit' 
                          ? 'bg-primary/10 text-primary' 
                          : transaction.type === 'withdrawal'
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-warning-DEFAULT/10 text-warning-DEFAULT'
                        }`}>
                        {transaction.type === 'deposit' 
                          ? 'Savings' 
                          : transaction.type === 'withdrawal'
                            ? 'Withdrawal'
                            : 'Expense'
                        }
                      </span>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {format(new Date(transaction.date), "d MMM yyyy")}
                    </td>
                    <td className={`py-3 text-sm text-right font-mono font-medium ${getAmountColorClass(transaction.type)}`}>
                      {formatAmount(transaction.amount, transaction.type)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
