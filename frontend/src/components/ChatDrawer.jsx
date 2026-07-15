import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useToast } from './Toast';

export default function ChatDrawer({ isOpen, onClose, booking, currentUser }) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const bookingId = booking?._id || booking?.id;

  const fetchMessages = async (silent = false) => {
    if (!bookingId) return;
    try {
      if (!silent) setLoading(true);
      const data = await api.messages.getMessages(bookingId);
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isOpen && bookingId) {
      fetchMessages();
      
      // Set up polling every 3 seconds to simulate real-time chat
      const interval = setInterval(() => {
        fetchMessages(true);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isOpen, bookingId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !bookingId) return;

    const messageText = text.trim();
    setText(''); // clear input instantly for smooth UX

    try {
      const newMsg = await api.messages.sendMessage(bookingId, messageText);
      setMessages(prev => [...prev, newMsg]);
    } catch (err) {
      console.error('Error sending message:', err);
      showToast('Failed to send message.', 'error');
    }
  };

  if (!booking) return null;
  const propertyTitle = booking.property?.title || 'Property Inquiry';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: '#000',
              zIndex: 998,
              backdropFilter: 'blur(3px)'
            }}
          />

          {/* Chat Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '100%',
              maxWidth: '420px',
              height: '100%',
              background: '#09090b',
              borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', margin: 0 }}>Chat with Landlord/Tenant</h4>
                <small style={{ color: '#a1a1aa', display: 'block', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                  {propertyTitle}
                </small>
              </div>
              <button 
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#a1a1aa',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Chat Messages viewport */}
            <div style={{
              flexGrow: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              {loading ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: '#71717a', fontSize: '0.9rem' }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'block' }}></i>
                  Loading conversation...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: '#71717a', padding: '0 20px', fontSize: '0.85rem' }}>
                  <i className="far fa-comments" style={{ fontSize: '2.5rem', marginBottom: '12px', display: 'block', color: 'rgba(255, 255, 255, 0.15)' }}></i>
                  No messages yet. Send a message to start negotiating details, durations, or move-in plans!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = String(msg.sender) === String(currentUser?.id || currentUser?._id);
                  return (
                    <div 
                      key={msg._id || msg.id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <span style={{ color: '#71717a', fontSize: '0.7rem', marginBottom: '4px', paddingLeft: isMe ? '0' : '4px', paddingRight: isMe ? '4px' : '0' }}>
                        {isMe ? 'You' : msg.senderName}
                      </span>
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        borderTopRightRadius: isMe ? '2px' : '12px',
                        borderTopLeftRadius: isMe ? '12px' : '2px',
                        background: isMe ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.04)',
                        border: isMe ? 'none' : '1px solid rgba(255,255,255,0.06)',
                        color: '#fff',
                        fontSize: '0.85rem',
                        lineHeight: '1.4',
                        wordBreak: 'break-word',
                        textAlign: 'left'
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form 
              onSubmit={handleSend}
              style={{
                padding: '15px 20px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255, 255, 255, 0.01)',
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
              }}
            >
              <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="glass-input"
                style={{
                  flexGrow: 1,
                  margin: 0,
                  fontSize: '0.85rem',
                  padding: '10px 14px'
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'var(--primary-gradient)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '38px',
                  height: '38px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem'
                }}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
