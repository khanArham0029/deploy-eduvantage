import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, MapPin, DollarSign, Star, Calendar, Book, ExternalLink, GraduationCap, Globe, Users, Award, ChevronDown, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface University {
  id: string
  program_name: string
  url: string
  title: string
  degree_level: string
  duration: string
  credits: string
  admission_requirements: string
  description: string
  deadlines: string
  prerequisites: string
  created_at: string
}

interface Filters {
  search: string
  degree_level: string
  duration: string
  sort_by: string
}

export function UniversitiesBrowse() {
  const [universities, setUniversities] = useState<University[]>([])
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    degree_level: '',
    duration: '',
    sort_by: 'newest'
  })

  useEffect(() => {
    fetchUniversities()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [universities, filters])

  const fetchUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from('structured_data')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUniversities(data || [])
    } catch (error) {
      console.error('Error fetching universities:', error)
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
        uni.program_name?.toLowerCase().includes(searchTerm) ||
        uni.title?.toLowerCase().includes(searchTerm) ||
        uni.description?.toLowerCase().includes(searchTerm)
      )
    }

    // Degree level filter
    if (filters.degree_level) {
      filtered = filtered.filter(uni => 
        uni.degree_level?.toLowerCase().includes(filters.degree_level.toLowerCase())
      )
    }

    // Duration filter
    if (filters.duration) {
      filtered = filtered.filter(uni => 
        uni.duration?.toLowerCase().includes(filters.duration.toLowerCase())
      )
    }

    // Sort
    switch (filters.sort_by) {
      case 'name':
        filtered.sort((a, b) => (a.program_name || '').localeCompare(b.program_name || ''))
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
    }

    setFilteredUniversities(filtered)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      degree_level: '',
      duration: '',
      sort_by: 'newest'
    })
  }

  const hasActiveFilters = filters.search || filters.degree_level || filters.duration || filters.sort_by !== 'newest'

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
          Explore our comprehensive database of university programs and find the perfect match for your academic journey.
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
              placeholder="Search universities, programs, or keywords..."
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
              {filteredUniversities.length} programs found
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
                    Degree Level
                  </label>
                  <select
                    value={filters.degree_level}
                    onChange={(e) => setFilters(prev => ({ ...prev, degree_level: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#115bfb] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Levels</option>
                    <option value="bachelor">Bachelor's</option>
                    <option value="master">Master's</option>
                    <option value="phd">PhD</option>
                    <option value="diploma">Diploma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration
                  </label>
                  <select
                    value={filters.duration}
                    onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#115bfb] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Any Duration</option>
                    <option value="1 year">1 Year</option>
                    <option value="2 year">2 Years</option>
                    <option value="3 year">3 Years</option>
                    <option value="4 year">4 Years</option>
                  </select>
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
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name A-Z</option>
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
                        {university.program_name || university.title || 'University Program'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        {university.degree_level && (
                          <span className="flex items-center">
                            <GraduationCap className="h-4 w-4 mr-1" />
                            {university.degree_level}
                          </span>
                        )}
                        {university.duration && (
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {university.duration}
                          </span>
                        )}
                        {university.credits && (
                          <span className="flex items-center">
                            <Book className="h-4 w-4 mr-1" />
                            {university.credits} credits
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {university.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {university.description}
                    </p>
                  )}

                  {/* Requirements & Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {university.admission_requirements && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Admission Requirements</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {university.admission_requirements}
                        </p>
                      </div>
                    )}
                    {university.prerequisites && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Prerequisites</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {university.prerequisites}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Deadlines */}
                  {university.deadlines && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <span className="text-gray-600 dark:text-gray-400">Deadline:</span>
                      <span className="font-medium text-orange-600 dark:text-orange-400">{university.deadlines}</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="lg:w-48 flex flex-col justify-between">
                  <div className="space-y-3">
                    {university.url && (
                      <a
                        href={university.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#115bfb] text-white rounded-lg hover:bg-[#0d4ad9] transition-colors group"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Details</span>
                      </a>
                    )}
                    
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Star className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    Added {new Date(university.created_at).toLocaleDateString()}
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
            Showing {filteredUniversities.length} of {universities.length} programs
          </p>
        </motion.div>
      )}
    </div>
  )
}