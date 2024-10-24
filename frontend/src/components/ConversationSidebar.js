import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import './ConversationSidebar.css';

// Create Alert Dialog Component inline since we can't use the shadcn import
const AlertDialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  
  return (
    <div className="alert-dialog-overlay" onClick={() => onOpenChange(false)}>
      <div className="alert-dialog-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const AlertDialogContent = ({ children }) => (
  <div className="alert-dialog-container">{children}</div>
);

const AlertDialogHeader = ({ children }) => (
  <div className="alert-dialog-header">{children}</div>
);

const AlertDialogTitle = ({ children }) => (
  <h2 className="alert-dialog-title">{children}</h2>
);

const AlertDialogDescription = ({ children }) => (
  <p className="alert-dialog-description">{children}</p>
);

const AlertDialogFooter = ({ children }) => (
  <div className="alert-dialog-footer">{children}</div>
);

const AlertDialogCancel = ({ children, onClick }) => (
  <button className="alert-dialog-button cancel" onClick={onClick}>{children}</button>
);

const AlertDialogAction = ({ children, onClick, className }) => (
  <button className={`alert-dialog-button action ${className}`} onClick={onClick}>{children}</button>
);


const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ConversationSidebar = ({ activeConversationId, onConversationSelect, onNewConversation }) => {
    const [conversations, setConversations] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
  
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

  const startEditing = (conversation) => {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const saveTitle = async (id) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title: editingTitle.trim() || 'New Conversation' })
        .eq('id', id);

      if (error) throw error;
      cancelEditing();
      await fetchConversations();
    } catch (error) {
      console.error('Error updating conversation title:', error);
    }
  };

  const confirmDelete = (conversation) => {
    setConversationToDelete(conversation);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!conversationToDelete || isDeleting) return;

    try {
      setIsDeleting(true);
      console.log('Deleting conversation:', conversationToDelete.id);

      // First delete all message chunks for this conversation
      const { error: messagesError } = await supabase
        .from('message_chunks')
        .delete()
        .eq('chat_id', conversationToDelete.id);

      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
        throw messagesError;
      }

      // Then delete the conversation
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationToDelete.id);

      if (conversationError) {
        console.error('Error deleting conversation:', conversationError);
        throw conversationError;
      }

      // Update local state
      setConversations(prevConversations => 
        prevConversations.filter(c => c.id !== conversationToDelete.id)
      );

      // If this was the active conversation, select another one
      if (activeConversationId === conversationToDelete.id) {
        const remainingConversations = conversations.filter(
          c => c.id !== conversationToDelete.id
        );
        if (remainingConversations.length > 0) {
          onConversationSelect(remainingConversations[0].id);
        } else {
          onConversationSelect(null);
        }
      }

      console.log('Successfully deleted conversation');

    } catch (error) {
      console.error('Error in deletion process:', error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
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
          <div
            key={conversation.id}
            className={`conversation-item ${activeConversationId === conversation.id ? 'active' : ''}`}
          >
            {editingId === conversation.id ? (
              <div className="edit-title-container">
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="edit-title-input"
                  autoFocus
                />
                <button
                  onClick={() => saveTitle(conversation.id)}
                  className="edit-action-button save"
                  title="Save"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={cancelEditing}
                  className="edit-action-button cancel"
                  title="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="conversation-content">
                <button
                  onClick={() => onConversationSelect(conversation.id)}
                  className="conversation-title-button"
                >
                  <span className="conversation-title">
                    {conversation.title || 'New Conversation'}
                  </span>
                  <span className="conversation-date">
                    {new Date(conversation.created_at).toLocaleDateString()}
                  </span>
                </button>
                <div className="conversation-actions">
                  <button
                    onClick={() => startEditing(conversation)}
                    className="action-button"
                    title="Rename"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => confirmDelete(conversation)}
                    className="action-button delete"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Please confirm delete. This action will permanently delete all records of this conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="delete-button"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConversationSidebar;