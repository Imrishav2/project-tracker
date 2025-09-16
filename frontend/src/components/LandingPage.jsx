import React, { useState, useEffect } from 'react';
import styles from './EnhancedUI.module.css';
import Button3D from './Button3D';
import { Card3D, StatsCard3D } from './EnhancedComponents';

const LandingPage = ({ onNavigateToForm, onNavigateToGallery }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalRewards: 0,
    activeUsers: 0
  });

  useEffect(() => {
    setIsVisible(true);
    
    // Simulate fetching stats
    const timer = setTimeout(() => {
      setStats({
        totalProjects: 1247,
        totalRewards: 28450.75,
        activeUsers: 892
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: (
        <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "Project Submission",
      description: "Easily submit your AI-generated projects with screenshots or complete project files."
    },
    {
      icon: (
        <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Reward Tracking",
      description: "Track rewards for your contributions and see the value of your AI creations."
    },
    {
      icon: (
        <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Community Gallery",
      description: "Browse and explore projects from other contributors in our community gallery."
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className={`text-4xl tracking-tight font-extrabold ${styles.gradientText} sm:text-5xl md:text-6xl`}>
                  <span className="block">Showcase Your</span>
                  <span className="block">AI Creations</span>
                </h1>
                <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Join our community of AI innovators. Submit your projects, track rewards, and inspire others with your creations.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Button3D
                      onClick={onNavigateToForm}
                      className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md md:py-4 md:text-lg md:px-10"
                    >
                      Submit Your Project
                    </Button3D>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Button3D
                      variant="secondary"
                      onClick={onNavigateToGallery}
                      className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md md:py-4 md:text-lg md:px-10"
                    >
                      View Gallery
                    </Button3D>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-r from-indigo-500 to-purple-600 sm:h-72 lg:h-full lg:w-full flex items-center justify-center">
            <div className="relative w-64 h-64 rounded-full bg-white bg-opacity-20 flex items-center justify-center animate-pulse">
              <div className="absolute inset-4 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                <div className="absolute inset-4 rounded-full bg-white bg-opacity-40 flex items-center justify-center">
                  <svg className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Community Growth</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Join our thriving community
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              See how our platform is empowering AI creators worldwide
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <StatsCard3D
                title="Projects Submitted"
                value={stats.totalProjects.toLocaleString()}
                color="primary"
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
              <StatsCard3D
                title="Total Rewards"
                value={formatCurrency(stats.totalRewards)}
                color="success"
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatsCard3D
                title="Active Creators"
                value={stats.activeUsers.toLocaleString()}
                color="warning"
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to showcase your work
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform provides all the tools to help you share, track, and grow as an AI creator
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card3D key={index} className="p-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600">
                    {feature.icon}
                  </div>
                  <div className="mt-5">
                    <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </Card3D>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to showcase your work?</span>
            <span className="block text-indigo-200">Join our community today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Button3D
                onClick={onNavigateToForm}
                className="px-6 py-3 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Get started
              </Button3D>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;