import React, { useState, useEffect, useMemo } from 'react';
import API_BASE from './apiConfig';
import ProjectDetailsModal from './components/ProjectDetailsModal';

const PublicSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  
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
    
    // Extract just the filename from the path
    const filename = filePath.split('/').pop().split('\\').pop().toLowerCase();
    
    // Check file extension
    if (filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      return 'screenshot';
    }
    
    if (filename.endsWith('.zip') || filename.endsWith('.rar') || filename.endsWith('.7z')) {
      return 'project';
    }
    
    // Fallback to filename content check
    if (filename.includes('screenshot')) return 'screenshot';
    if (filename.includes('project')) return 'project';
    
    return 'file';
  };

  // Quick stats calculation with useMemo for performance
  const stats = useMemo(() => {
    return {
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
  }, [submissions]);

  // Function to open project details modal
  const openProjectDetails = (submission) => {
    setSelectedSubmission(submission);
  };

  // Function to close project details modal
  const closeProjectDetails = () => {
    setSelectedSubmission(null);
  };

  // Extract filename from path (handles both Windows and Unix paths)
  const getFilenameFromPath = (path) => {
    if (!path) return '';
    return path.split(/[\/\\]/).pop();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Project Details Modal */}
      {selectedSubmission && (
        <ProjectDetailsModal 
          submission={selectedSubmission} 
          onClose={closeProjectDetails} 
        />
      )}
      
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Project Gallery</h1>
        <p className="mt-3 text-lg md:text-xl text-gray-600">Explore AI-generated projects from our community</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
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

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
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

        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
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
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
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
              className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
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
              className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
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
              className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
            >
              <option value="6">6</option>
              <option value="9">9</option>
              <option value="12">12</option>
              <option value="18">18</option>
              <option value="24">24</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-700">Sort by:</span>
              <select
                className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
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
                  ? 'bg-blue-100 text-blue-700 shadow-inner' 
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
                  ? 'bg-blue-100 text-blue-700 shadow-inner' 
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
        <div className="bg-red-500 rounded-xl mb-8 p-4 shadow-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-white">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md text-center py-20">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-xl font-medium text-gray-900">No projects found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : viewMode === 'table' ? (
        // Table View
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                    Files
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => {
                  // Count total files (primary + additional)
                  const totalFiles = 1 + (Array.isArray(submission.additional_screenshots) 
                    ? submission.additional_screenshots.length 
                    : (submission.additional_screenshots ? 1 : 0));
                  
                  return (
                    <tr key={submission.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{submission.lumen_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                        {totalFiles} file{totalFiles !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => openProjectDetails(submission)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Grid View
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {submissions.map((submission) => {
              // Count total files (primary + additional)
              const totalFiles = 1 + (Array.isArray(submission.additional_screenshots) 
                ? submission.additional_screenshots.length 
                : (submission.additional_screenshots ? 1 : 0));
              
              return (
                <div key={submission.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{submission.lumen_name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                        {submission.ai_used}
                      </span>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(submission.reward_amount)}</p>
                        <p className="text-xs text-gray-500">{formatDate(submission.timestamp)}</p>
                      </div>
                    </div>
                    
                    {/* Screenshot Preview - Enhanced User Experience */}
                    <div className="mt-4">
                      {/* Primary file display - handle both screenshots and project files */}
                      {getFileType(submission.screenshot_path) === 'screenshot' ? (
                        <div className="rounded-lg overflow-hidden border border-gray-200 mb-2">
                          <img 
                            src={`${API_BASE}/uploads/${getFilenameFromPath(submission.screenshot_path)}`} 
                            alt="Project preview"
                            className="w-full h-36 object-cover transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              console.error('Image load error for:', e.target.src);
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : getFileType(submission.screenshot_path) === 'project' ? (
                        <div className="rounded-lg overflow-hidden border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center h-36 mb-2 p-4">
                          <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="mt-2 text-sm font-medium text-blue-700">Project ZIP File</p>
                          <a 
                            href={`${API_BASE}/uploads/${getFilenameFromPath(submission.screenshot_path)}`} 
                            download
                            className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Download
                          </a>
                        </div>
                      ) : (
                        <div className="rounded-lg overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center h-36 mb-2">
                          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Additional screenshots preview */}
                      {submission.additional_screenshots && (
                        <div className="flex space-x-2 mt-2">
                          {Array.isArray(submission.additional_screenshots) ? (
                            submission.additional_screenshots.slice(0, 3).map((screenshot, index) => (
                              <div key={index} className="rounded-lg overflow-hidden border border-gray-200 w-16 h-16">
                                {getFileType(screenshot) === 'screenshot' ? (
                                  <img 
                                    src={`${API_BASE}/uploads/${getFilenameFromPath(screenshot)}`} 
                                    alt={`Additional preview ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    onError={(e) => {
                                      console.error('Thumbnail load error for:', e.target.src);
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center p-1">
                                    <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-xs text-blue-600 mt-1">ZIP</span>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center w-16 h-16">
                              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          )}
                          {Array.isArray(submission.additional_screenshots) && submission.additional_screenshots.length > 3 && (
                            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center w-16 h-16">
                              <span className="text-xs text-gray-500">+{submission.additional_screenshots.length - 3}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {submission.ai_agent && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                          Agent: {submission.ai_agent}
                        </span>
                      </div>
                    )}
                    
                    {/* File Info */}
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">{totalFiles}</span> file{totalFiles !== 1 ? 's' : ''} attached
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-gray-600 text-sm line-clamp-2">{submission.prompt_text}</p>
                    </div>
                    
                    <div className="mt-4">
                      <button
                        onClick={() => openProjectDetails(submission)}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination for Grid View */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicSubmissionsPage;