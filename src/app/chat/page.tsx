"use client";


import React, { useState } from 'react';
// Base URL for the Render backend – you can change this if needed
const BASE_URL = 'https://dolo-hsil-1.onrender.com';

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<string>('');
  const [imageResponse, setImageResponse] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');

  // Step 1 – create a conversation
  const createConversation = async () => {
    try {
      const res = await fetch(`${BASE_URL}/conversation/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test Medical Session' }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setConversationId(data.id);
      setStatus('Conversation created');
    } catch (e) {
      console.error(e);
      setStatus('Failed to create conversation');
    }
  };

  // Step 2 – send text to Gemini
  const sendMessage = async () => {
    if (!conversationId) return setStatus('Create a conversation first');
    try {
      const res = await fetch(`${BASE_URL}/chat/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setStatus('Message sent');
    } catch (e) {
      console.error(e);
      setStatus('Failed to send message');
    }
  };

  // Step 3 – upload image for analysis
  const uploadImage = async () => {
    if (!conversationId) return setStatus('Create a conversation first');
    if (!imageFile) return setStatus('Select an image file');
    try {
      const form = new FormData();
      form.append('file', imageFile);
      form.append('message', 'Analyze this medical report thoroughly.');
      const res = await fetch(`${BASE_URL}/analyze-report/${conversationId}`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setImageResponse(JSON.stringify(data, null, 2));
      setStatus('Image uploaded and analysed');
    } catch (e) {
      console.error(e);
      setStatus('Failed to upload image');
    }
  };

  // Simple health check
  const checkHealth = async () => {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      const data = await res.json();
      setStatus(`Health: ${data.status}`);
    } catch (e) {
      console.error(e);
      setStatus('Health check failed');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Orchids AI Chat – Backend Integration Demo</h1>

      <button className="btn-primary" onClick={createConversation}>Create Conversation</button>
      {conversationId && <p>Conversation ID: {conversationId}</p>}

      <div className="space-y-2">
        <textarea
          className="w-full p-2 border rounded"
          rows={4}
          placeholder="Enter a message for Gemini"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button className="btn-primary" onClick={sendMessage}>Send Message</button>
        {response && <pre className="bg-gray-100 p-2 rounded">{response}</pre>}
      </div>

      <div className="space-y-2">
        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
        <button className="btn-primary" onClick={uploadImage}>Upload & Analyse Image</button>
        {imageResponse && <pre className="bg-gray-100 p-2 rounded">{imageResponse}</pre>}
      </div>

      <button className="btn-secondary" onClick={checkHealth}>Check Server Health</button>

      <p className="text-sm text-gray-600">{status}</p>
    </div>
  );
}
