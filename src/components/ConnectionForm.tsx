'use client';

import { useState } from 'react';
import OBSService from '../services/obsService';

export default function ConnectionForm({ onConnected }: { onConnected: () => void }) {
  const [server, setServer] = useState('localhost');
  const [port, setPort] = useState('4455');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsConnecting(true);

    try {
      const obsService = OBSService.getInstance();
      const result = await obsService.connect(server, port, password);
      
      if (result.success) {
        onConnected();
      } else {
        setError(result.error || 'Connection failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Connect to OBS</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleConnect}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="server">
            Server
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 rounded-l-md border border-r-0 border-gray-300">
              ws://
            </span>
            <input
              id="server"
              type="text"
              value={server}
              onChange={(e) => setServer(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isConnecting}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="port">
            Port
          </label>
          <input
            id="port"
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isConnecting}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isConnecting}
          />
        </div>
        
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md font-bold text-white ${
            isConnecting ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect'}
        </button>
      </form>
    </div>
  );
}