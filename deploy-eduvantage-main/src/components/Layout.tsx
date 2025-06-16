import React from 'react'
import { GraduationCap, LogOut, MessageCircle, User, Moon, Sun, Search, Settings, Calendar, Home } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import { useTheme } from '../contexts/ThemeContext'
import { motion } from 'framer-motion'

interface LayoutProps {
  children: React.ReactNode
  currentPage?: 'home' | 'dashboard' | 'chat' | 'profile' | 'browse' | 'deadlines'
  onNavigate?: (page: string) => void
}

export function Layout({ children, currentPage = 'dashboard', onNavigate }: LayoutProps) {
  const { user, signOut } = useAuth()
  const { profile } = useUserProfile()
  const { theme, toggleTheme } = useTheme()

  const handleSignOut = async () => {
    await signOut()
  }

  const navigation = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: User },
    { id: 'browse', label: 'Browse', icon: Search },
    { id: 'deadlines', label: 'Deadlines', icon: Calendar },
    { id: 'chat', label: 'AI Advisor', icon: MessageCircle },
  ]

  return (
    <div className="min-h-screen bg-[#6ff2e1] dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">EduVantage</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI University Advisory</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate?.(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      currentPage === item.id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </button>

              {/* Profile Button */}
              <button
                onClick={() => onNavigate?.('profile')}
                className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                  currentPage === 'profile'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                    : 'text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Edit Profile"
              >
                <Settings className="h-5 w-5" />
              </button>

              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {profile?.full_name || user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex items-center justify-around py-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                  currentPage === item.id
                    ? 'text-emerald-600'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
          <button
            onClick={() => onNavigate?.('profile')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
              currentPage === 'profile'
                ? 'text-emerald-600'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}