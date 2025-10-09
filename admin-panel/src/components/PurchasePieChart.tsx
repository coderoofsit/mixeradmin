import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PurchaseData {
  plan: string;
  count: number;
  percentage: number;
}

interface PurchasePieChartProps {
  data: PurchaseData[];
  title: string;
  totalPurchases: number;
  colors?: string[];
}

const PurchasePieChart: React.FC<PurchasePieChartProps> = ({
  data,
  title,
  totalPurchases,
  colors = ['#5D1152', '#7B1FA2', '#9C27B0', '#E1BEE7', '#F3E5F5']
}) => {
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-3">
          <p className="font-medium text-var(--text-primary)">{data.plan}</p>
          <p className="text-sm text-var(--text-secondary)">
            Count: <span className="font-medium">{data.count}</span>
          </p>
          <p className="text-sm text-var(--text-secondary)">
            Percentage: <span className="font-medium">{data.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label function
  const renderLabel = (entry: any) => {
    return `${entry.percentage}%`;
  };

  return (
    <div className="glass-card">
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-4">
        {title}
      </h3>
      <div className="flex items-center justify-center mb-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-var(--primary)">{totalPurchases}</p>
          <p className="text-sm text-var(--text-muted)">Total Purchases</p>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>
                  {value} ({entry.payload?.count || 0})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Additional stats */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {data.map((item, index) => (
          <div key={item.plan} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: colors[index % colors.length] }}
            ></div>
            <span className="text-sm text-var(--text-secondary)">{item.plan}</span>
            <span className="text-sm font-medium text-var(--text-primary) ml-auto">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchasePieChart;
