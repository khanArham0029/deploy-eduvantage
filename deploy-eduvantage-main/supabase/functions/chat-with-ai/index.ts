import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ChatRequest {
  message: string
  sessionId?: string
  userId: string
}

interface ChatResponse {
  response: string
  sources?: string[]
  sessionId: string
  messageId: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { message, sessionId, userId }: ChatRequest = await req.json()

    if (!message || !userId) {
      return new Response(
        JSON.stringify({ error: 'Message and userId are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Processing chat request for user ${userId}`)

    let currentSessionId = sessionId

    // Create new session if none provided
    if (!currentSessionId) {
      console.log('Creating new chat session...')
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          title: 'New Chat'
        })
        .select()
        .single()

      if (sessionError) {
        console.error('Error creating session:', sessionError)
        throw sessionError
      }

      currentSessionId = newSession.id
      console.log(`Created new session: ${currentSessionId}`)
    }

    // Save user message to database
    const { data: userMessage, error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        user_id: userId,
        content: message,
        role: 'user'
      })
      .select()
      .single()

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError)
      throw userMessageError
    }

    console.log('User message saved, calling FastAPI chatbot...')

    // Get chat history for context
    const { data: chatHistory, error: historyError } = await supabase
      .from('chat_messages')
      .select('content, role')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })
      .limit(20) // Last 20 messages for context

    if (historyError) {
      console.error('Error fetching chat history:', historyError)
      // Continue without history if there's an error
    }

    // Prepare chat history for FastAPI
    const conversationHistory = chatHistory?.map(msg => ({
      role: msg.role,
      content: msg.content
    })) || []

    // 🔥 REPLACE THIS URL WITH YOUR DEPLOYED FASTAPI URL
    const FASTAPI_URL = Deno.env.get('FASTAPI_CHATBOT_URL') || 'https://your-fastapi-app.railway.app'
    
    console.log(`Calling FastAPI at: ${FASTAPI_URL}/chat`)

    // Call your FastAPI chatbot
    const fastApiResponse = await fetch(`${FASTAPI_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any authentication headers if needed
        // 'Authorization': `Bearer ${Deno.env.get('FASTAPI_API_KEY')}`,
      },
      body: JSON.stringify({
        message: message,
        conversation_history: conversationHistory,
        user_id: userId
      })
    })

    if (!fastApiResponse.ok) {
      const errorText = await fastApiResponse.text()
      console.error('FastAPI request failed:', fastApiResponse.status, errorText)
      throw new Error(`FastAPI request failed: ${fastApiResponse.status} - ${errorText}`)
    }

    const aiResponse = await fastApiResponse.json()
    console.log('Received response from FastAPI:', {
      responseLength: aiResponse.response?.length || 0,
      sourcesCount: aiResponse.sources?.length || 0,
      model: aiResponse.model
    })

    // Extract response and sources from your FastAPI response
    const responseText = aiResponse.response || aiResponse.message || 'I apologize, but I encountered an issue processing your request.'
    const sources = aiResponse.sources || []

    // Save AI response to database
    const { data: assistantMessage, error: assistantMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        user_id: userId,
        content: responseText,
        role: 'assistant',
        sources: sources,
        metadata: {
          model: aiResponse.model || 'fastapi-chatbot',
          processing_time: aiResponse.processing_time || null,
          confidence: aiResponse.confidence || null,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (assistantMessageError) {
      console.error('Error saving assistant message:', assistantMessageError)
      throw assistantMessageError
    }

    console.log('Assistant message saved successfully')

    const response: ChatResponse = {
      response: responseText,
      sources: sources,
      sessionId: currentSessionId,
      messageId: assistantMessage.id
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in chat-with-ai function:', error)
    
    // Return a user-friendly error message
    return new Response(
      JSON.stringify({ 
        error: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})