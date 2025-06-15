import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  MessageCircle, 
  Loader2, 
  Plus, 
  Trash2, 
  Edit3, 
  MoreVertical,
  Search,
  X,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  sources?: string[]
  metadata?: any
  created_at: string
}

interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

export function ChatInterface() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSessionMenu, setShowSessionMenu] = useState<string | null>(null)
  const [editingSession, setEditingSession] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (user) {
      fetchSessions()
    }
  }, [user])

  useEffect(() => {
    if (currentSession) {
      fetchMessages(currentSession.id)
    }
  }, [currentSession])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setSessions(data || [])
      
      // Auto-select the most recent session if none selected
      if (!currentSession && data && data.length > 0) {
        setCurrentSession(data[0])
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoadingSessions(false)
    }
  }

  const fetchMessages = async (sessionId: string) => {
    setLoadingMessages(true)
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const createNewSession = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: 'New Chat'
        })
        .select()
        .single()

      if (error) throw error
      
      const newSession = data as ChatSession
      setSessions(prev => [newSession, ...prev])
      setCurrentSession(newSession)
      setMessages([])
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this chat session?')) return

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error
      
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      
      if (currentSession?.id === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId)
        setCurrentSession(remainingSessions.length > 0 ? remainingSessions[0] : null)
        setMessages([])
      }
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  const updateSessionTitle = async (sessionId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title: newTitle })
        .eq('id', sessionId)

      if (error) throw error
      
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, title: newTitle } : s
      ))
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, title: newTitle } : null)
      }
    } catch (error) {
      console.error('Error updating session title:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading || !user) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)

    try {
      // Call the edge function to handle the chat
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-ai`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: currentSession?.id,
          userId: user.id
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to send message`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      // Update current session if a new one was created
      if (!currentSession || currentSession.id !== result.sessionId) {
        await fetchSessions()
        const newSession = sessions.find(s => s.id === result.sessionId)
        if (newSession) {
          setCurrentSession(newSession)
        }
      }

      // Refresh messages for the current session
      if (currentSession) {
        await fetchMessages(currentSession.id)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        role: 'assistant',
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e as any)
    }
  }

  return (
    <div className="h-[calc(100vh-200px)] flex bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Sidebar - Chat Sessions */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#115bfb] text-white rounded-lg hover:bg-[#0d4ad9] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#115bfb] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {loadingSessions ? (
            <div className="p-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading chats...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-4 text-center">
              <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No chats found' : 'No chats yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                    currentSession?.id === session.id
                      ? 'bg-[#115bfb] text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                  onClick={() => setCurrentSession(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {editingSession === session.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => {
                            updateSessionTitle(session.id, editTitle)
                            setEditingSession(null)
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updateSessionTitle(session.id, editTitle)
                              setEditingSession(null)
                            }
                          }}
                          className="w-full bg-transparent border-none outline-none text-sm font-medium"
                          autoFocus
                        />
                      ) : (
                        <h3 className="text-sm font-medium truncate">{session.title}</h3>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs opacity-75">
                          {session.message_count} messages
                        </span>
                        <span className="text-xs opacity-75">
                          {new Date(session.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowSessionMenu(showSessionMenu === session.id ? null : session.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/10 rounded transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {showSessionMenu === session.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditTitle(session.title)
                              setEditingSession(session.id)
                              setShowSessionMenu(null)
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSession(session.id)
                              setShowSessionMenu(null)
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-accent-100 dark:bg-accent-900/20 rounded-xl">
              <Bot className="h-6 w-6 text-accent-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {currentSession?.title || 'AI University Advisor'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ask me anything about universities and admissions
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Online</span>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingMessages ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Ask me about university applications, program requirements, scholarships, or any other education-related questions.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-[#115bfb] text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <Bot className="h-5 w-5 text-accent-600 flex-shrink-0 mt-0.5" />
                      )}
                      {message.role === 'user' && (
                        <User className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                        
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Sources:</p>
                            <div className="space-y-1">
                              {message.sources.map((source, index) => (
                                <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                                  <ExternalLink className="h-3 w-3" />
                                  <span>{source}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(message.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          
                          {message.role === 'assistant' && (
                            <button
                              onClick={() => copyToClipboard(message.content, message.id)}
                              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center space-x-1"
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-accent-600" />
                  <div className="flex space-x-1">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about universities, admissions, scholarships..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#115bfb] focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                disabled={isLoading}
              />
              <div className="absolute right-3 bottom-3 text-xs text-gray-400 dark:text-gray-500">
                Enter to send
              </div>
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-[#115bfb] text-white rounded-xl hover:bg-[#0d4ad9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}