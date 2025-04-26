import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SpendingCategory {
  categoryId: number;
  name: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
}

interface SpendingCategoriesProps {
  categories: SpendingCategory[];
}

const SpendingCategories: React.FC<SpendingCategoriesProps> = ({ categories = [] }) => {
  const [period, setPeriod] = useState("month");

  // Calculate total spending
  const totalSpending = categories.reduce((sum, category) => sum + category.amount, 0);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Spending Categories</h2>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[130px] h-8 text-sm">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="last-month">Last month</SelectItem>
              <SelectItem value="3-months">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
              <span className="material-icons text-primary">pie_chart</span>
            </div>
            <p className="text-sm text-muted-foreground">
              No spending data available yet
            </p>
          </div>
        ) : (
          <>
            <div className="h-[200px] mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3 mt-2">
              {categories.map((category) => (
                <div 
                  key={category.categoryId} 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: category.color }}></div>
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-medium">₹{category.amount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground">{Math.round(category.percentage)}%</p>
                  </div>
                </div>
              ))}
              
              <div className="pt-2 border-t border-border mt-2">
                <div className="flex justify-between items-center font-medium">
                  <span>Total</span>
                  <span className="font-mono">₹{totalSpending.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SpendingCategories;
