import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';  // Import the markdown rendering library

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const getCurrentChunk = () => {
  return Date.now();
};

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageCache = useRef({});
  const writeQueue = useRef([]);
  const [chatId, setChatId] = useState(() => {
    const storedChatId = localStorage.getItem('chatId');
    return storedChatId || uuidv4();
  });

  useEffect(() => {
    fetchMessages();
    const flushInterval = setInterval(flushCache, 10000);
    return () => {
      clearInterval(flushInterval);
      flushCache();
    };
  }, [chatId]);

  const fetchMessages = async () => {
    console.log('Fetching messages for chatId:', chatId);
    try {
      const { data, error } = await supabase
        .from('message_chunks')
        .select('*')
        .eq('chat_id', chatId)
        .order('chunk', { ascending: true });
      if (error) throw error;
      console.log('Fetched data:', data);
      const flattenedMessages = data.flatMap(chunk => JSON.parse(chunk.messages));
      setMessages(flattenedMessages);
      console.log('Set messages:', flattenedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error.message, error.details, error.hint);
    }
  };

  const addMessageToCache = (message) => {
    const chunk = getCurrentChunk();
    messageCache.current[chunk] = [message];
    writeQueue.current.push(chunk);
    console.log('Added message to cache, chunk:', chunk);
    console.log('Current cache:', messageCache.current);
    console.log('Current write queue:', writeQueue.current);
  };

  const flushCache = async () => {
    console.log('Flushing cache...');
    const uniqueChunks = [...new Set(writeQueue.current)];
    console.log('Chunks to flush:', uniqueChunks);
    for (const chunk of uniqueChunks) {
      if (messageCache.current[chunk]) {
        try {
          console.log('Attempting to insert chunk:', chunk);
          const { data, error } = await supabase
            .from('message_chunks')
            .insert({ 
              chat_id: chatId, 
              chunk: chunk, 
              messages: JSON.stringify(messageCache.current[chunk])
            });
          if (error) throw error;
          console.log('Successfully inserted chunk:', chunk, 'Response:', data);
          delete messageCache.current[chunk];
        } catch (error) {
          console.error('Error inserting messages:', error.message, error.details, error.hint);
        }
      }
    }
    writeQueue.current = [];
    console.log('Cache flushed');
  };

  const callClaudeAPI = async (messages) => {
    const response = await fetch('http://localhost:8081/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get response from AI');
    }
    const data = await response.json();
    return data.reply;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      setIsLoading(true);
      const userMessage = { text: input, is_user: true, timestamp: new Date().toISOString() };
      setMessages(prevMessages => [...prevMessages, userMessage]);  // Append the user message
      addMessageToCache(userMessage);
      setInput('');
      
      await flushCache();

      try {
        const apiMessages = messages.concat([userMessage]);
        
        const reply = await callClaudeAPI(apiMessages);

        const aiResponse = { 
          text: reply,
          is_user: false,
          timestamp: new Date().toISOString()
        };
        setMessages(prevMessages => [...prevMessages, aiResponse]);  // Append the AI response below
        addMessageToCache(aiResponse);
        await flushCache();
      } catch (error) {
        console.error('Error calling Claude API:', error);
        const errorResponse = { 
          text: "Sorry, I couldn't process that request. Please try again.",
          is_user: false,
          timestamp: new Date().toISOString()
        };
        setMessages(prevMessages => [...prevMessages, errorResponse]);  // Append error message
        addMessageToCache(errorResponse);
        await flushCache();
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Function to clear the chat
  const handleClearChat = () => {
    setMessages([]);
    messageCache.current = {};
    writeQueue.current = [];
    localStorage.removeItem('chatId');
    setChatId(uuidv4());  // Generate a new chat ID for the next session
    console.log('Chat cleared, new chatId set');
  };

  return (
    <div className="chat-container">
      <h2>Chat with AI</h2>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={msg.is_user ? 'user-message' : 'ai-message'}>
            {msg.is_user ? (
              msg.text
            ) : (
              <ReactMarkdown>{msg.text}</ReactMarkdown>  // Use Markdown for AI responses
            )}
          </div>
        ))}
        {isLoading && <p className="typing-indicator">AI is responding...</p>}
      </div>
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>Send</button>
        <button type="button" onClick={handleClearChat}>Clear Chat</button>
      </form>
    </div>
  );
}

export default Chat;
