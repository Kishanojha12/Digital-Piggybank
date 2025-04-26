import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface ExpenseTrend {
  period: string;
  data: Array<{
    name: string;
    amount: number;
  }>;
}

interface ExpenseTrendsProps {
  trends: ExpenseTrend[];
}

const ExpenseTrends: React.FC<ExpenseTrendsProps> = ({ trends = [] }) => {
  const [period, setPeriod] = useState("3");
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Define colors for chart lines
  const colors = ["#673AB7", "#009688", "#FFC107", "#FF5722", "#4CAF50"];
  
  useEffect(() => {
    if (!trends.length) return;
    
    // Format data for the chart
    const formattedData = trends.map(trend => {
      const month = new Date(trend.period).toLocaleDateString('en-US', { month: 'short' });
      
      // Create data point with month as the key
      const dataPoint: any = { month };
      
      // Add expense categories as keys
      trend.data.forEach(item => {
        dataPoint[item.name] = item.amount;
      });
      
      return dataPoint;
    });
    
    setChartData(formattedData);
  }, [trends]);
  
  // Get unique categories from all trends
  const getUniqueCategories = () => {
    if (!trends.length) return [];
    
    const categories = new Set<string>();
    trends.forEach(trend => {
      trend.data.forEach(item => {
        categories.add(item.name);
      });
    });
    
    return Array.from(categories);
  };
  
  const uniqueCategories = getUniqueCategories();

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Monthly Expense Trends</h2>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] h-8 text-sm">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 months</SelectItem>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="12">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                {uniqueCategories.slice(0, 5).map((category, index) => (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stroke={colors[index % colors.length]}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                  <span className="material-icons text-primary">show_chart</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  No expense trend data available yet
                </p>
              </div>
            </div>
          )}
        </div>
        
        {uniqueCategories.length > 0 && (
          <div className="flex justify-center items-center mt-2 space-x-5">
            {uniqueCategories.slice(0, 5).map((category, index) => (
              <div key={category} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }}></div>
                <span className="text-sm text-muted-foreground">{category}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseTrends;
