// WebRTC service for handling calls with TURN server support and enhanced signaling

export interface WebRTCConfig {
  configuration: RTCConfiguration;
  hasTurnServer: boolean;
  turnServerCount?: number;
  stunServerCount?: number;
  totalServers?: number;
  timestamp: number;
  cacheStatus?: string;
  cacheExpiresAt?: number;
}

export interface CallState {
  status: 'idle' | 'calling' | 'ringing' | 'connecting' | 'connected' | 'ended';
  callId?: string;
  type?: 'audio' | 'video';
  startTime?: number;
  connectedTime?: number;
  duration?: number;
  error?: string;
}

export interface CallParticipant {
  id: string;
  name: string;
  imageUrl: string;
}

/**
 * Fetches WebRTC configuration from backend (includes TURN server if configured)
 */
export async function getWebRTCConfiguration(): Promise<WebRTCConfig> {
  try {
    const response = await fetch('/api/calls/webrtc-config', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get WebRTC configuration');
    }

    const config: WebRTCConfig = await response.json();
    console.log('WebRTC configuration loaded:', {
      hasStunServers: (config.configuration.iceServers?.length ?? 0) > 0,
      hasTurnServer: config.hasTurnServer,
      iceServersCount: config.configuration.iceServers?.length ?? 0,
      turnServerCount: config.turnServerCount || 0,
      cacheStatus: config.cacheStatus || 'unknown'
    });

    return config;
  } catch (error) {
    console.error('Error fetching WebRTC configuration:', error);
    
    // Fallback to STUN-only configuration
    return {
      configuration: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10
      },
      hasTurnServer: false,
      timestamp: Date.now()
    };
  }
}

/**
 * Creates an RTCPeerConnection with the provided configuration
 */
export function createPeerConnection(
  configuration: RTCConfiguration,
  callbacks: {
    onIceCandidate?: (candidate: RTCIceCandidate) => void;
    onTrack?: (event: RTCTrackEvent) => void;
    onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
    onIceConnectionStateChange?: (state: RTCIceConnectionState) => void;
  } = {}
): RTCPeerConnection {
  const pc = new RTCPeerConnection(configuration);

  // Handle ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      callbacks.onIceCandidate?.(event.candidate);
    }
  };

  // Handle remote tracks
  pc.ontrack = (event) => {
    callbacks.onTrack?.(event);
  };

  // Monitor connection state
  pc.onconnectionstatechange = () => {
    console.log('Connection state:', pc.connectionState);
    callbacks.onConnectionStateChange?.(pc.connectionState);
  };

  // Monitor ICE connection state
  pc.oniceconnectionstatechange = () => {
    console.log('ICE connection state:', pc.iceConnectionState);
    callbacks.onIceConnectionStateChange?.(pc.iceConnectionState);
    
    // Attempt ICE restart on failure
    if (pc.iceConnectionState === 'failed') {
      console.log('ICE connection failed, attempting restart...');
      pc.restartIce();
    }
  };

  return pc;
}

/**
 * Gets user media with fallback quality options
 */
export async function getUserMedia(
  constraints: MediaStreamConstraints,
  fallbackOptions: MediaStreamConstraints[] = []
): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.warn('Failed to get media with primary constraints:', error);
    
    // Try fallback options
    for (const fallback of fallbackOptions) {
      try {
        console.log('Trying fallback constraints:', fallback);
        return await navigator.mediaDevices.getUserMedia(fallback);
      } catch (fallbackError) {
        console.warn('Fallback failed:', fallbackError);
      }
    }
    
    throw error;
  }
}

/**
 * Gets media constraints based on call type and device capabilities
 */
