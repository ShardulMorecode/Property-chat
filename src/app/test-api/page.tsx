'use client';
import { useState } from 'react';

export default function TestAPI() {
  const [message, setMessage] = useState('3BHK in Pune under 1.2 Cr');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResponse(null);
    
    try {
      console.log('Sending request...');
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });

      console.log('Response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
      
    } catch (error: any) {
      console.error('Test failed:', error);
      setResponse({ 
        error: true,
        message: error.message,
        type: error.name
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">API Test Page</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Test Message:</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your property query..."
        />
      </div>

      <button 
        onClick={testAPI} 
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {loading ? 'Testing API...' : 'Test Chat API'}
      </button>

      {/* First test the GET routes */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <button 
          onClick={async () => {
            const res = await fetch('/api/test');
            const data = await res.json();
            setResponse({ testApi: data });
          }}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          Test /api/test
        </button>
        
        <button 
          onClick={async () => {
            const res = await fetch('/api/chat');
            const data = await res.json();
            setResponse({ chatApiGet: data });
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
        >
          Test /api/chat (GET)
        </button>
      </div>
      
      {response && (
        <div className="mt-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">API Response:</h2>
          <pre className="bg-white p-4 rounded border overflow-auto max-h-96">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}