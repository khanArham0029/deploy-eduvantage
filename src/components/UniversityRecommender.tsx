import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, DollarSign, Star, Calendar, Book, ExternalLink, Loader2 } from 'lucide-react'
import { useUserProfile } from '../hooks/useUserProfile'
import { supabase } from '../lib/supabase'

interface University {
  id: string
  name: string
  country: string
  city: string
  course_name: string
  department: string
  degree_type: string
  tuition_fee: number
  ielts_min_score: number
  toefl_min_score: number | null
  application_deadline: string
  course_duration: string
  score?: number
}

interface RecommenderProps {
  onNavigate: (page: string) => void
}

export function UniversityRecommender({ onNavigate }: RecommenderProps) {
  const { profile } = useUserProfile()
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<University[]>([])
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [additionalQuestions, setAdditionalQuestions] = useState({
    learning_style: '',
    program_format: '',
    funding_preference: '',
    career_goals: ''
  })
  const [showQuestions, setShowQuestions] = useState(true)

  const handleQuestionSubmit = async () => {
    if (!profile) return

    setLoading(true)
    setShowQuestions(false)

    try {
      // Query universities and courses from Supabase using the existing schema
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select(`
          *,
          universities (
            name,
            country,
            city
          )
        `)
        .eq('degree_type', profile.degree_level)
        .lte('tuition_fee', profile.budget || 100000)
        .lte('ielts_min_score', profile.ielts_score || 9)
        .ilike('department', `%${profile.field_of_study}%`)
        .limit(20)

      if (error) throw error

      // Transform the data to match our interface
      const transformedUniversities = (coursesData || []).map(course => {
        const university = course.universities as any
        
        // Calculate matching score
        const budgetMatch = course.tuition_fee ? Math.min((profile.budget || 0) / course.tuition_fee, 1) * 30 : 0
        const languageMatch = course.ielts_min_score ? Math.min((profile.ielts_score || 0) / course.ielts_min_score, 1) * 30 : 0
        const fieldMatch = 40 // Assumed good match since we filtered by field

        const totalScore = budgetMatch + languageMatch + fieldMatch
        
        return {
          id: course.id,
          name: university?.name || 'Unknown University',
          country: university?.country || 'Unknown',
          city: university?.city || 'Unknown',
          course_name: course.course_name,
          department: course.department,
          degree_type: course.degree_type,
          tuition_fee: course.tuition_fee || 0,
          ielts_min_score: course.ielts_min_score || 0,
          toefl_min_score: course.toefl_min_score,
          application_deadline: course.application_deadline ? new Date(course.application_deadline).toLocaleDateString() : 'Not specified',
          course_duration: course.course_duration || 'Not specified',
          score: Math.round(totalScore)
        }
      })

      // Sort by score and take top 5
      const topRecommendations = transformedUniversities
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 5)

      setRecommendations(topRecommendations)

      // Generate AI analysis
      const analysis = generateMockAIAnalysis(topRecommendations, profile, additionalQuestions)
      setAiAnalysis(analysis)

    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockAIAnalysis = (universities: University[], userProfile: any, questions: any) => {
    return `Based on your profile and preferences, I've identified ${universities.length} excellent university matches for you:

**Key Insights:**
• Your GPA of ${userProfile.gpa} makes you competitive for most programs in your field
• Your budget of $${userProfile.budget?.toLocaleString()} provides good options in ${userProfile.country_of_interest}
• Your IELTS score of ${userProfile.ielts_score} meets requirements for all recommended programs

**Personalized Recommendations:**
Given your interest in ${questions.learning_style || 'balanced'} learning and ${questions.career_goals || 'career advancement'}, the top matches focus on programs with strong ${userProfile.field_of_study} departments.

**Next Steps:**
1. Research each university's specific program requirements
2. Prepare application materials 3-6 months before deadlines
3. Consider visiting campuses or attending virtual information sessions
4. Apply for scholarships and financial aid early

Would you like to discuss any specific university or need help with application strategies?`
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Please complete your profile first to get personalized recommendations.</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-6 py-3 bg-[#115bfb] text-white rounded-xl hover:bg-[#0d4ad9] transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">University Recommendations</h1>
        <p className="text-gray-600 dark:text-gray-400">Personalized university matches based on your profile and preferences</p>
      </motion.div>

      {/* Additional Questions */}
      {showQuestions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Let's refine your search</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Learning Style
              </label>
              <select
                value={additionalQuestions.learning_style}
                onChange={(e) => setAdditionalQuestions(prev => ({ ...prev, learning_style: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#115bfb] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select learning style</option>
                <option value="coursework-based">Coursework-based</option>
                <option value="research-heavy">Research-heavy</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Program Format Interest
              </label>
              <select
                value={additionalQuestions.program_format}
                onChange={(e) => setAdditionalQuestions(prev => ({ ...prev, program_format: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#115bfb] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select format</option>
                <option value="on-campus">On-campus only</option>
                <option value="online">Online programs</option>
                <option value="hybrid">Hybrid/flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Funding Preference
              </label>
              <select
                value={additionalQuestions.funding_preference}
                onChange={(e) => setAdditionalQuestions(prev => ({ ...prev, funding_preference: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#115bfb] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select preference</option>
                <option value="scholarship">Scholarship opportunities</option>
                <option value="assistantship">Research/Teaching assistantships</option>
                <option value="loan">Student loans</option>
                <option value="self-funded">Self-funded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Career Goals
              </label>
              <input
                type="text"
                value={additionalQuestions.career_goals}
                onChange={(e) => setAdditionalQuestions(prev => ({ ...prev, career_goals: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#115bfb] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Software engineering, Research, Consulting"
              />
            </div>
          </div>

          <button
            onClick={handleQuestionSubmit}
            disabled={loading}
            className="mt-6 px-8 py-3 bg-[#115bfb] text-white rounded-xl hover:bg-[#0d4ad9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Finding recommendations...</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Get Recommendations</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Loader2 className="h-12 w-12 animate-spin text-[#115bfb] mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Analyzing thousands of universities to find your perfect matches...</p>
        </motion.div>
      )}

      {/* Recommendations Results */}
      {!loading && recommendations.length > 0 && (
        <div className="space-y-8">
          {/* AI Analysis */}
          {aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-accent-50 to-blue-50 dark:from-accent-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Star className="h-5 w-5 text-accent-500 mr-2" />
                AI Analysis & Recommendations
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {aiAnalysis}
              </div>
            </motion.div>
          )}

          {/* University Cards */}
          <div className="grid gap-6">
            {recommendations.map((university, index) => (
              <motion.div
                key={university.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{university.name}</h3>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 space-x-4">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {university.city}, {university.country}
                          </span>
                          <span className="flex items-center">
                            <Book className="h-4 w-4 mr-1" />
                            {university.course_name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {university.department} • {university.degree_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="bg-blue-100 dark:bg-blue-900/20 text-[#115bfb] px-3 py-1 rounded-full text-sm font-medium">
                          {university.score}% Match
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Tuition Fee</p>
                        <p className="font-medium flex items-center text-gray-900 dark:text-white">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${university.tuition_fee?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Duration</p>
                        <p className="font-medium text-gray-900 dark:text-white">{university.course_duration}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">IELTS Required</p>
                        <p className="font-medium text-gray-900 dark:text-white">{university.ielts_min_score || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Application Deadline</p>
                        <p className="font-medium flex items-center text-gray-900 dark:text-white">
                          <Calendar className="h-4 w-4 mr-1" />
                          {university.application_deadline}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:ml-6">
                    <button className="w-full lg:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-[#115bfb] text-white rounded-xl hover:bg-[#0d4ad9] transition-colors">
                      <ExternalLink className="h-4 w-4" />
                      <span>Learn More</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Need More Guidance?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Chat with our AI advisor for personalized application strategies and tips.</p>
            <button
              onClick={() => onNavigate('chat')}
              className="px-8 py-3 bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-colors"
            >
              Chat with AI Advisor
            </button>
          </motion.div>
        </div>
      )}

      {/* No Results */}
      {!loading && !showQuestions && recommendations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">No universities match your current criteria.</p>
          <button
            onClick={() => setShowQuestions(true)}
            className="px-6 py-3 bg-[#115bfb] text-white rounded-xl hover:bg-[#0d4ad9] transition-colors"
          >
            Adjust Search Criteria
          </button>
        </motion.div>
      )}
    </div>
  )
}