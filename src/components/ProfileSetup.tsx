import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, MapPin, BookOpen, GraduationCap, DollarSign, Languages, Plus, X, Moon, Sun, Upload } from 'lucide-react'
import { useUserProfile } from '../hooks/useUserProfile'
import { useTheme } from '../contexts/ThemeContext'
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

interface ProfileSetupProps {
  onComplete: () => void
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { updateProfile } = useUserProfile()
  const { theme, toggleTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
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

  const totalSteps = 3

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
      onComplete()
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* CV Upload Option */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Quick Setup with CV
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Upload your CV and we'll automatically extract your information to fill the form
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCVUpload(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload CV</span>
                </button>
              </div>
            </div>

            <div className="text-center text-gray-500 dark:text-gray-400">
              <span className="text-sm">or fill manually</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="inline h-4 w-4 mr-2" />
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
                <MapPin className="inline h-4 w-4 mr-2" />
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <BookOpen className="inline h-4 w-4 mr-2" />
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
                <GraduationCap className="inline h-4 w-4 mr-2" />
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
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <DollarSign className="inline h-4 w-4 mr-2" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Languages className="inline h-4 w-4 mr-2" />
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
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Preferences</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Add any other preferences that might help us recommend better universities.</p>

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
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f9fd] dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-3 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-colors backdrop-blur-sm"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </button>

      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700"
        >
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep} of {totalSteps}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 bg-[#115bfb] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {renderStep()}

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep === totalSteps ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-[#115bfb] text-white rounded-xl hover:bg-[#0d4ad9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Complete Setup</span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-[#115bfb] text-white rounded-xl hover:bg-[#0d4ad9] transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>

      {/* CV Upload Modal */}
      <CVUpload
        isVisible={showCVUpload}
        onClose={() => setShowCVUpload(false)}
        onExtractedData={handleCVDataExtracted}
      />
    </div>
  )
}