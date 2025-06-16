import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react'

interface CVUploadProps {
  onExtractedData: (data: any) => void
  isVisible: boolean
  onClose: () => void
}

interface ExtractedData {
  full_name?: string
  field_of_study?: string
  degree_level?: string
  gpa?: number
  skills?: string[]
  experience?: string[]
  education?: string[]
  languages?: string[]
  certifications?: string[]
  email?: string
  phone?: string
}

export function CVUpload({ onExtractedData, isVisible, onClose }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, DOC, DOCX, or TXT file')
      return
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setFile(selectedFile)
    setError('')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleExtract = async () => {
    if (!file) return

    setExtracting(true)
    setError('')
    setDebugInfo(null)

    try {
      // Create FormData to send file to edge function
      const formData = new FormData()
      formData.append('file', file)

      console.log('Sending file to edge function:', file.name, file.type, file.size)

      // Call Supabase Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-cv-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData
      })

      console.log('Response status:', response.status)
      
      const result = await response.json()
      console.log('Response data:', result)

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Failed to process CV`)
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to extract data from CV')
      }

      setExtractedData(result.data)
      setDebugInfo(result.debug)
      setSuccess(true)
      
    } catch (err: any) {
      console.error('CV extraction error:', err)
      setError(err.message || 'Failed to extract information from CV')
    } finally {
      setExtracting(false)
    }
  }

  const handleApplyData = () => {
    if (extractedData) {
      onExtractedData(extractedData)
      onClose()
    }
  }

  const resetUpload = () => {
    setFile(null)
    setExtractedData(null)
    setDebugInfo(null)
    setSuccess(false)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Your CV</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                We'll extract relevant information to auto-fill your profile
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {!file && !extractedData && (
            <>
              {/* Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-[#115bfb] dark:hover:border-[#115bfb] transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Drop your CV here or click to browse
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Supports PDF, DOC, DOCX, and TXT files up to 5MB
                </p>
                <button className="px-6 py-3 bg-[#115bfb] text-white rounded-lg hover:bg-[#0d4ad9] transition-colors">
                  Choose File
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileInput}
                className="hidden"
              />
            </>
          )}

          {file && !extractedData && (
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <FileText className="h-8 w-8 text-[#115bfb]" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{file.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                  </p>
                </div>
                <button
                  onClick={resetUpload}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Extract Button */}
              <button
                onClick={handleExtract}
                disabled={extracting}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-[#115bfb] text-white rounded-xl hover:bg-[#0d4ad9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {extracting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Extracting Information...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    <span>Extract Information</span>
                  </>
                )}
              </button>
            </div>
          )}

          {extractedData && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">Information Extracted Successfully!</h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Review the extracted information below and apply it to your profile.
                  </p>
                </div>
              </div>

              {/* Extracted Data Preview */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Extracted Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {extractedData.full_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                      <p className="text-gray-900 dark:text-white">{extractedData.full_name}</p>
                    </div>
                  )}
                  
                  {extractedData.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                      <p className="text-gray-900 dark:text-white">{extractedData.email}</p>
                    </div>
                  )}

                  {extractedData.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
                      <p className="text-gray-900 dark:text-white">{extractedData.phone}</p>
                    </div>
                  )}
                  
                  {extractedData.field_of_study && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Field of Study</label>
                      <p className="text-gray-900 dark:text-white">{extractedData.field_of_study}</p>
                    </div>
                  )}
                  
                  {extractedData.degree_level && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Degree Level</label>
                      <p className="text-gray-900 dark:text-white">{extractedData.degree_level}</p>
                    </div>
                  )}
                  
                  {extractedData.gpa && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">GPA</label>
                      <p className="text-gray-900 dark:text-white">{extractedData.gpa}/4.0</p>
                    </div>
                  )}
                </div>
                
                {extractedData.skills && extractedData.skills.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Skills</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {extractedData.skills.slice(0, 8).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {extractedData.languages && extractedData.languages.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Languages</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {extractedData.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm rounded-full"
                        >
                          {lang.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {extractedData.experience && extractedData.experience.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Experience</label>
                    <div className="space-y-1 mt-1">
                      {extractedData.experience.slice(0, 3).map((exp, index) => (
                        <p key={index} className="text-sm text-gray-700 dark:text-gray-300">
                          • {exp.trim()}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {extractedData.education && extractedData.education.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Education</label>
                    <div className="space-y-1 mt-1">
                      {extractedData.education.slice(0, 3).map((edu, index) => (
                        <p key={index} className="text-sm text-gray-700 dark:text-gray-300">
                          • {edu.trim()}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Debug Information (for development) */}
              {debugInfo && (
                <details className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                  <summary className="cursor-pointer font-medium text-gray-900 dark:text-white">
                    Debug Information (Click to expand)
                  </summary>
                  <div className="mt-4 space-y-2 text-sm">
                    <p><strong>File:</strong> {debugInfo.fileName} ({debugInfo.fileType})</p>
                    <p><strong>Size:</strong> {(debugInfo.fileSize / 1024).toFixed(1)} KB</p>
                    <p><strong>Extracted Text Length:</strong> {debugInfo.extractedTextLength} characters</p>
                    <div>
                      <strong>Text Preview:</strong>
                      <pre className="mt-1 p-2 bg-gray-200 dark:bg-gray-600 rounded text-xs overflow-x-auto">
                        {debugInfo.extractedTextPreview}
                      </pre>
                    </div>
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleApplyData}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-[#115bfb] text-white rounded-xl hover:bg-[#0d4ad9] transition-colors"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Apply to Profile</span>
                </button>
                <button
                  onClick={resetUpload}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Upload Different CV
                </button>
              </div>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-start space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            >
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200">Error</h3>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Info Section */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">What we extract:</h4>
            <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
              <li>• Personal information (name, contact details)</li>
              <li>• Educational background (degree, GPA, field of study)</li>
              <li>• Skills and technical competencies</li>
              <li>• Language proficiencies</li>
              <li>• Work experience and achievements</li>
            </ul>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-3">
              Your CV is processed securely and the file is not stored on our servers.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}