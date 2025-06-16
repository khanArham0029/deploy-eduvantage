import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, MapPin, BookOpen, GraduationCap, DollarSign, Languages, Plus, X, Save, ArrowLeft, Loader2, Upload } from 'lucide-react'
import { useUserProfile } from '../hooks/useUserProfile'
import { CVUpload } from './CVUpload'

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'Netherlands', 'France', 'Switzerland', 'Sweden', 'Denmark', 'Singapore'
]

const fields = [
  'Computer Science', 'Engineering', 'Business Administration', 'Medicine', 
  'Law', 'Psychology', 'Economics', 'Biology', 'Chemistry', 'Physics', 
  'Mathematics', 'Education', 'Arts & Design', 'Social Sciences'
]

const degrees = ['Masters', 'PhD']

interface ProfileEditProps {
  onNavigate: (page: string) => void
}

export function ProfileEdit({ onNavigate }: ProfileEditProps) {
  const { profile, updateProfile } = useUserProfile()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showCVUpload, setShowCVUpload] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    country_of_interest: '',
    field_of_study: '',
    degree_level: '',
    gpa: '',
    budget: '',
    ielts_score: '',
    toefl_score: '',
    additional_preferences: {} as Record<string, string>
  })
  const [newPreferenceKey, setNewPreferenceKey] = useState('')
  const [newPreferenceValue, setNewPreferenceValue] = useState('')

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        country_of_interest: profile.country_of_interest || '',
        field_of_study: profile.field_of_study || '',
        degree_level: profile.degree_level || '',
        gpa: profile.gpa?.toString() || '',
        budget: profile.budget?.toString() || '',
        ielts_score: profile.ielts_score?.toString() || '',
        toefl_score: profile.toefl_score?.toString() || '',
        additional_preferences: profile.additional_preferences || {}
      })
    }
  }, [profile])

  const handleCVDataExtracted = (extractedData: any) => {
    setFormData(prev => ({
      ...prev,
      ...(extractedData.full_name && { full_name: extractedData.full_name }),
      ...(extractedData.field_of_study && { field_of_study: extractedData.field_of_study }),
      ...(extractedData.degree_level && { degree_level: extractedData.degree_level }),
      ...(extractedData.gpa && { gpa: extractedData.gpa.toString() }),
      // Add skills to additional preferences
      ...(extractedData.skills && {
        additional_preferences: {
          ...prev.additional_preferences,
          'Skills': extractedData.skills.slice(0, 5).join(', '),
          ...(extractedData.languages && { 'Languages': extractedData.languages.join(', ') })
        }
      })
    }))
  }

  const addPreference = () => {
    if (newPreferenceKey && newPreferenceValue) {
      setFormData(prev => ({
        ...prev,
        additional_preferences: {
          ...prev.additional_preferences,
          [newPreferenceKey]: newPreferenceValue
        }
      }))
      setNewPreferenceKey('')
      setNewPreferenceValue('')
    }
  }

  const removePreference = (key: string) => {
    setFormData(prev => ({
      ...prev,
      additional_preferences: Object.fromEntries(
        Object.entries(prev.additional_preferences).filter(([k]) => k !== key)
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error } = await updateProfile({
        full_name: formData.full_name,
        country_of_interest: formData.country_of_interest,
        field_of_study: formData.field_of_study,
        degree_level: formData.degree_level,
        gpa: parseFloat(formData.gpa),
        budget: parseInt(formData.budget),
        ielts_score: parseFloat(formData.ielts_score),
        toefl_score: formData.toefl_score ? parseInt(formData.toefl_score) : null,
        additional_preferences: formData.additional_preferences
      })

      if (error) throw error
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Update your information to get better recommendations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCVUpload(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Update from CV</span>
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </motion.div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#115bfb] focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Country of Interest
                </label>
                <select
                  required
                  value={formData.country_of_interest}
                  onChange={(e) => setFormData(prev => ({ ...prev, country_of_interest: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#115bfb] focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Field of Study
                </label>
                <select
                  required
                  value={formData.field_of_study}
                  onChange={(e) => setFormData(prev => ({ ...prev, field_of_study: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#115bfb] focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select your field</option>
                  {fields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <GraduationCap className="inline h-4 w-4 mr-1" />
                  Degree Level
                </label>
                <select
                  required
                  value={formData.degree_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, degree_level: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#115bfb] focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select degree level</option>
                  {degrees.map(degree => (
                    <option key={degree} value={degree}>{degree}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GPA (4.0 scale)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="4.0"
                  required
                  value={formData.gpa}
                  onChange={(e) => setFormData(prev => ({ ...prev, gpa: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#115bfb] focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="3.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Budget (USD per year)
                </label>
                <input
                  type="number"
                  required
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#115bfb] focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="50000"
                />
              </div>
            </div>
          </div>

          {/* Language Proficiency */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Languages className="h-5 w-5 mr-2" />
              Language Proficiency
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  IELTS Score
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  required
                  value={formData.ielts_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, ielts_score: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#115bfb] focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="7.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  TOEFL Score (optional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={formData.toefl_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, toefl_score: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#115bfb] focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          {/* Additional Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Preferences</h3>
            
            {/* Add new preference */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newPreferenceKey}
                  onChange={(e) => setNewPreferenceKey(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#115bfb] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Preference (e.g., Campus Size)"
                />
                <input
                  type="text"
                  value={newPreferenceValue}
                  onChange={(e) => setNewPreferenceValue(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#115bfb] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Value (e.g., Large)"
                />
              </div>
              <button
                type="button"
                onClick={addPreference}
                className="mt-3 flex items-center space-x-2 px-4 py-2 bg-[#115bfb] text-white rounded-lg hover:bg-[#0d4ad9] transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Preference</span>
              </button>
            </div>

            {/* Current preferences */}
            {Object.entries(formData.additional_preferences).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Current Preferences:</h4>
                {Object.entries(formData.additional_preferences).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    <span className="text-sm text-gray-900 dark:text-white">
                      <strong>{key}:</strong> {value}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePreference(key)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400"
            >
              Profile updated successfully!
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-8 py-3 bg-[#115bfb] text-white rounded-xl hover:bg-[#0d4ad9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* CV Upload Modal */}
      <CVUpload
        isVisible={showCVUpload}
        onClose={() => setShowCVUpload(false)}
        onExtractedData={handleCVDataExtracted}
      />
    </div>
  )
}