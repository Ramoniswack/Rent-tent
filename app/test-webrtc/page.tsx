'use client';

import { useState, useRef, useEffect } from 'react';
import { Video, Phone, PhoneOff, Mic, MicOff, VideoOff } from 'lucide-react';

export default function TestWebRTCPage() {
  const [hasAudio, setHasAudio] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState('');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    checkDevices();
  }, []);

  const checkDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      setDevices(deviceList);
      
      const audioDevices = deviceList.filter(d => d.kind === 'audioinput');
      const videoDevices = deviceList.filter(d => d.kind === 'videoinput');
      
      setHasAudio(audioDevices.length > 0);
      setHasVideo(videoDevices.length > 0);
    } catch (err: any) {
      setError(`Failed to enumerate devices: ${err.message}`);
    }
  };

  const testAudio = async () => {
    setIsTesting(true);
    setError('');
    
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);
      setError('✅ Audio is working! You should see the microphone permission granted.');
      
      // Stop after 3 seconds
      setTimeout(() => {
        audioStream.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsTesting(false);
      }, 3000);
    } catch (err: any) {
      setError(`❌ Audio test failed: ${err.message}`);
      setIsTesting(false);
    }
  };

  const testVideo = async () => {
    setIsTesting(true);
    setError('');
    
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false
      });
      
      setStream(videoStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
      }
      
      setError('✅ Video is working! You should see yourself in the video below.');
    } catch (err: any) {
      setError(`❌ Video test failed: ${err.message}`);
      setIsTesting(false);
    }
  };

  const testBoth = async () => {
    setIsTesting(true);
    setError('');
    
    try {
      const bothStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: true
      });
      
      setStream(bothStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = bothStream;
      }
      
      setError('✅ Audio and Video are working! You should see and hear yourself.');
    } catch (err: any) {
      setError(`❌ Test failed: ${err.message}`);
      setIsTesting(false);
    }
  };

  const stopTest = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTesting(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          WebRTC Test Page
        </h1>

        {/* Device Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Device Status
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mic className={`w-5 h-5 ${hasAudio ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-gray-700 dark:text-gray-300">
                Microphone: {hasAudio ? '✅ Available' : '❌ Not found'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Video className={`w-5 h-5 ${hasVideo ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-gray-700 dark:text-gray-300">
                Camera: {hasVideo ? '✅ Available' : '❌ Not found'}
              </span>
            </div>
          </div>
        </div>

        {/* Devices List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Available Devices
          </h2>
          <div className="space-y-2">
            {devices.length === 0 ? (
              <p className="text-gray-500">No devices found</p>
            ) : (
              devices.map((device, index) => (
                <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{device.kind}:</span> {device.label || 'Unnamed device'}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Media Access
          </h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testAudio}
              disabled={!hasAudio || isTesting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Mic className="w-5 h-5" />
              Test Audio
            </button>
            
            <button
              onClick={testVideo}
              disabled={!hasVideo || isTesting}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Video className="w-5 h-5" />
              Test Video
            </button>
            
            <button
              onClick={testBoth}
              disabled={!hasAudio || !hasVideo || isTesting}
              className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Phone className="w-5 h-5" />
              Test Both
            </button>
            
            {stream && (
              <button
                onClick={stopTest}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="w-5 h-5" />
                Stop Test
              </button>
            )}
          </div>
        </div>

        {/* Error/Success Message */}
        {error && (
          <div className={`rounded-lg p-4 mb-6 ${
            error.includes('✅') 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            {error}
          </div>
        )}

        {/* Video Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Video Preview
          </h2>
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!stream && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <VideoOff className="w-16 h-16 mx-auto mb-2" />
                  <p>No video stream</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Instructions
          </h2>
          <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-300 text-sm">
            <li>Click "Test Audio" to check if your microphone works</li>
            <li>Click "Test Video" to check if your camera works</li>
            <li>Click "Test Both" to test audio and video together</li>
            <li>Grant permissions when your browser asks</li>
            <li>If tests fail, check browser permissions in settings</li>
          </ul>
        </div>

        {/* Troubleshooting */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
            Troubleshooting
          </h2>
          <ul className="list-disc list-inside space-y-1 text-yellow-800 dark:text-yellow-300 text-sm">
            <li><strong>NotAllowedError:</strong> You denied permission. Check browser settings.</li>
            <li><strong>NotFoundError:</strong> No camera/microphone found. Connect a device.</li>
            <li><strong>NotReadableError:</strong> Device is in use by another app. Close other apps.</li>
            <li><strong>HTTPS Required:</strong> WebRTC requires HTTPS (except on localhost).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
