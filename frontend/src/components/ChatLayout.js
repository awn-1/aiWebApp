import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Chat from './Chat';
import ConversationSidebar from './ConversationSidebar';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ChatLayout = () => {
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeConversation();
  }, []);

  const initializeConversation = async () => {
    try {
      console.log('Initializing conversation...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        console.log('No user session found');
        setLoading(false);
        return;
      }

      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (conversations && conversations.length > 0) {
        console.log('Found existing conversation:', conversations[0].id);
        setActiveConversationId(conversations[0].id);
      } else {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            user_id: session.user.id,
            title: 'New Conversation'
          })
          .select()
          .single();

        if (createError) throw createError;
        console.log('Created new conversation:', newConversation.id);
        setActiveConversationId(newConversation.id);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: session.user.id,
          title: 'New Conversation'
        })
        .select()
        .single();

      if (error) throw error;
      setActiveConversationId(data.id);
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-70px)]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <div className="chat-main-content">
        <Chat conversationId={activeConversationId} />
      </div>
      <ConversationSidebar
        activeConversationId={activeConversationId}
        onConversationSelect={setActiveConversationId}
        onNewConversation={handleNewConversation}
      />
    </div>
  );
};

export default ChatLayout;