export function getMediaConstraints(
  callType: 'audio' | 'video',
  quality: 'low' | 'medium' | 'high' = 'medium'
): { 
  primary: MediaStreamConstraints; 
  fallbacks: MediaStreamConstraints[] 
} {
  const baseAudio = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  };

  if (callType === 'audio') {
    return {
      primary: { audio: baseAudio, video: false },
      fallbacks: [
        { audio: true, video: false }
      ]
    };
  }

  // Video call constraints based on quality
  const videoConstraints = {
    low: {
      width: { ideal: 480 },
      height: { ideal: 360 },
      frameRate: { ideal: 15 }
    },
    medium: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 }
    },
    high: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 }
    }
  };

  return {
    primary: {
      audio: baseAudio,
      video: {
        ...videoConstraints[quality],
        facingMode: 'user'
      }
    },
    fallbacks: [
      // Fallback 1: Lower quality
      {
        audio: baseAudio,
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 }
        }
      },
      // Fallback 2: Very low quality
      {
        audio: baseAudio,
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { ideal: 10 }
        }
      },
      // Fallback 3: Audio only
      {
        audio: baseAudio,
        video: false
      }
    ]
  };
}

/**
 * Enhanced call manager with acknowledgment and timeout handling
 */
export class CallManager {
  private socket: any;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private callState: CallState = { status: 'idle' };
  private callTimeout: NodeJS.Timeout | null = null;
  private configuration: RTCConfiguration | null = null;

  constructor(socket: any) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    // Enhanced call signaling with acknowledgment
    this.socket.on('call:incoming', (data: any) => {
      const { from, offer, type, callId } = data;
      
      // Send acknowledgment that call was received
      this.socket.emit('call:received', { callId, from });
      
      this.handleIncomingCall({ from, offer, type, callId });
    });

    this.socket.on('call:ringing', (data: any) => {
      const { callId } = data;
      if (this.callState.callId === callId) {
        this.updateCallState({ status: 'ringing' });
      }
    });

    this.socket.on('call:accepted', (data: any) => {
      const { answer, callId } = data;
      if (this.callState.callId === callId) {
        this.handleCallAccepted(answer);
      }
    });

    this.socket.on('call:rejected', (data: any) => {
      const { callId } = data;
      if (this.callState.callId === callId) {
        this.handleCallRejected();
      }
    });

    this.socket.on('call:ended', (data: any) => {
      const { callId, reason, duration } = data;
      if (this.callState.callId === callId) {
        this.handleCallEnded(reason, duration);
      }
    });

    this.socket.on('call:timeout', () => {
      this.handleCallTimeout();
    });

    this.socket.on('call:user_offline', () => {
      this.handleUserOffline();
    });

