import React, { useState, useEffect } from 'react';
import API_BASE from './apiConfig';
import styles from './components/EnhancedUI.module.css';
import Button3D from './components/Button3D';
import AdvancedDashboard from './components/AdvancedDashboard';

const PublicSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(9);
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [aiFilter, setAiFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  
  // Advanced features
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' or 'dashboard'

  const fetchSubmissions = async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        page,
        per_page: perPage,
        search: searchTerm,
        sort_by: sortBy,
        order: sortOrder
      };
      
      if (aiFilter) params.ai_used = aiFilter;
      if (agentFilter) params.ai_agent = agentFilter;
      
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE}/api/public/submissions?${queryString}`;
      console.log('Fetching submissions from:', url); // Debug log
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch submissions: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setSubmissions(data.submissions);
      setTotalPages(data.pagination.pages);
      setCurrentPage(data.pagination.page);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError(`An error occurred while fetching submissions: ${error.message}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(currentPage);
  }, [currentPage, searchTerm, aiFilter, agentFilter, sortBy, sortOrder, perPage]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleAiFilter = (e) => {
    setAiFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleAgentFilter = (e) => {
    setAgentFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderSortIndicator = (field) => {
    if (sortBy === field) {
      return sortOrder === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  const aiOptions = [...new Set(submissions.map(s => s.ai_used).filter(Boolean))];
  const agentOptions = [...new Set(submissions.map(s => s.ai_agent).filter(Boolean))];

  const getFileType = (filePath) => {
    if (!filePath) return 'unknown';
    if (filePath.includes('screenshot')) return 'screenshot';
    if (filePath.includes('project')) return 'project';
    return 'file';
  };

  const openSubmissionDetails = (submission) => {
    setSelectedSubmission(submission);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubmission(null);
  };

  // Quick stats calculation
  const stats = {
    totalSubmissions: submissions.length,
    avgReward: submissions.length > 0 
      ? submissions.reduce((sum, s) => sum + s.reward_amount, 0) / submissions.length 
      : 0,
    topAi: submissions.length > 0 
      ? Object.entries(
          submissions.reduce((acc, s) => {
            acc[s.ai_used] = (acc[s.ai_used] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className={`text-3xl md:text-4xl font-bold ${styles.gradientText}`}>Project Gallery</h1>
        <p className="mt-3 text-lg md:text-xl text-gray-600">Explore AI-generated projects from our community</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          className={`py-3 px-6 text-sm font-medium rounded-t-lg transition-all duration-200 ${
            activeTab === 'gallery'
              ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('gallery')}
        >
          Project Gallery
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium rounded-t-lg transition-all duration-200 ${
            activeTab === 'dashboard'
              ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('dashboard')}
        >
          Analytics Dashboard
        </button>
      </div>

      {activeTab === 'dashboard' ? (
        <AdvancedDashboard 
          submissions={submissions} 
          loading={loading} 
          error={error}
          onRefresh={() => fetchSubmissions(currentPage)}
        />
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`${styles.statsCard3d} p-6 text-white transform transition-transform duration-300 hover:scale-105`}>
              <div className="flex items-center">
                <div className="rounded-full bg-white bg-opacity-20 p-3">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white text-opacity-80">Total Submissions</p>
                  <p className="text-2xl font-bold">{stats.totalSubmissions}</p>
                </div>
              </div>
            </div>

            <div className={`${styles.statsCard3d} p-6 text-white transform transition-transform duration-300 hover:scale-105`} style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
              <div className="flex items-center">
                <div className="rounded-full bg-white bg-opacity-20 p-3">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white text-opacity-80">Avg. Reward</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.avgReward)}</p>
                </div>
              </div>
            </div>

            <div className={`${styles.statsCard3d} p-6 text-white transform transition-transform duration-300 hover:scale-105`} style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
              <div className="flex items-center">
                <div className="rounded-full bg-white bg-opacity-20 p-3">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white text-opacity-80">Top AI</p>
                  <p className="text-2xl font-bold">{stats.topAi}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className={`${styles.card3d} p-6 mb-8`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
              <div className="lg:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Projects</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    className={`${styles.input3d} block w-full pl-10 pr-3`}
                    placeholder="Search by Lumen Name, AI, or Agent..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ai-filter" className="block text-sm font-medium text-gray-700 mb-1">AI Model</label>
                <select
                  id="ai-filter"
                  className={`${styles.select3d} block w-full`}
                  value={aiFilter}
                  onChange={handleAiFilter}
                >
                  <option value="">All AI Models</option>
                  {aiOptions.map(ai => (
                    <option key={ai} value={ai}>{ai}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="agent-filter" className="block text-sm font-medium text-gray-700 mb-1">AI Agent</label>
                <select
                  id="agent-filter"
                  className={`${styles.select3d} block w-full`}
                  value={agentFilter}
                  onChange={handleAgentFilter}
                >
                  <option value="">All Agents</option>
                  {agentOptions.map(agent => (
                    <option key={agent} value={agent}>{agent}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="per-page" className="block text-sm font-medium text-gray-700 mb-1">Items per page</label>
                <select
                  id="per-page"
                  className={`${styles.select3d} block w-full`}
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                >
                  <option value="6">6</option>
                  <option value="9">9</option>
                  <option value="12">12</option>
                  <option value="18">18</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-gray-700">Sort by:</span>
                  <select
                    className={`${styles.select3d} py-2 px-3 text-sm`}
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value)}
                  >
                    <option value="timestamp">Date</option>
                    <option value="lumen_name">Name</option>
                    <option value="reward_amount">Reward</option>
                    <option value="ai_used">AI Used</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-indigo-100 text-indigo-700 shadow-inner' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  title="Grid view"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2.5 rounded-lg transition-all duration-200 ${
                    viewMode === 'table' 
                      ? 'bg-indigo-100 text-indigo-700 shadow-inner' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  title="Table view"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`${styles.errorCard3d} mb-8 p-4 rounded-xl`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-white">{error}</p>
                  <p className="text-xs text-white text-opacity-80 mt-1">API Base URL: {API_BASE}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className={styles.spinner3d}></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className={`${styles.card3d} text-center py-20`}>
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-900">No projects found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : viewMode === 'table' ? (
            // Table View
            <div className={`${styles.card3d} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleSort('lumen_name')}
                      >
                        <div className="flex items-center">
                          Lumen Name
                          <span className="ml-1">{renderSortIndicator('lumen_name')}</span>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        AI Model
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        AI Agent
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleSort('reward_amount')}
                      >
                        <div className="flex items-center">
                          Reward
                          <span className="ml-1">{renderSortIndicator('reward_amount')}</span>
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleSort('timestamp')}
                      >
                        <div className="flex items-center">
                          Date
                          <span className="ml-1">{renderSortIndicator('timestamp')}</span>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{submission.lumen_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {submission.ai_used}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.ai_agent || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(submission.reward_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(submission.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.screenshot_path ? (
                            <a 
                              href={`${API_BASE}/${submission.screenshot_path}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              View
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => openSubmissionDetails(submission)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button3D
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm"
                    >
                      Previous
                    </Button3D>
                    <Button3D
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm"
                    >
                      Next
                    </Button3D>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Grid View (Enhanced)
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {submissions.map((submission) => (
                  <div key={submission.id} className={`${styles.card3d} overflow-hidden transform hover:-translate-y-2`}>
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{submission.lumen_name}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                          {submission.ai_used}
                        </span>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-xl font-bold text-gray-900">{formatCurrency(submission.reward_amount)}</p>
                          <p className="text-xs text-gray-500">{formatDate(submission.timestamp)}</p>
                        </div>
                        
                        {submission.screenshot_path && (
                          <a 
                            href={`${API_BASE}/${submission.screenshot_path}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md"
                          >
                            {getFileType(submission.screenshot_path) === 'project' ? 'Project' : 'Screenshot'}
                          </a>
                        )}
                      </div>
                      
                      {submission.ai_agent && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Agent: {submission.ai_agent}
                          </span>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <p className="text-gray-600 text-sm line-clamp-2">{submission.prompt_text}</p>
                      </div>
                      
                      <div className="mt-5">
                        <Button3D
                          onClick={() => openSubmissionDetails(submission)}
                          variant="secondary"
                          className="w-full justify-center px-4 py-2.5 text-sm"
                        >
                          View Details
                        </Button3D>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination for Grid View */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button3D
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm"
                    >
                      Previous
                    </Button3D>
                    <Button3D
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm"
                    >
                      Next
                    </Button3D>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal for Submission Details */}
          {showModal && selectedSubmission && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
                </div>
                
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                
                <div className={`${styles.modal3d} inline-block align-bottom text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full`}>
                  <div className="bg-white px-5 pt-5 pb-4 sm:p-6 sm:pb-5">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                          <h3 className="text-xl leading-6 font-bold text-gray-900">
                            {selectedSubmission.lumen_name}
                          </h3>
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-500"
                            onClick={closeModal}
                          >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">AI Model</p>
                            <p className="mt-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                {selectedSubmission.ai_used}
                              </span>
                            </p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Reward Amount</p>
                            <p className="mt-1 text-lg font-bold text-gray-900">
                              {formatCurrency(selectedSubmission.reward_amount)}
                            </p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">AI Agent</p>
                            <p className="mt-1 text-gray-900">
                              {selectedSubmission.ai_agent || 'Not specified'}
                            </p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</p>
                            <p className="mt-1 text-gray-900">
                              {formatDateTime(selectedSubmission.timestamp)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-5">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt Text</p>
                          <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-900 whitespace-pre-wrap text-sm">
                              {selectedSubmission.prompt_text}
                            </p>
                          </div>
                        </div>
                        
                        {selectedSubmission.screenshot_path && (
                          <div className="mt-5">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded File</p>
                            <div className="mt-2">
                              <a 
                                href={`${API_BASE}/${selectedSubmission.screenshot_path}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md"
                              >
                                <svg className="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download {getFileType(selectedSubmission.screenshot_path) === 'project' ? 'Project' : 'Screenshot'}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PublicSubmissionsPage;