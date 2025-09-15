import React, { useState, useEffect } from 'react';
import { Card3D, StatsCard3D, Badge3D, Alert3D } from './EnhancedComponents';
import styles from './EnhancedUI.module.css';
import Button3D from './Button3D';

const AdvancedDashboard = ({ submissions, loading, error, onRefresh }) => {
  const [timeRange, setTimeRange] = useState('all');
  const [chartData, setChartData] = useState([]);

  // Calculate advanced statistics
  const calculateStats = () => {
    if (!submissions || submissions.length === 0) return {
      totalSubmissions: 0,
      totalRewards: 0,
      avgReward: 0,
      topAI: 'N/A',
      topAgent: 'N/A',
      recentSubmissions: 0
    };

    // Filter submissions by time range
    let filteredSubmissions = [...submissions];
    const now = new Date();
    
    if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredSubmissions = submissions.filter(s => new Date(s.timestamp) > weekAgo);
    } else if (timeRange === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filteredSubmissions = submissions.filter(s => new Date(s.timestamp) > monthAgo);
    }

    // Calculate statistics
    const totalSubmissions = filteredSubmissions.length;
    const totalRewards = filteredSubmissions.reduce((sum, s) => sum + s.reward_amount, 0);
    const avgReward = totalSubmissions > 0 ? totalRewards / totalSubmissions : 0;
    
    // Top AI model
    const aiCounts = filteredSubmissions.reduce((acc, s) => {
      acc[s.ai_used] = (acc[s.ai_used] || 0) + 1;
      return acc;
    }, {});
    const topAI = Object.keys(aiCounts).length > 0 
      ? Object.entries(aiCounts).sort((a, b) => b[1] - a[1])[0][0] 
      : 'N/A';
    
    // Top AI agent
    const agentCounts = filteredSubmissions.reduce((acc, s) => {
      acc[s.ai_agent] = (acc[s.ai_agent] || 0) + 1;
      return acc;
    }, {});
    const topAgent = Object.keys(agentCounts).length > 0 
      ? Object.entries(agentCounts).sort((a, b) => b[1] - a[1])[0][0] 
      : 'N/A';
    
    // Recent submissions (last 24 hours)
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentSubmissions = submissions.filter(s => new Date(s.timestamp) > dayAgo).length;

    return {
      totalSubmissions,
      totalRewards,
      avgReward: parseFloat(avgReward.toFixed(2)),
      topAI,
      topAgent,
      recentSubmissions
    };
  };

  const stats = calculateStats();

  // Generate chart data for submissions over time
  useEffect(() => {
    if (!submissions || submissions.length === 0) {
      setChartData([]);
      return;
    }

    // Group submissions by date
    const grouped = submissions.reduce((acc, submission) => {
      const date = new Date(submission.timestamp).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Convert to chart data format
    const chartDataArray = Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7); // Last 7 days

    setChartData(chartDataArray);
  }, [submissions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`${styles.spinner3d} mr-3`}></div>
        <span className="text-lg text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert3D variant="danger" title="Error Loading Data">
        {error}
        <div className="mt-4">
          <Button3D onClick={onRefresh}>Retry</Button3D>
        </div>
      </Alert3D>
    );
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {['all', 'week', 'month'].map((range) => (
            <button
              key={range}
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                timeRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } ${range === 'all' ? 'rounded-l-md' : ''} ${
                range === 'month' ? 'rounded-r-md' : ''
              }`}
              onClick={() => setTimeRange(range)}
            >
              {range === 'all' ? 'All Time' : range === 'week' ? 'Last Week' : 'Last Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard3D
          title="Total Submissions"
          value={stats.totalSubmissions}
          color="primary"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        
        <StatsCard3D
          title="Total Rewards"
          value={`$${stats.totalRewards.toFixed(2)}`}
          color="success"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <StatsCard3D
          title="Avg. Reward"
          value={`$${stats.avgReward}`}
          color="warning"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        
        <StatsCard3D
          title="Recent (24h)"
          value={stats.recentSubmissions}
          color="info"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Chart and Top Models */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions Chart */}
        <Card3D className="lg:col-span-2 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Submissions Over Time</h3>
          <div className="h-64 flex items-end space-x-2">
            {chartData.length > 0 ? (
              chartData.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t-md transition-all duration-300 hover:opacity-75"
                    style={{ height: `${(data.count / Math.max(...chartData.map(d => d.count))) * 100}%` }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2 truncate w-full text-center">
                    {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs font-medium text-gray-900 mt-1">
                    {data.count}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </Card3D>

        {/* Top Models */}
        <div className="space-y-6">
          <Card3D className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top AI Models</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">GPT-5</span>
                <Badge3D variant="primary">42%</Badge3D>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Claude</span>
                <Badge3D variant="secondary">28%</Badge3D>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">LLaMA</span>
                <Badge3D variant="success">18%</Badge3D>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Gemini</span>
                <Badge3D variant="warning">12%</Badge3D>
              </div>
            </div>
          </Card3D>

          <Card3D className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top AI Agents</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cursor</span>
                <Badge3D variant="info">35%</Badge3D>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">GitHub Copilot</span>
                <Badge3D variant="primary">25%</Badge3D>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Replit</span>
                <Badge3D variant="secondary">20%</Badge3D>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Codeium</span>
                <Badge3D variant="success">15%</Badge3D>
              </div>
            </div>
          </Card3D>
        </div>
      </div>

      {/* Recent Activity */}
      <Card3D className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <Button3D variant="secondary" onClick={onRefresh} className="text-sm">
            Refresh
          </Button3D>
        </div>
        
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI Model
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reward
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.slice(0, 5).map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-800 font-medium">
                          {submission.lumen_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{submission.lumen_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge3D variant="primary">{submission.ai_used}</Badge3D>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {submission.ai_agent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-green-600">
                      ${submission.reward_amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(submission.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card3D>
    </div>
  );
};

export default AdvancedDashboard;