    this.socket.on('ice:candidate', (data: any) => {
      const { candidate } = data;
      this.handleIceCandidate(candidate);
    });
  }

  async initializeCall(
    recipientId: string,
    callType: 'audio' | 'video',
    quality: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    try {
      // Get WebRTC configuration
      if (!this.configuration) {
        const config = await getWebRTCConfiguration();
        this.configuration = config.configuration;
      }

      // Get user media
      const constraints = getMediaConstraints(callType, quality);
      this.localStream = await getUserMedia(constraints.primary, constraints.fallbacks);

      // Create peer connection
      this.peerConnection = createPeerConnection(this.configuration, {
        onIceCandidate: (candidate) => {
          this.socket.emit('ice:candidate', {
            to: recipientId,
            candidate
          });
        },
        onTrack: (event) => {
          this.remoteStream = event.streams[0];
          this.onRemoteStreamReceived?.(this.remoteStream);
        },
        onConnectionStateChange: (state) => {
          this.handleConnectionStateChange(state);
        }
      });

      // Add local tracks
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      // Create and send offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      const callId = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      this.updateCallState({
        status: 'calling',
        callId,
        type: callType,
        startTime: Date.now()
      });

      this.socket.emit('call:offer', {
        to: recipientId,
        offer,
        type: callType,
        callId
      });

      // Set call timeout (30 seconds)
      this.callTimeout = setTimeout(() => {
        if (this.callState.status === 'calling') {
          this.handleCallTimeout();
        }
      }, 30000);

    } catch (error) {
      console.error('Error initializing call:', error);
      this.updateCallState({ 
        status: 'ended', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async acceptCall(offer: RTCSessionDescriptionInit): Promise<void> {
    try {
      if (!this.peerConnection || !this.localStream) {
        throw new Error('Call not properly initialized');
      }

      await this.peerConnection.setRemoteDescription(offer);
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.socket.emit('call:answer', {
        to: this.callState.callId?.split('_')[0], // Extract caller ID from callId
        answer,
        callId: this.callState.callId
      });

      this.updateCallState({ status: 'connecting' });

    } catch (error) {
      console.error('Error accepting call:', error);
      this.rejectCall();
      throw error;
    }
  }

  rejectCall(): void {
    if (this.callState.callId) {
      this.socket.emit('call:reject', {
        to: this.callState.callId.split('_')[0], // Extract caller ID
        callId: this.callState.callId
      });
    }
    this.cleanup();
  }

  endCall(): void {
    if (this.callState.callId) {
      this.socket.emit('call:end', {
        to: this.callState.callId.split('_')[0], // Extract other user ID
        callId: this.callState.callId
      });
    }
    this.cleanup();
  }

  private handleIncomingCall(data: any): void {
    this.updateCallState({
      status: 'connecting',
      callId: data.callId,
      type: data.type,
      startTime: Date.now()
    });

    this.onIncomingCall?.(data);
  }

  private async handleCallAccepted(answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(answer);
        this.updateCallState({ 
          status: 'connected',
          connectedTime: Date.now()
        });
        this.clearCallTimeout();
      }
    } catch (error) {
      console.error('Error handling call accepted:', error);
      this.endCall();
    }
  }

  private handleCallRejected(): void {
    this.updateCallState({ status: 'ended' });
    this.cleanup();
    this.onCallRejected?.();
  }

  private handleCallEnded(reason?: string, duration?: number): void {
    this.updateCallState({ 
      status: 'ended',
      duration: duration || (this.callState.connectedTime ? Date.now() - this.callState.connectedTime : 0)
    });
    this.cleanup();
    this.onCallEnded?.(reason, duration);
  }

  private handleCallTimeout(): void {
    this.updateCallState({ status: 'ended', error: 'Call timed out' });
    this.cleanup();
    this.onCallTimeout?.();
  }

  private handleUserOffline(): void {
    this.updateCallState({ status: 'ended', error: 'User is offline' });
    this.cleanup();
    this.onUserOffline?.();
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  private handleConnectionStateChange(state: RTCPeerConnectionState): void {
    console.log('Connection state changed:', state);
    
    switch (state) {
      case 'connected':
        if (this.callState.status !== 'connected') {
          this.updateCallState({ 
            status: 'connected',
            connectedTime: Date.now()
          });
        }
        break;
      case 'disconnected':
        // Temporary disconnection, try to reconnect
        break;
      case 'failed':
        this.updateCallState({ status: 'ended', error: 'Connection failed' });
        this.cleanup();
        break;
      case 'closed':
        this.cleanup();
        break;
    }
  }

  private updateCallState(newState: Partial<CallState>): void {
    this.callState = { ...this.callState, ...newState };
    this.onCallStateChange?.(this.callState);
  }

  private clearCallTimeout(): void {
    if (this.callTimeout) {
      clearTimeout(this.callTimeout);
      this.callTimeout = null;
    }
  }

  private cleanup(): void {
    this.clearCallTimeout();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    this.remoteStream = null;
    this.updateCallState({ status: 'idle' });
  }

  // Media controls
  toggleMute(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // Return muted state
      }
    }
    return false;
  }

  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return !videoTrack.enabled; // Return video off state
      }
    }
    return false;
  }

  // Getters
  getCallState(): CallState {
    return this.callState;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  // Event callbacks (to be set by the UI component)
  onIncomingCall?: (data: any) => void;
  onCallStateChange?: (state: CallState) => void;
  onRemoteStreamReceived?: (stream: MediaStream) => void;
  onCallRejected?: () => void;
  onCallEnded?: (reason?: string, duration?: number) => void;
  onCallTimeout?: () => void;
  onUserOffline?: () => void;
}

/**
 * Utility function to format call duration
 */
export function formatCallDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
}

/**
 * Check if WebRTC is supported in the current browser
 */
export function isWebRTCSupported(): boolean {
  return !!(
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    window.RTCPeerConnection &&
    window.RTCIceCandidate &&
    window.RTCSessionDescription
  );
}