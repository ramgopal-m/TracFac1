import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import axios from 'axios';
import ErrorBoundary from './ErrorBoundary';

function Chat({ currentUser, selectedFacultyId, assignedStudents }) {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser && currentUser._id) {
      fetchChats();
      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedChat) {
      scrollToBottom();
      messageInputRef.current?.focus();
    }
  }, [selectedChat]);

  // Add effect to handle pre-selected faculty
  useEffect(() => {
    if (selectedFacultyId) {
      handleUserSelect(selectedFacultyId);
    }
  }, [selectedFacultyId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/chat', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Failed to fetch chats. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!currentUser || !currentUser._id) return;
    
    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Filter users based on current user's role and assigned students
      const otherUsers = response.data.filter(user => {
        if (!user || !user._id) return false;
        
        // Don't show the current user
        if (user._id === currentUser._id) return false;
        
        // If current user is faculty, only show students
        if (currentUser.role === 'faculty') {
          // If assignedStudents is provided, only show those students
          if (assignedStudents && assignedStudents.length > 0) {
            return assignedStudents.some(student => student && student._id === user._id);
          }
          return user.role === 'student';
        }
        
        // If current user is student, only show faculty
        if (currentUser.role === 'student') {
          return user.role === 'faculty';
        }
        
        return false;
      });
      
      setUsers(otherUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
    }
  };

  const handleUserSelect = async (userId) => {
    if (!userId) return;
    
    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/chat/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedChat(response.data);
      setSelectedUser(userId);
      markMessagesAsRead(response.data._id);
    } catch (error) {
      console.error('Error selecting user:', error);
      if (error.response?.status === 403) {
        setError('Chat is only allowed between faculty and students.');
      } else {
        setError('Failed to start chat. Please try again.');
      }
      setSelectedChat(null);
      setSelectedUser('');
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat || !currentUser) return;

    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/chat/${selectedChat._id}/messages`,
        { content: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedChat(response.data);
      setMessage('');
      setChats(chats.map(chat => 
        chat._id === response.data._id ? response.data : chat
      ));
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const markMessagesAsRead = async (chatId) => {
    if (!chatId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/chat/${chatId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(chats.map(chat => 
        chat._id === response.data._id ? response.data : chat
      ));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  // Add hover effect styles for chat items
  const chatItemStyles = {
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'action.hover',
      transform: 'translateX(4px)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    borderRadius: '8px',
    mb: 1,
    cursor: 'pointer',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '3px',
      backgroundColor: 'primary.main',
      opacity: 0,
      transition: 'opacity 0.2s ease-in-out',
    },
    '&:hover::after': {
      opacity: 1,
    },
    '&.Mui-selected': {
      backgroundColor: 'primary.light',
      '&::after': {
        opacity: 1,
      },
      '& .MuiListItemText-primary': {
        color: 'primary.main',
        fontWeight: 600,
      },
    },
  };

  // Add message bubble styles
  const messageBubbleStyles = (isCurrentUser) => ({
    p: 2,
    borderRadius: '12px',
    maxWidth: '90%',
    minWidth: '200px',
    position: 'relative',
    backgroundColor: isCurrentUser ? 'primary.main' : 'grey.100',
    color: isCurrentUser ? 'white' : 'text.primary',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    '&:hover': {
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
      transform: 'scale(1.02)',
    },
    transition: 'all 0.2s ease-in-out',
    wordBreak: 'break-word',
  });

  // Add input field styles
  const inputFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '24px',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      '&.Mui-focused': {
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
      },
    },
  };

  // Add send button styles
  const sendButtonStyles = {
    borderRadius: '24px',
    minWidth: '100px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  };

  if (!currentUser || !currentUser._id) {
    return (
      <Box 
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}
        role="status"
        aria-label="Loading chat interface"
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // If there's a selected faculty, hide the user selection and show only the chat
  if (selectedFacultyId) {
    return (
      <ErrorBoundary>
        <Box 
          sx={{ 
            display: 'flex', 
            height: '600px',
            width: '100%',
            maxWidth: '1200px',
            mx: 'auto',
          }}
          role="region"
          aria-label="Chat interface"
        >
          <Paper 
            sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              width: '100%',
            }}
            role="main"
            aria-label="Chat messages"
          >
            {selectedChat ? (
              <>
                <Box 
                  sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}
                  role="banner"
                  aria-label="Chat header"
                >
                  <Typography variant="h6">
                    {selectedChat.participants.find(p => p._id !== currentUser._id)?.name || 'Unknown User'}
                  </Typography>
                </Box>
                <Box 
                  sx={{ flex: 1, overflow: 'auto', p: 2 }}
                  role="log"
                  aria-label="Message history"
                >
                  {selectedChat.messages.map((msg, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: msg.sender._id === currentUser._id ? 'flex-end' : 'flex-start',
                        mb: 2,
                        width: '100%',
                        px: 1,
                      }}
                      role="listitem"
                    >
                      <Paper
                        sx={messageBubbleStyles(msg.sender._id === currentUser._id)}
                      >
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontSize: '1rem',
                            lineHeight: 1.5,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {msg.content}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block',
                            mt: 0.5,
                            opacity: 0.7,
                            textAlign: msg.sender._id === currentUser._id ? 'right' : 'left',
                            fontSize: '0.75rem',
                          }}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>
                <Box 
                  sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}
                  role="form"
                  aria-label="Message input"
                >
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      inputRef={messageInputRef}
                      fullWidth
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      aria-label="Message input"
                    />
                    <Button
                      variant="contained"
                      onClick={sendMessage}
                      disabled={!message.trim()}
                      aria-label="Send message"
                    >
                      Send
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <Box 
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
                role="status"
                aria-label="Loading chat"
              >
                <Typography color="textSecondary">
                  Loading chat...
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </ErrorBoundary>
    );
  }

  // Original chat interface with user selection
  return (
    <ErrorBoundary>
      <Box 
        sx={{ 
          display: 'flex', 
          height: '600px', 
          gap: 2,
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto',
          '& .MuiPaper-root': {
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }
        }}
        role="region"
        aria-label="Chat interface"
      >
        <Paper 
          sx={{ 
            width: '300px', 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            flexShrink: 0,
          }}
          role="complementary"
          aria-label="Chat list"
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Chats
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="new-chat-label">Start New Chat</InputLabel>
            <Select
              labelId="new-chat-label"
              value={selectedUser}
              onChange={(e) => handleUserSelect(e.target.value)}
              label="Start New Chat"
              sx={{
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
            >
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
              {error}
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />
          <List 
            role="list"
            sx={{ 
              flex: 1,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.1)',
                borderRadius: '4px',
                '&:hover': {
                  background: 'rgba(0,0,0,0.2)',
                },
              },
            }}
          >
            {isLoading ? (
              <ListItem>
                <ListItemText primary="Loading chats..." />
              </ListItem>
            ) : chats.length === 0 ? (
              <ListItem>
                <ListItemText primary="No chats yet" />
              </ListItem>
            ) : (
              chats.map((chat) => {
                if (!chat || !chat.participants) return null;
                
                const otherParticipant = chat.participants.find(
                  p => p && p._id && p._id !== currentUser._id
                );
                
                if (!otherParticipant || !otherParticipant.name) return null;
                
                return (
                  <ListItem
                    key={chat._id}
                    component="div"
                    sx={chatItemStyles}
                    selected={selectedChat?._id === chat._id}
                    onClick={() => handleUserSelect(otherParticipant._id)}
                    role="listitem"
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        {otherParticipant.name[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={otherParticipant.name}
                      secondary={chat.lastMessageContent}
                      primaryTypographyProps={{
                        fontWeight: selectedChat?._id === chat._id ? 600 : 400,
                        transition: 'all 0.2s ease-in-out',
                      }}
                      secondaryTypographyProps={{
                        sx: {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s ease-in-out',
                        },
                      }}
                    />
                  </ListItem>
                );
              }).filter(Boolean)
            )}
          </List>
        </Paper>

        <Paper 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: '500px',
          }}
          role="main"
          aria-label="Chat messages"
        >
          {selectedChat ? (
            <>
              <Box 
                sx={{ 
                  p: 2, 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}
                role="banner"
                aria-label="Chat header"
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {selectedChat.participants.find(p => p._id !== currentUser._id)?.name || 'Unknown User'}
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  flex: 1, 
                  overflow: 'auto', 
                  p: 2,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: '4px',
                  },
                }}
                role="log"
                aria-label="Message history"
              >
                {selectedChat.messages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.sender._id === currentUser._id ? 'flex-end' : 'flex-start',
                      mb: 2,
                      width: '100%',
                      px: 1,
                    }}
                    role="listitem"
                  >
                    <Paper
                      sx={messageBubbleStyles(msg.sender._id === currentUser._id)}
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontSize: '1rem',
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {msg.content}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          mt: 0.5,
                          opacity: 0.7,
                          textAlign: msg.sender._id === currentUser._id ? 'right' : 'left',
                          fontSize: '0.75rem',
                        }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>
              <Box 
                sx={{ 
                  p: 2, 
                  borderTop: 1, 
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 1,
                }}
                role="form"
                aria-label="Message input"
              >
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    inputRef={messageInputRef}
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    aria-label="Message input"
                    sx={inputFieldStyles}
                  />
                  <Button
                    variant="contained"
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    aria-label="Send message"
                    sx={sendButtonStyles}
                  >
                    Send
                  </Button>
                </Box>
              </Box>
            </>
          ) : (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                bgcolor: 'background.default',
              }}
              role="status"
              aria-label="No chat selected"
            >
              <Typography color="textSecondary">
                Select a chat or start a new conversation
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </ErrorBoundary>
  );
}

export default Chat; 