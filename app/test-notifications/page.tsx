'use client';

import { useState } from 'react';
import { Bell, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TestNotificationsPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setResults(prev => [...prev, `${icon} ${message}`]);
  };

  const runTests = async () => {
    setResults([]);
    setLoading(true);

    try {
      // Test 1: Browser Support
      addResult('Testing browser support...', 'info');
      const hasNotification = 'Notification' in window;
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasPushManager = 'PushManager' in window;

      if (hasNotification && hasServiceWorker && hasPushManager) {
        addResult('Browser supports notifications ✓', 'success');
      } else {
        addResult(`Browser support incomplete: Notification=${hasNotification}, ServiceWorker=${hasServiceWorker}, PushManager=${hasPushManager}`, 'error');
        setLoading(false);
        return;
      }

      // Test 2: Current Permission
      addResult(`Current permission: ${Notification.permission}`, 'info');

      // Test 3: Request Permission
      addResult('Requesting notification permission...', 'info');
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        addResult('Permission granted ✓', 'success');
      } else {
        addResult(`Permission ${permission}`, 'error');
        setLoading(false);
        return;
      }

      // Test 4: Show Test Notification
      addResult('Showing test notification...', 'info');
      new Notification('Test Notification', {
        body: 'If you see this, basic notifications work!',
        icon: '/icons/icon-192x192.png'
      });
      addResult('Test notification shown ✓', 'success');

      // Test 5: Register Service Worker
      addResult('Registering service worker...', 'info');
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      addResult('Service worker registered ✓', 'success');

      // Test 6: Get VAPID Key
      addResult('Fetching VAPID public key...', 'info');
      const vapidResponse = await fetch('http://localhost:5000/api/notifications/vapid-public-key');
      if (!vapidResponse.ok) {
        addResult(`Failed to fetch VAPID key: ${vapidResponse.status}`, 'error');
        setLoading(false);
        return;
      }
      const { publicKey } = await vapidResponse.json();
      addResult(`VAPID key received: ${publicKey.substring(0, 20)}...`, 'success');

      // Test 7: Subscribe to Push
      addResult('Subscribing to push notifications...', 'info');
      
      function urlBase64ToUint8Array(base64String: string) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
          .replace(/\-/g, '+')
          .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
      addResult('Push subscription created ✓', 'success');

      // Test 8: Register with Backend
      addResult('Registering subscription with backend...', 'info');
      const token = localStorage.getItem('token');
      if (!token) {
        addResult('No auth token found. Please login first.', 'error');
        setLoading(false);
        return;
      }

      const registerResponse = await fetch('http://localhost:5000/api/notifications/register-web', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subscription: subscription.toJSON() })
      });

      if (registerResponse.ok) {
        addResult('Subscription registered with backend ✓', 'success');
      } else {
        addResult(`Failed to register with backend: ${registerResponse.status}`, 'error');
      }

      addResult('🎉 All tests passed! Notifications should work.', 'success');
    } catch (error: any) {
      addResult(`Error: ${error.message}`, 'error');
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-[#f5f8f7] dark:bg-[#0f231d] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-[#152e26] rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-8 h-8 text-[#059467]" />
            <h1 className="text-3xl font-bold text-[#0f231d] dark:text-white">
              Notification System Test
            </h1>
          </div>

          <p className="text-slate-600 dark:text-slate-400 mb-6">
            This page will test all aspects of the push notification system to help diagnose any issues.
          </p>

          <div className="flex gap-4 mb-6">
            <button
              onClick={runTests}
              disabled={loading}
              className="px-6 py-3 bg-[#059467] text-white rounded-lg font-medium hover:bg-[#047854] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Running Tests...' : 'Run All Tests'}
            </button>
            <button
              onClick={clearResults}
              disabled={loading}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Clear Results
            </button>
          </div>

          {results.length > 0 && (
            <div className="bg-slate-50 dark:bg-[#0f231d] rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-[#0f231d] dark:text-white mb-4">
                Test Results:
              </h2>
              <div className="space-y-2 font-mono text-sm">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="text-slate-700 dark:text-slate-300 py-1"
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">
              Prerequisites:
            </h3>
            <ul className="list-disc list-inside text-blue-800 dark:text-blue-400 space-y-1">
              <li>Backend server must be running on port 5000</li>
              <li>You must be logged in (have auth token)</li>
              <li>Browser must support notifications</li>
              <li>VAPID keys must be configured in backend</li>
            </ul>
          </div>

          <div className="mt-6 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-2">
              Manual Checks:
            </h3>
            <div className="text-amber-800 dark:text-amber-400 space-y-2">
              <p>1. Backend running: <code className="bg-amber-100 dark:bg-amber-900 px-2 py-1 rounded">curl http://localhost:5000/api/health</code></p>
              <p>2. Service worker: <a href="/sw.js" target="_blank" className="underline">Open /sw.js</a></p>
              <p>3. VAPID key: <a href="http://localhost:5000/api/notifications/vapid-public-key" target="_blank" className="underline">Check endpoint</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
