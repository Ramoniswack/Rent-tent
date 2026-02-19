'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { MessageListSkeleton } from '../../components/SkeletonCard';
import { messageAPI } from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import { 
  Search, Send, Plus, Phone, Video, Info, 
  ArrowLeft, Smile, Loader2, Image as ImageIcon, X,
  PhoneOff, VideoOff, Mic, MicOff
} from 'lucide-react';

interface Match {
  _id: string;
  id: string;
  name: string;
  username?: string;
  profilePicture?: string;
  imageUrl: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

interface Message {
  _id: string;
  id: string;
  sender: string | { _id: string; name: string };
  senderId: string;
  text: string;
  image?: string;
  timestamp: string;
  createdAt: string;
  read: boolean;
}

function MessagesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set<string>());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ from: string; type: 'audio' | 'video'; offer?: RTCSessionDescriptionInit } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
    // Initialize ringtone audio
    if (typeof window !== 'undefined') {
      ringtoneRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXvzn0pBSh+zPDajzsKElyx6OyrWBQLSKDf8sFuIwUrgc7y2Yk2CBhkuezooVARDEyl4fG5ZRwFNo3V7859KQUofsrw2o87ChJcr+jrq1gVC0ig3/LBbiMFK4HO8tmJNggYZLns6KFQEQxMpeHxuWUcBTaN1e/OfSkFKH7K8NqPOwoSXK/o66tYFQtIoN/ywW4jBSuBzvLZiTYIGGS57OihUBEMTKXh8bllHAU2jdXvzn0pBSh+yvDajzsKElyx6OyrWBULSKDf8sFuIwUrgc7y2Yk2CBhkuezooVARDEyl4fG5ZRwFNo3V7859KQUofsrw2o87ChJcr+jrq1gVC0ig3/LBbiMFK4HO8tmJNggYZLns6KFQEQxMpeHxuWUcBTaN1e/OfSkFKH7K8NqPOwoSXK/o66tYFQtIoN/ywW4jBSuBzvLZiTYIGGS57OihUBEMTKXh8bllHAU2jdXvzn0pBSh+yvDajzsKElyx6OyrWBULSKDf8sFuIwUrgc7y2Yk2CBhkuezooVARDEyl4fG5ZRwFNo3V7859KQUofsrw2o87ChJcr+jrq1gVC0ig3/LBbiMFK4HO8tmJNggYZLns6KFQEQxMpeHxuWUcBTaN1e/OfSkFKH7K8NqPOwoSXK/o66tYFQtIoN/ywW4jBQ==');
      ringtoneRef.current.loop = true;
    }
  }, []);

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Get current user and setup socket
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id || user._id);
      }
    }
  }, []);

  const { socket, isConnected } = useSocket(currentUserId);

  // Setup socket listeners
  useEffect(() => {
    if (!socket) return;

    // Receive new message
    socket.on('message:receive', (message: any) => {
      console.log('Received message:', message);
      const formattedMessage = {
        _id: message._id,
        id: message._id,
        sender: message.sender,
        senderId: typeof message.sender === 'string' ? message.sender : message.sender._id,
        text: message.text || '',
        image: message.image,
        timestamp: message.createdAt,
        createdAt: message.createdAt,
        read: message.read
      };
      
      setMessages(prev => [...prev, formattedMessage]);
      scrollToBottom();
      
      // Update last message in matches
      const senderId = typeof message.sender === 'string' ? message.sender : message.sender._id;
      const lastMessageText = message.image ? '📷 Image' : message.text;
      setMatches(prev => prev.map(m => 
        m.id === senderId || m._id === senderId
          ? { ...m, lastMessage: lastMessageText, timestamp: message.createdAt }
          : m
      ));
    });

    // Message sent confirmation
    socket.on('message:sent', (message: any) => {
      console.log('Message sent:', message);
    });

    // User online/offline status
    socket.on('user:online', (userId: string) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
      setMatches(prev => prev.map(m => 
        (m.id === userId || m._id === userId) ? { ...m, online: true } : m
      ));
    });

    socket.on('user:offline', (userId: string) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      setMatches(prev => prev.map(m => 
        (m.id === userId || m._id === userId) ? { ...m, online: false } : m
      ));
    });

    // Typing indicators
    socket.on('typing:start', ({ userId }: { userId: string }) => {
      if (selectedMatch && (selectedMatch.id === userId || selectedMatch._id === userId)) {
        setIsTyping(true);
      }
    });

    socket.on('typing:stop', ({ userId }: { userId: string }) => {
      if (selectedMatch && (selectedMatch.id === userId || selectedMatch._id === userId)) {
        setIsTyping(false);
      }
    });

    // Call signaling
    socket.on('call:incoming', ({ from, offer, type }: { from: string; offer: RTCSessionDescriptionInit; type: 'audio' | 'video' }) => {
      setIncomingCall({ from, type, offer });
      // Play ringtone
      if (ringtoneRef.current) {
        ringtoneRef.current.play().catch(err => console.log('Ringtone play failed:', err));
      }
    });

    socket.on('call:accepted', async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      // Stop ringtone when call is accepted
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
      if (peerConnectionRef.current && answer) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('call:rejected', () => {
      // Stop ringtone
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
      endCall();
      showNotification('Call was rejected', 'error');
    });

    socket.on('call:ended', () => {
      // Stop ringtone
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
      endCall();
    });

    socket.on('ice:candidate', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (peerConnectionRef.current && candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    });

    return () => {
      socket.off('message:receive');
      socket.off('message:sent');
      socket.off('user:online');
      socket.off('user:offline');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('call:incoming');
      socket.off('call:accepted');
      socket.off('call:rejected');
      socket.off('call:ended');
      socket.off('ice:candidate');
    };
  }, [socket, selectedMatch]);

  // Fetch matches
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await messageAPI.getMatches();
        
        // Format matches data
        const formattedMatches = data.map((match: any) => ({
          _id: match._id || match.id,
          id: match._id || match.id,
          name: match.name || 'Unknown',
          username: match.username,
          profilePicture: match.profilePicture,
          imageUrl: match.profilePicture || match.imageUrl || 'https://i.pravatar.cc/100',
          lastMessage: match.lastMessage || 'No messages yet',
          timestamp: match.timestamp || new Date().toISOString(),
          unread: match.unread || 0,
          online: onlineUsers.has(match._id || match.id)
        }));
        
        setMatches(formattedMatches);
        
        // Select first match by default
        if (formattedMatches.length > 0 && !selectedMatch) {
          setSelectedMatch(formattedMatches[0]);
        }
      } catch (err: any) {
        console.error('Error fetching matches:', err);
        setError(err.message || 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [onlineUsers, selectedMatch]);

  // Fetch messages when match is selected
  useEffect(() => {
    if (!selectedMatch) return;

    const fetchMessages = async () => {
      try {
        const data = await messageAPI.getMessages(selectedMatch._id || selectedMatch.id);
        
        // Format messages with safe access
        const formattedMessages = data.map((msg: any) => {
          const senderId = msg.senderId || 
                          (typeof msg.sender === 'string' ? msg.sender : msg.sender?._id) || 
                          '';
          
          return {
            _id: msg._id || msg.id,
            id: msg._id || msg.id,
            sender: msg.sender,
            senderId: senderId,
            text: msg.text || '',
            image: msg.image,
            timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
            createdAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
            read: msg.read || false
          };
        });
        
        setMessages(formattedMessages);
        // Don't auto-scroll on initial load - let user see the conversation naturally
      } catch (err: any) {
        console.error('Error fetching messages:', err);
        setError(err.message || 'Failed to load messages');
      }
    };

    fetchMessages();
  }, [selectedMatch]);

  // Scroll to bottom of messages
  const scrollToBottom = (smooth: boolean = true) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }, 100);
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !selectedMatch) return;

    socket.emit('typing:start', { receiverId: selectedMatch._id || selectedMatch.id });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { receiverId: selectedMatch._id || selectedMatch.id });
    }, 1000);
  };

  // Common emojis
  const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '🌟', '💯', '🙌', '👏', '🤝', '💪', '🎯', '✅', '🚀', '🌈', '☀️', '🌙', '⭐'];

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Initialize peer connection
  const createPeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    };

    const pc = new RTCPeerConnection(configuration);

    // ICE candidate handler
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        console.log('Sending ICE candidate:', event.candidate);
        socket.emit('ice:candidate', {
          to: selectedMatch?._id || selectedMatch?.id,
          candidate: event.candidate
        });
      }
    };

    // Track handler for receiving remote stream
    pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind, event.streams[0]);
      const remoteElement = callType === 'video' ? remoteVideoRef.current : remoteAudioRef.current;
      
      if (remoteElement && event.streams[0]) {
        console.log('Setting remote stream to element');
        remoteElement.srcObject = event.streams[0];
        
        // Force play
        remoteElement.play().catch(err => {
          console.error('Error playing remote stream:', err);
          showNotification('Click to enable audio', 'info');
        });
      } else {
        console.error('Remote element not available');
      }
    };

    // Connection state change handler
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        showNotification('Call connected', 'success');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        showNotification('Call disconnected', 'error');
        endCall();
      }
    };

    // ICE connection state change handler
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        showNotification('Connection lost', 'error');
      }
    };

    return pc;
  };

  // Test media devices
  const testMediaDevices = async () => {
    try {
      console.log('Testing media devices...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('Available devices:', devices);
      
      const audioDevices = devices.filter(d => d.kind === 'audioinput');
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      
      console.log(`Found ${audioDevices.length} microphones and ${videoDevices.length} cameras`);
      
      if (audioDevices.length === 0) {
        showNotification('No microphone found', 'error');
        return false;
      }
      
      // Test audio
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Audio test successful:', audioStream);
      audioStream.getTracks().forEach(track => track.stop());
      
      showNotification('Media devices working!', 'success');
      return true;
    } catch (error: any) {
      console.error('Media device test failed:', error);
      showNotification(`Media test failed: ${error.message}`, 'error');
      return false;
    }
  };

  // Start call
  const startCall = async (type: 'audio' | 'video') => {
    if (!selectedMatch || !socket) {
      showNotification('Cannot start call: No connection', 'error');
      return;
    }

    try {
      console.log(`Starting ${type} call...`);
      
      // Request media permissions
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: type === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got local stream:', stream);

      localStreamRef.current = stream;
      
      // Display local video
      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        console.log('Adding track:', track.kind);
        pc.addTrack(track, stream);
      });

      // Create and send offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === 'video'
      });
      
      await pc.setLocalDescription(offer);
      console.log('Created offer:', offer);

      socket.emit('call:offer', {
        to: selectedMatch._id || selectedMatch.id,
        offer: pc.localDescription,
        type
      });

      setInCall(true);
      setCallType(type);
      showNotification(`Calling ${selectedMatch.name}...`, 'info');
      
      // Play ringtone while waiting for answer
      if (ringtoneRef.current) {
        ringtoneRef.current.play().catch(err => console.log('Ringtone play failed:', err));
      }
    } catch (error: any) {
      console.error('Error starting call:', error);
      
      let errorMessage = 'Could not start call';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera/microphone permission denied';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera/microphone found';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera/microphone is already in use';
      }
      
      showNotification(errorMessage, 'error');
      endCall();
    }
  };

  // Accept call
  const acceptCall = async () => {
    if (!incomingCall || !socket) {
      showNotification('Cannot accept call', 'error');
      return;
    }

    // Stop ringtone
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }

    try {
      console.log('Accepting call...');
      
      // Request media permissions
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: incomingCall.type === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got local stream:', stream);

      localStreamRef.current = stream;
      
      // Display local video
      if (localVideoRef.current && incomingCall.type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        console.log('Adding track:', track.kind);
        pc.addTrack(track, stream);
      });

      // Set remote description from the offer
      if (incomingCall.offer) {
        console.log('Setting remote description:', incomingCall.offer);
        await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      }

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('Created answer:', answer);

      // Send answer back
      socket.emit('call:answer', { 
        to: incomingCall.from, 
        answer: pc.localDescription
      });

      setInCall(true);
      setCallType(incomingCall.type);
      setIncomingCall(null);
      showNotification('Call connected', 'success');
    } catch (error: any) {
      console.error('Error accepting call:', error);
      
      let errorMessage = 'Could not accept call';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera/microphone permission denied';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera/microphone found';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera/microphone is already in use';
      }
      
      showNotification(errorMessage, 'error');
      rejectCall();
    }
  };

  // Reject call
  const rejectCall = () => {
    if (!incomingCall || !socket) return;
    
    // Stop ringtone
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    
    socket.emit('call:reject', { to: incomingCall.from });
    setIncomingCall(null);
  };

  // End call
  const endCall = () => {
    console.log('Ending call...');
    
    // Stop ringtone
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    
    // Notify other user
    if (socket && selectedMatch && inCall) {
      socket.emit('call:end', { to: selectedMatch._id || selectedMatch.id });
    }

    // Stop all local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      localStreamRef.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setInCall(false);
    setCallType(null);
    setIsMuted(false);
    setIsVideoOff(false);
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Send message via WebSocket
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedImage) || !selectedMatch || sending || !socket) return;

    try {
      setSending(true);
      
      let imageUrl = '';
      
      // Upload image if selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          imageUrl = data.url;
        }
      }
      
      // Send via WebSocket
      socket.emit('message:send', {
        senderId: currentUserId,
        receiverId: selectedMatch._id || selectedMatch.id,
        text: newMessage.trim(),
        image: imageUrl
      });

      // Optimistically add message to UI
      const optimisticMessage = {
        _id: Date.now().toString(),
        id: Date.now().toString(),
        sender: currentUserId,
        senderId: currentUserId,
        text: newMessage.trim(),
        image: imageUrl,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        read: false
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');
      handleRemoveImage();
      scrollToBottom();
      
      // Update last message in matches list
      const lastMessageText = imageUrl ? '📷 Image' : newMessage.trim();
      setMatches(matches.map(m => 
        (m.id === selectedMatch.id || m._id === selectedMatch._id)
          ? { ...m, lastMessage: lastMessageText, timestamp: new Date().toISOString() }
          : m
      ));
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Filter matches by search
  const filteredMatches = matches.filter(match =>
    match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="hidden md:block">
        <Header />
      </div>
      
      {!mounted ? (
        <div className="flex h-[calc(100vh-128px)] overflow-hidden bg-white dark:bg-[#0f231d]">
          {/* Sidebar Skeleton */}
          <aside className="w-full md:w-[380px] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132a24]">
            {/* Search Skeleton */}
            <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800">
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
            </div>
            
            {/* Conversation List Skeleton */}
            <div className="flex-1 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Chat Skeleton */}
          <main className="flex-1 flex flex-col bg-white dark:bg-[#0b1a16]">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-32" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-20" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
              </div>
            </div>

            {/* Messages Skeleton */}
            <div className="flex-1 overflow-hidden px-6 py-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  {i % 2 !== 0 && <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />}
                  <div className={`space-y-1 ${i % 2 === 0 ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`h-12 rounded-2xl animate-pulse ${
                      i % 2 === 0 ? 'bg-[#059467]/20 w-48' : 'bg-slate-200 dark:bg-slate-700 w-64'
                    }`} />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-16" />
                  </div>
                </div>
              ))}
            </div>

            {/* Input Skeleton */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="flex-1 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
              </div>
            </div>
          </main>
        </div>
      ) : (
      <div className="flex flex-col h-[calc(100dvh-80px)] md:h-[calc(100vh-128px)] overflow-hidden bg-white dark:bg-[#0f231d] animate-fadeInContent">
        {/* Connection Status */}
        {!isConnected && currentUserId && (
          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-center py-2.5 text-sm font-semibold shadow-lg animate-pulse">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting to real-time messaging...
            </div>
          </div>
        )}

        {/* Incoming Call Modal */}
        {incomingCall && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#132a24] rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
              <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#0d1c17] dark:text-white mb-2">
                Incoming {incomingCall.type} call
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {selectedMatch?.name} is calling you
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={rejectCall}
                  className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
                <button
                  onClick={acceptCall}
                  className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
                >
                  <Phone className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 animate-slideIn">
            <div className={`rounded-lg shadow-lg px-6 py-4 flex items-center gap-3 min-w-[300px] ${
              notification.type === 'error' ? 'bg-red-500' :
              notification.type === 'success' ? 'bg-green-500' :
              'bg-blue-500'
            } text-white`}>
              {notification.type === 'error' && <X className="w-5 h-5" />}
              {notification.type === 'success' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {notification.type === 'info' && <Info className="w-5 h-5" />}
              <p className="font-medium">{notification.message}</p>
            </div>
          </div>
        )}

        {/* Call UI Overlay */}
        {inCall && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Remote Video/Audio */}
            <div className="flex-1 relative">
              {callType === 'video' ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  onLoadedMetadata={() => console.log('Remote video loaded')}
                  onError={(e) => console.error('Remote video error:', e)}
                />
              ) : (
                <audio
                  ref={remoteAudioRef}
                  autoPlay
                  onLoadedMetadata={() => console.log('Remote audio loaded')}
                  onError={(e) => console.error('Remote audio error:', e)}
                />
              )}
              {callType === 'audio' && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-slate-700 mx-auto mb-4 flex items-center justify-center">
                      <Phone className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-white text-xl font-semibold">{selectedMatch?.name}</p>
                    <p className="text-white/60 text-sm mt-2">Audio Call</p>
                  </div>
                </div>
              )}
            </div>

            {/* Local Video (Picture-in-Picture) */}
            {callType === 'video' && (
              <div className="absolute top-4 right-4 w-32 h-48 bg-slate-900 rounded-lg overflow-hidden shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onLoadedMetadata={() => console.log('Local video loaded')}
                  onError={(e) => console.error('Local video error:', e)}
                />
              </div>
            )}

            {/* Call Controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full transition-colors ${
                  isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
                } text-white`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              
              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-colors ${
                    isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
                  } text-white`}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </button>
              )}
              
              <button
                onClick={endCall}
                className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>

            {/* Call Info */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center bg-black/30 px-4 py-2 rounded-lg">
              <p className="text-white text-lg font-semibold mb-1">{selectedMatch?.name}</p>
              <p className="text-white/80 text-sm">
                {callType === 'video' ? 'Video Call' : 'Audio Call'}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar - Conversation List */}
        <aside 
          className={`w-full md:w-[380px] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132a24] z-10 h-full fixed md:relative transform transition-transform duration-300 ease-in-out ${
            showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Search */}
          <div className="px-4 md:px-5 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex w-full items-center rounded-2xl bg-slate-50 dark:bg-[#1a2c26] px-3 md:px-4 py-2.5 md:py-3 transition-all focus-within:ring-2 focus-within:ring-[#059467]/30 focus-within:bg-white dark:focus-within:bg-[#1f3630]">
              <Search className="w-4 h-4 md:w-5 md:h-5 text-[#059467] dark:text-[#059467]/80 mr-2 md:mr-3" />
              <input
                className="w-full bg-transparent border-none text-xs md:text-sm text-[#0d1c17] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-0 p-0"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-4">
                <MessageListSkeleton />
              </div>
            ) : error ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-500 dark:text-red-400 mb-3 font-semibold">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-[#059467] text-sm font-semibold hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  {matches.length === 0 ? 'No conversations yet' : 'No matches found'}
                </p>
              </div>
            ) : (
              filteredMatches.map((match) => (
                <div
                  key={match._id || match.id}
                  onClick={() => {
                    setSelectedMatch(match);
                    setShowSidebar(false);
                  }}
                  className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 cursor-pointer transition-all duration-200 border-l-4 active:scale-[0.98] ${
                    selectedMatch?._id === match._id || selectedMatch?.id === match.id
                      ? 'bg-[#059467]/10 border-[#059467] shadow-sm'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-[#1a2c26]/50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-cover bg-center shadow-md ring-2 ring-white dark:ring-[#132a24]"
                      style={{ backgroundImage: `url(${match.imageUrl})` }}
                    />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white dark:border-[#132a24] transition-colors ${
                      match.online ? 'bg-[#059467]' : 'bg-slate-300'
                    }`} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="text-xs md:text-sm font-bold truncate text-[#0d1c17] dark:text-white">
                        {match.name}
                      </p>
                      <span className={`text-[10px] md:text-xs font-medium ml-2 ${
                        selectedMatch?._id === match._id || selectedMatch?.id === match.id ? 'text-[#059467]' : 'text-slate-400'
                      }`}>
                        {formatTime(match.timestamp)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <p className={`text-xs md:text-sm truncate ${
                        selectedMatch?._id === match._id || selectedMatch?.id === match.id
                          ? 'text-[#059467] dark:text-[#059467]/90 font-medium'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {match.lastMessage}
                      </p>
                      {match.unread > 0 && (
                        <span className="flex items-center justify-center min-w-[18px] md:min-w-[20px] h-4 md:h-5 px-1 md:px-1.5 bg-[#059467] text-white text-[10px] md:text-xs font-bold rounded-full shadow-lg">
                          {match.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Right Panel - Active Chat */}
        <main className={`flex-1 flex flex-col bg-white dark:bg-[#0b1a16] relative w-full h-full ${
          showSidebar ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedMatch ? (
            <>
              {/* Chat Header */}
              <div className="flex-none flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-[#132a24]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-full bg-cover bg-center shadow-md ring-2 ring-white dark:ring-[#132a24]"
                      style={{ backgroundImage: `url(${selectedMatch.imageUrl})` }}
                    />
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#132a24] transition-colors ${
                      selectedMatch.online ? 'bg-[#059467]' : 'bg-slate-300'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-[#0d1c17] dark:text-white text-base font-bold leading-tight">
                      {selectedMatch.name}
                    </h3>
                    <p className={`text-xs font-semibold transition-colors ${
                      isTyping ? 'text-[#059467] animate-pulse' : selectedMatch.online ? 'text-[#059467]' : 'text-slate-400'
                    }`}>
                      {isTyping ? 'typing...' : selectedMatch.online ? 'Online now' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => startCall('audio')}
                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all hover:scale-110 text-[#059467]"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => startCall('video')}
                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all hover:scale-110 text-[#059467]"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all hover:scale-110 text-slate-500 dark:text-slate-400">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar flex flex-col bg-white dark:bg-[#0b1a16]">
                {messages.map((message, index) => {
                  const isOwn = message.senderId === currentUserId;
                  const showAvatar = !isOwn && (index === 0 || messages[index - 1].senderId !== message.senderId);

                  return (
                    <div
                      key={message._id || message.id}
                      className={`flex gap-3 animate-fadeIn ${isOwn ? 'max-w-[85%] md:max-w-[70%] self-end justify-end' : 'max-w-[85%] md:max-w-[70%]'}`}
                    >
                      {!isOwn && (
                        <div className="flex-none self-end mb-1">
                          {showAvatar ? (
                            <div
                              className="w-8 h-8 rounded-full bg-cover bg-center shadow-sm ring-2 ring-white dark:ring-[#0b1a16]"
                              style={{ backgroundImage: `url(${selectedMatch.imageUrl})` }}
                            />
                          ) : (
                            <div className="w-8 h-8" />
                          )}
                        </div>
                      )}
                      <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : ''}`}>
                        <div className={`rounded-2xl text-sm shadow-md transition-all hover:shadow-lg ${
                          isOwn
                            ? 'bg-gradient-to-br from-[#059467] to-[#047854] text-white rounded-br-md'
                            : 'bg-white dark:bg-[#1f3630] text-[#0d1c17] dark:text-slate-200 rounded-bl-md border border-slate-100 dark:border-slate-700'
                        }`}>
                          {message.image && (
                            <div className="relative">
                              <img 
                                src={message.image} 
                                alt="Shared image" 
                                className="max-w-[250px] max-h-[300px] rounded-t-2xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(message.image, '_blank')}
                              />
                            </div>
                          )}
                          {message.text && (
                            <p className={`leading-relaxed ${message.image ? 'p-4 pt-3' : 'p-4'}`}>{message.text}</p>
                          )}
                        </div>
                        <div className={`flex items-center gap-1.5 ${isOwn ? 'mr-1' : 'ml-1'}`}>
                          <span className="text-xs text-slate-400 font-medium">
                            {formatTime(message.timestamp || message.createdAt)}
                          </span>
                          {isOwn && message.read && (
                            <svg className="w-4 h-4 text-[#059467]" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" transform="translate(3, 0)" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="flex-none p-4 md:p-6 bg-white dark:bg-[#132a24] border-t border-slate-200 dark:border-slate-800 shadow-lg">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-3 relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-w-[150px] max-h-[150px] rounded-lg object-cover border-2 border-[#059467]"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="mb-3 p-3 bg-slate-50 dark:bg-[#1a2c26] rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap gap-2">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="text-2xl hover:scale-125 transition-transform p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                          type="button"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <form className="flex items-end gap-3" onSubmit={handleSendMessage}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    className="p-3 text-slate-400 hover:text-[#059467] transition-all rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-110"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-6 h-6" />
                  </button>
                  <div className="flex-1 bg-slate-50 dark:bg-[#1a2c26] rounded-[24px] flex items-center px-5 py-3.5 focus-within:ring-2 focus-within:ring-[#059467]/30 transition-all shadow-sm hover:shadow-md">
                    <input
                      className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none p-0 text-[#0d1c17] dark:text-white placeholder:text-slate-400 text-sm"
                      placeholder="Type your message..."
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      disabled={sending}
                      autoComplete="off"
                    />
                    <button
                      className="ml-2 text-slate-400 hover:text-[#059467] transition-all hover:scale-110"
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="w-6 h-6" />
                    </button>
                  </div>
                  <button
                    className="p-3.5 bg-gradient-to-br from-[#059467] to-[#047854] hover:from-[#047854] hover:to-[#036543] transition-all rounded-full text-white shadow-lg shadow-[#059467]/30 hover:shadow-xl hover:shadow-[#059467]/40 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                    type="submit"
                    disabled={(!newMessage.trim() && !selectedImage) || sending}
                  >
                    {sending ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Send className="w-6 h-6" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white dark:from-[#0b1a16] dark:to-[#0f231d]">
              <div className="text-center animate-fadeIn">
                <div className="w-28 h-28 bg-slate-100 dark:bg-[#1f3630] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Send className="w-14 h-14 text-[#059467] dark:text-[#059467]/80" />
                </div>
                <h3 className="text-2xl font-bold text-[#0d1c17] dark:text-white mb-3">
                  Select a conversation
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Choose a conversation from the list to start messaging with your travel buddies
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInContent {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-fadeInContent {
          animation: fadeInContent 0.4s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e2e8f0;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #cbd5e1;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #1f3630;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #2a453b;
        }
      `}</style>
      </div>
      )}
    </>
  );
}


export default function ProtectedMessagesPage() {
  return (
    <ProtectedRoute>
      <MessagesPage />
    </ProtectedRoute>
  );
}
