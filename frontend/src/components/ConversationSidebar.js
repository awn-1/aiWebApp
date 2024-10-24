import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './ConversationSidebar.css';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ConversationSidebar = ({ activeConversationId, onConversationSelect, onNewConversation }) => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    fetchConversations();
    
    // Subscribe to changes
    const channel = supabase
      .channel('conversation-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'conversations' }, 
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchConversations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  return (
    <div className="conversation-sidebar">
      <div className="sidebar-header">
        <button onClick={onNewConversation} className="new-chat-button">
          New Chat
        </button>
      </div>
      <div className="conversations-list">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onConversationSelect(conversation.id)}
            className={`conversation-item ${activeConversationId === conversation.id ? 'active' : ''}`}
          >
            <span className="conversation-title">
              {conversation.title || 'New Conversation'}
            </span>
            <span className="conversation-date">
              {new Date(conversation.created_at).toLocaleDateString()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConversationSidebar;