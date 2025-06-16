import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Edit3, 
  Trash2, 
  Bell,
  Filter,
  Search,
  MapPin,
  GraduationCap,
  Save,
  Loader2
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

interface Application {
  id: string
  university_name: string
  program_name: string
  application_deadline: string
  status: 'pending' | 'submitted' | 'accepted' | 'rejected'
  priority: 'high' | 'medium' | 'low'
  reminder_type: 'daily' | 'before_deadline'
  notes: string
  first_reminder_sent: boolean
  created_at: string
  updated_at: string
}

interface DeadlineTrackerProps {
  onNavigate?: (page: string) => void
}

export function DeadlineTracker({ onNavigate }: DeadlineTrackerProps) {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingApp, setEditingApp] = useState<Application | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'accepted' | 'rejected'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    university_name: '',
    program_name: '',
    application_deadline: '',
    status: 'pending' as const,
    priority: 'medium' as const,
    reminder_type: 'before_deadline' as const,
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      fetchApplications()
    }
  }, [user])

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('application_deadlines')
        .select('*')
        .order('application_deadline', { ascending: true })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    setError('')

    try {
      if (editingApp) {
        // Update existing application
        const { error } = await supabase
          .from('application_deadlines')
          .update({
            university_name: formData.university_name,
            program_name: formData.program_name,
            application_deadline: formData.application_deadline,
            status: formData.status,
            priority: formData.priority,
            reminder_type: formData.reminder_type,
            notes: formData.notes
          })
          .eq('id', editingApp.id)

        if (error) throw error
      } else {
        // Create new application
        const { error } = await supabase
          .from('application_deadlines')
          .insert({
            user_id: user.id,
            university_name: formData.university_name,
            program_name: formData.program_name,
            application_deadline: formData.application_deadline,
            status: formData.status,
            priority: formData.priority,
            reminder_type: formData.reminder_type,
            notes: formData.notes
          })

        if (error) throw error
      }

      await fetchApplications()
      resetForm()
    } catch (error: any) {
      setError(error.message || 'Failed to save application')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return

    try {
      const { error } = await supabase
        .from('application_deadlines')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchApplications()
    } catch (error: any) {
      setError(error.message || 'Failed to delete application')
    }
  }

  const resetForm = () => {
    setFormData({
      university_name: '',
      program_name: '',
      application_deadline: '',
      status: 'pending',
      priority: 'medium',
      reminder_type: 'before_deadline',
      notes: ''
    })
    setShowAddForm(false)
    setEditingApp(null)
  }

  const startEdit = (app: Application) => {
    setFormData({
      university_name: app.university_name,
      program_name: app.program_name,
      application_deadline: app.application_deadline,
      status: app.status,
      priority: app.priority,
      reminder_type: app.reminder_type,
      notes: app.notes
    })
    setEditingApp(app)
    setShowAddForm(true)
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'submitted': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'accepted': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getReminderTypeColor = (reminderType: string) => {
    switch (reminderType) {
      case 'daily': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20'
      case 'before_deadline': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getUrgencyIndicator = (daysUntil: number) => {
    if (daysUntil < 0) return { icon: X, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' }
    if (daysUntil <= 3) return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' }
    if (daysUntil <= 7) return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20' }
    return { icon: Calendar, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' }
  }

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter
    const matchesSearch = searchTerm === '' || 
      app.university_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.program_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f9fd] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Application Deadlines</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your university application deadlines with smart reminders</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Add Application</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Applications', value: applications.length, icon: GraduationCap, color: 'text-blue-600' },
          { label: 'Pending', value: applications.filter(app => app.status === 'pending').length, icon: Clock, color: 'text-yellow-600' },
          { label: 'Submitted', value: applications.filter(app => app.status === 'submitted').length, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Urgent (≤7 days)', value: applications.filter(app => getDaysUntilDeadline(app.application_deadline) <= 7 && getDaysUntilDeadline(app.application_deadline) >= 0).length, icon: AlertTriangle, color: 'text-red-600' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-700`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search universities or programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredApplications.length} applications found
            </span>
          </div>
        </div>
      </motion.div>

      {/* Applications List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredApplications.map((app, index) => {
            const daysUntil = getDaysUntilDeadline(app.application_deadline)
            const urgency = getUrgencyIndicator(daysUntil)
            const UrgencyIcon = urgency.icon

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* University Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {app.university_name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 flex items-center">
                          <GraduationCap className="h-4 w-4 mr-1" />
                          {app.program_name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(app.priority)}`}>
                          {app.priority.charAt(0).toUpperCase() + app.priority.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReminderTypeColor(app.reminder_type)}`}>
                          <Bell className="h-3 w-3 mr-1 inline" />
                          {app.reminder_type === 'daily' ? 'Daily' : 'Milestone'}
                        </span>
                      </div>
                    </div>

                    {app.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{app.notes}</p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(app.application_deadline).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Added {new Date(app.created_at).toLocaleDateString()}
                      </span>
                      {app.first_reminder_sent && (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          First reminder sent
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Deadline Status */}
                  <div className="lg:w-48 flex flex-col items-center lg:items-end space-y-3">
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${urgency.bg}`}>
                      <UrgencyIcon className={`h-5 w-5 ${urgency.color}`} />
                      <div className="text-center lg:text-right">
                        <div className={`font-bold ${urgency.color}`}>
                          {daysUntil < 0 ? 'Overdue' : daysUntil === 0 ? 'Today' : `${daysUntil} days`}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {daysUntil < 0 ? 'Past deadline' : daysUntil === 0 ? 'Due today' : 'remaining'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(app)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit application"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete application"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredApplications.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
        >
          <Calendar className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm || filter !== 'all' ? 'No applications found' : 'No applications yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Start tracking your university application deadlines with smart reminders.'
            }
          </p>
          {(!searchTerm && filter === 'all') && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200"
            >
              Add Your First Application
            </button>
          )}
        </motion.div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingApp ? 'Edit Application' : 'Add New Application'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      University Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.university_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, university_name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Stanford University"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Program Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.program_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, program_name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Master of Computer Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Application Deadline *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.application_deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, application_deadline: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="submitted">Submitted</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reminder Type *
                    </label>
                    <select
                      value={formData.reminder_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, reminder_type: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="before_deadline">Before Deadline (30, 14, 7, 3, 1 days)</option>
                      <option value="daily">Daily Reminders</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formData.reminder_type === 'daily' 
                        ? 'You will receive daily reminders from tomorrow until the deadline'
                        : 'You will receive reminders at key milestones before the deadline'
                      }
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Add any additional notes about this application..."
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>{editingApp ? 'Updating...' : 'Adding...'}</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        <span>{editingApp ? 'Update Application' : 'Add Application'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}