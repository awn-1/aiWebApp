// Chat.js
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
  const textareaRef = useRef(null);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      fetchUserProfile();
    } else {
      setMessages([]);
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

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const fetchUserProfile = async () => {
    try {
      const profileData = localStorage.getItem('userProfile');
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
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
    setInput('');

    try {
      // Get profile data and format it for context
      let profileData = {};
      try {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          profileData = JSON.parse(savedProfile);

          // Filter out empty fields and format nicely
          profileData = Object.fromEntries(
            Object.entries(profileData)
              .filter(([_, value]) => value?.trim())
              .map(([key, value]) => [
                // Convert camelCase to readable format
                key.replace(/([A-Z])/g, ' $1').toLowerCase(),
                value.trim()
              ])
          );
        }
      } catch (error) {
        console.error('Error parsing profile data:', error);
      }

      const response = await fetch('http://localhost:8081/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          profile: profileData,
          context: {
            // Add any additional context that might be helpful
            currentTimestamp: new Date().toISOString(),
            messageCount: messages.length + 1,
            hasProfileData: Object.keys(profileData).length > 0
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from AI');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const aiResponse = {
        text: data.reply,
        is_user: false,
        timestamp: new Date().toISOString()
      };

      setMessages(prevMessages => [...prevMessages, aiResponse]);

      // Save both messages to cache
      addMessageToCache(userMessage);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
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
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={conversationId ? "Type your message..." : "Select or create a conversation to start chatting"}
          disabled={!conversationId || isLoading}
          className="message-input"
          rows={1}
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