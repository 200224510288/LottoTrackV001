// SalesAnalyticsChart.js
'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  TooltipProps
} from 'recharts';

interface SalesData {
  date: string;
  amount: string;
  count: string;
}

const SalesAnalyticsChart = ({ data }: { data: SalesData[] }) => {
  const [chartType, setChartType] = useState('line');
  const [viewMode, setViewMode] = useState('amount'); // 'amount' or 'count'
  
  // Format date for display
  const formatDate = (dateStr: string | number | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Format data for chart
  const chartData = data.map(item => ({
    date: formatDate(item.date),
    amount: parseFloat(item.amount),
    count: parseInt(item.count),
    rawDate: new Date(item.date).getTime() // for sorting
  }));
  
  // Sort by date
  chartData.sort((a, b) => a.rawDate - b.rawDate);
  
  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return `Rs ${value.toFixed(2)}`;
  };
  
  const renderTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-gray-800">{label}</p>
          <p className="text-indigo-600">
            <span className="inline-block w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
            {viewMode === 'amount' 
              ? `Sales: ${payload[0].value !== undefined ? formatCurrency(payload[0].value) : 'N/A'}` 
              : `Orders: ${payload[0].value}`}
          </p>
          {chartType === 'composed' && (
            <p className="text-blue-600">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Orders: {payload[1].value}
            </p>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="w-full h-full">
      {/* Chart controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              chartType === 'line' 
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setChartType('line')}
          >
            Line
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              chartType === 'bar' 
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setChartType('bar')}
          >
            Bar
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              chartType === 'composed' 
                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setChartType('composed')}
          >
            Combined
          </button>
        </div>
        
        {chartType !== 'composed' && (
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                viewMode === 'amount' 
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('amount')}
            >
              Sales Amount
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                viewMode === 'count' 
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('count')}
            >
              Order Count
            </button>
          </div>
        )}
      </div>
      
      {/* Chart display */}
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'line' ? (
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e0e0e0' }}
              tickFormatter={(value) => viewMode === 'amount' ? `Rs ${value}` : value}
            />
            <Tooltip content={renderTooltip} />
            <Tooltip content={(props) => renderTooltip(props as TooltipProps<number, string>)} />
            <Line
              type="monotone"
              dataKey={viewMode}
              name={viewMode === 'amount' ? 'Sales Amount' : 'Orders'}
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        ) : chartType === 'bar' ? (
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e0e0e0' }}
              tickFormatter={(value) => viewMode === 'amount' ? `Rs ${value}` : value}
            />
            <Tooltip content={renderTooltip} />
            <Legend />
            <Bar
              dataKey={viewMode}
              name={viewMode === 'amount' ? 'Sales Amount' : 'Orders'}
              fill="#4f46e5"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        ) : (
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e0e0e0' }}
              tickFormatter={(value) => `Rs ${value}`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <Tooltip content={renderTooltip} />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="amount" 
              name="Sales Amount" 
              fill="#4f46e5" 
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="count" 
              name="Orders" 
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </ComposedChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default SalesAnalyticsChart;