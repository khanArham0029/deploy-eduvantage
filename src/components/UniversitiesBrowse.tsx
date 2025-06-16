import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, MapPin, DollarSign, Star, Calendar, Book, ExternalLink, GraduationCap, Globe, Users, Award, ChevronDown, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface University {
  id: string
  name: string
  country: string
  city: string
  area_description: string | null
  website_url: string | null
  contact_email: string | null
  global_ranking: number | null
  research_ranking: number | null
  student_population: number | null
  acceptance_rate: number | null
  average_tuition_fee: number | null
  extracurriculars: string | null
  created_at: string
  updated_at: string
  courses?: Course[]
}

interface Course {
  id: string
  university_id: string
  course_name: string
  department: string
  degree_type: string
  course_duration: string | null
  credit_hours: number | null
  tuition_fee: number | null
  application_deadline: string | null
  requires_ielts: boolean
  ielts_min_score: number | null
  requires_toefl: boolean
  toefl_min_score: number | null
  prerequisites: string | null
  program_url: string | null
  created_at: string
  updated_at: string
}

interface Filters {
  search: string
  degree_type: string
  country: string
  sort_by: string
}

export function UniversitiesBrowse() {
  const [universities, setUniversities] = useState<University[]>([])
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    degree_type: '',
    country: '',
    sort_by: 'name'
  })

  useEffect(() => {
    fetchUniversities()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [universities, filters])

  const fetchUniversities = async () => {
    try {
      // Fetch universities with their courses
      const { data: universitiesData, error: universitiesError } = await supabase
        .from('universities')
        .select(`
          *,
          courses (*)
        `)
        .order('name', { ascending: true })

      if (universitiesError) throw universitiesError
      
      setUniversities(universitiesData || [])
    } catch (error) {
      console.error('Error fetching universities:', error)
      // Set empty array to prevent infinite loading
      setUniversities([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...universities]

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(uni => 
        uni.name?.toLowerCase().includes(searchTerm) ||
        uni.city?.toLowerCase().includes(searchTerm) ||
        uni.country?.toLowerCase().includes(searchTerm) ||
        uni.area_description?.toLowerCase().includes(searchTerm) ||
        uni.courses?.some(course => 
          course.course_name?.toLowerCase().includes(searchTerm) ||
          course.department?.toLowerCase().includes(searchTerm)
        )
      )
    }

    // Country filter
    if (filters.country) {
      filtered = filtered.filter(uni => 
        uni.country?.toLowerCase().includes(filters.country.toLowerCase())
      )
    }

    // Degree type filter (check courses)
    if (filters.degree_type) {
      filtered = filtered.filter(uni => 
        uni.courses?.some(course => 
          course.degree_type?.toLowerCase().includes(filters.degree_type.toLowerCase())
        )
      )
    }

    // Sort
    switch (filters.sort_by) {
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      case 'ranking':
        filtered.sort((a, b) => (a.global_ranking || 999999) - (b.global_ranking || 999999))
        break
      case 'tuition':
        filtered.sort((a, b) => (a.average_tuition_fee || 0) - (b.average_tuition_fee || 0))
        break
      case 'acceptance_rate':
        filtered.sort((a, b) => (b.acceptance_rate || 0) - (a.acceptance_rate || 0))
        break
    }

    setFilteredUniversities(filtered)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      degree_type: '',
      country: '',
      sort_by: 'name'
    })
  }

  const hasActiveFilters = filters.search || filters.degree_type || filters.country || filters.sort_by !== 'name'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f9fd] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#115bfb] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading universities...</p>
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
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Browse Universities</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore our comprehensive database of universities and their programs to find the perfect match for your academic journey.
        </p>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search universities, programs, or locations..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#115bfb] focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Results Count */}
          <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredUniversities.length} universities found
            </span>
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Degree Type
                  </label>
                  <select
                    value={filters.degree_type}
                    onChange={(e) => setFilters(prev => ({ ...prev, degree_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#115bfb] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Degrees</option>
                    <option value="Bachelors">Bachelor's</option>
                    <option value="Masters">Master's</option>
                    <option value="PhD">PhD</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="Enter country"
                    value={filters.country}
                    onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#115bfb] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sort_by}
                    onChange={(e) => setFilters(prev => ({ ...prev, sort_by: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#115bfb] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="name">Name A-Z</option>
                    <option value="ranking">Global Ranking</option>
                    <option value="tuition">Tuition Fee</option>
                    <option value="acceptance_rate">Acceptance Rate</option>
                  </select>
                </div>

                <div className="flex items-end">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Universities Grid */}
      <div className="grid gap-6">
        <AnimatePresence>
          {filteredUniversities.map((university, index) => (
            <motion.div
              key={university.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* University Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-[#115bfb] transition-colors">
                        {university.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {university.city}, {university.country}
                        </span>
                        {university.global_ranking && (
                          <span className="flex items-center">
                            <Award className="h-4 w-4 mr-1" />
                            Rank #{university.global_ranking}
                          </span>
                        )}
                        {university.student_population && (
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {university.student_population.toLocaleString()} students
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {university.area_description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {university.area_description}
                    </p>
                  )}

                  {/* University Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {university.acceptance_rate && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Acceptance Rate</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {university.acceptance_rate}%
                        </div>
                      </div>
                    )}
                    {university.average_tuition_fee && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Tuition</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${university.average_tuition_fee.toLocaleString()}
                        </div>
                      </div>
                    )}
                    {university.courses && university.courses.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Programs</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {university.courses.length} courses
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sample Courses */}
                  {university.courses && university.courses.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Popular Programs</h4>
                      <div className="flex flex-wrap gap-2">
                        {university.courses.slice(0, 3).map((course) => (
                          <span
                            key={course.id}
                            className="px-3 py-1 bg-[#115bfb]/10 text-[#115bfb] dark:bg-[#115bfb]/20 dark:text-[#4a9eff] rounded-full text-sm"
                          >
                            {course.course_name}
                          </span>
                        ))}
                        {university.courses.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                            +{university.courses.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="lg:w-48 flex flex-col justify-between">
                  <div className="space-y-3">
                    {university.website_url && (
                      <a
                        href={university.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#115bfb] text-white rounded-lg hover:bg-[#0d4ad9] transition-colors group"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Visit Website</span>
                      </a>
                    )}
                    
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Star className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    Updated {new Date(university.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* No Results */}
      {filteredUniversities.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No universities found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search criteria or filters to find more results.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-[#115bfb] text-white rounded-lg hover:bg-[#0d4ad9] transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </motion.div>
      )}

      {/* Load More (if needed for pagination) */}
      {filteredUniversities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredUniversities.length} universities
          </p>
        </motion.div>
      )}
    </div>
  )
}