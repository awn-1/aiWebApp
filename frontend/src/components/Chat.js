import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import ReactMarkdown from 'react-markdown';
import './Chat.css';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function Chat({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const messageCache = useRef({});
  const writeQueue = useRef([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);  // Add ref for input field

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      fetchUserProfile();
    } else {
      setMessages([]);  // Clear messages when no conversation is selected
    }
    const flushInterval = setInterval(flushCache, 10000);
    return () => {
      clearInterval(flushInterval);
      flushCache();
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when conversation changes
  useEffect(() => {
    if (conversationId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [conversationId]);

  const fetchUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) throw error;
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchMessages = async () => {
    if (!conversationId) return;
    try {
      const { data, error } = await supabase
        .from('message_chunks')
        .select('*')
        .eq('chat_id', conversationId)
        .order('chunk', { ascending: true });
        
      if (error) throw error;
      const flattenedMessages = data.flatMap(chunk => JSON.parse(chunk.messages));
      setMessages(flattenedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const addMessageToCache = (message) => {
    const chunk = Date.now();
    messageCache.current[chunk] = [message];
    writeQueue.current.push(chunk);
  };

  const flushCache = async () => {
    if (!conversationId) return;
    
    const uniqueChunks = [...new Set(writeQueue.current)];
    for (const chunk of uniqueChunks) {
      if (messageCache.current[chunk]) {
        try {
          await supabase
            .from('message_chunks')
            .insert({ 
              chat_id: conversationId, 
              chunk: chunk, 
              messages: JSON.stringify(messageCache.current[chunk])
            });
          delete messageCache.current[chunk];
        } catch (error) {
          console.error('Error inserting messages:', error);
        }
      }
    }
    writeQueue.current = [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!conversationId || !input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = { text: input, is_user: true, timestamp: new Date().toISOString() };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    addMessageToCache(userMessage);
    setInput('');
    
    try {
      await flushCache();
      const response = await fetch('http://localhost:8081/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          profile: userProfile
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }
      
      const data = await response.json();
      const aiResponse = { 
        text: data.reply,
        is_user: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      addMessageToCache(aiResponse);
      await flushCache();
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { 
        text: error.message || "Sorry, I couldn't process that request. Please try again.",
        is_user: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      addMessageToCache(errorMessage);
      await flushCache();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.is_user ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">
              {msg.is_user ? (
                <p>{msg.text}</p>
              ) : (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          ref={inputRef}  // Add ref to input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={conversationId ? "Type your message..." : "Select or create a conversation to start chatting"}
          disabled={!conversationId || isLoading}
          className="message-input"
        />
        <button
          type="submit"
          disabled={!conversationId || !input.trim() || isLoading}
          className="send-button"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default Chat;