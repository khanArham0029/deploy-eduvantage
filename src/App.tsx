import React, { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useUserProfile } from './hooks/useUserProfile'
import { AuthForm } from './components/AuthForm'
import { ProfileSetup } from './components/ProfileSetup'
import { ProfileEdit } from './components/ProfileEdit'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { ChatInterface } from './components/ChatInterface'
import { UniversitiesBrowse } from './components/UniversitiesBrowse'
import { DeadlineTracker } from './components/DeadlineTracker'
import { HeroScrollDemo } from './components/HeroScrollDemo'

function App() {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useUserProfile()
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard' | 'chat' | 'profile' | 'browse' | 'deadlines'>('home')

  // Show loading spinner while checking authentication
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-[#f4f9fd] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#115bfb] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth form if not authenticated
  if (!user) {
    return <AuthForm />
  }

  // Show profile setup if user doesn't have a complete profile
  if (!profile && currentPage !== 'home') {
    return <ProfileSetup onComplete={() => window.location.reload()} />
  }

  // Show home page without layout
  if (currentPage === 'home') {
    return <HeroScrollDemo onNavigate={setCurrentPage} />
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'browse':
        return <UniversitiesBrowse />
      case 'chat':
        return <ChatInterface />
      case 'profile':
        return <ProfileEdit onNavigate={setCurrentPage} />
      case 'deadlines':
        return <DeadlineTracker onNavigate={setCurrentPage} />
      case 'dashboard':
      default:
        return <Dashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  )
}

export default App