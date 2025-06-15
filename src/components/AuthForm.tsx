import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, Loader2, Moon, Sun, Target, MessageCircle, BookOpen } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn, signUp } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName)
        if (error) throw error
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex transition-colors duration-200">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 left-6 z-50 p-3 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white hover:bg-white/10 dark:hover:bg-gray-800/50 rounded-xl transition-colors backdrop-blur-sm"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </button>

      {/* Left Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo and Header */}
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-12 h-12 bg-[#115bfb] rounded-xl mb-6"
            >
              <GraduationCap className="h-6 w-6 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {isSignUp ? 'Get Started' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isSignUp 
                ? 'Welcome to EduVantage - Let\'s create your account' 
                : 'Sign in to continue your university journey'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#115bfb] focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#115bfb] focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="hi@eduvantage.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    className="text-sm text-[#115bfb] hover:text-[#0d4ad9] transition-colors"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#115bfb] focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#115bfb] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#0d4ad9] focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span>{isSignUp ? 'Sign up' : 'Sign in'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            </span>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#115bfb] hover:text-[#0d4ad9] font-medium transition-colors text-sm"
            >
              {isSignUp ? 'Log in' : 'Sign up'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Brand Content */}
      <div className="flex-1 bg-gradient-to-br from-[#115bfb] to-[#0d4ad9] flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-2xl transform rotate-12"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-white rounded-xl transform -rotate-6"></div>
          <div className="absolute bottom-32 left-32 w-20 h-20 bg-white rounded-lg transform rotate-45"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-white rounded-2xl transform -rotate-12"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 text-white max-w-lg"
        >
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Discover Your
            <br />
            <span className="text-5xl">Perfect University</span>
            <br />
            Match, Today
          </h2>
          
          <p className="text-blue-100 text-lg mb-8 leading-relaxed">
            AI-powered recommendations tailored to your academic profile, career goals, and preferences. 
            Join thousands of students who found their dream university with EduVantage.
          </p>

          {/* Feature Cards */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Smart Matching</h3>
                  <p className="text-blue-100 text-sm">AI analyzes 50+ factors for perfect university matches</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">24/7 AI Advisor</h3>
                  <p className="text-blue-100 text-sm">Get instant answers about admissions and requirements</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Complete Guidance</h3>
                  <p className="text-blue-100 text-sm">From application to enrollment, we guide every step</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 grid grid-cols-3 gap-4"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-blue-100 text-sm">Universities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-blue-100 text-sm">Students Helped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">95%</div>
              <div className="text-blue-100 text-sm">Success Rate</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}