import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, User, Search, Calendar, GraduationCap, DollarSign, MapPin, Book } from 'lucide-react'
import { useUserProfile } from '../hooks/useUserProfile'

interface DashboardProps {
  onNavigate: (page: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { profile } = useUserProfile()

  const stats = [
    {
      label: 'Profile Completion',
      value: '100%',
      icon: User,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      label: 'Universities Available',
      value: '10K+',
      icon: GraduationCap,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20'
    },
    {
      label: 'AI Advisor',
      value: 'Online',
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    }
  ]

  const actions = [
    {
      title: 'Browse Universities',
      description: 'Explore our comprehensive database of university programs and courses.',
      icon: Search,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      action: () => onNavigate('browse')
    },
    {
      title: 'Track Application Deadlines',
      description: 'Manage your application deadlines and get automated reminders.',
      icon: Calendar,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => onNavigate('deadlines')
    },
    {
      title: 'Chat with AI Advisor',
      description: 'Ask questions about universities, admissions, and get expert guidance.',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => onNavigate('chat')
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name || 'Student'}!</h1>
        <p className="text-emerald-100">
          Ready to explore universities and manage your applications? Let's continue your journey.
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Profile Summary */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Profile Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Target Country</p>
                <p className="font-medium text-gray-900 dark:text-white">{profile.country_of_interest}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Book className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Field of Study</p>
                <p className="font-medium text-gray-900 dark:text-white">{profile.field_of_study}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Degree Level</p>
                <p className="font-medium text-gray-900 dark:text-white">{profile.degree_level}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Budget</p>
                <p className="font-medium text-gray-900 dark:text-white">${profile.budget?.toLocaleString()}/year</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action, index) => (
          <motion.button
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            onClick={action.action}
            className={`${action.color} text-white p-6 rounded-xl text-left transition-all duration-200 hover:shadow-lg hover:scale-105`}
          >
            <div className="flex items-start space-x-4">
              <action.icon className="h-8 w-8 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                <p className="text-white/90">{action.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}