
'use client';
import { useState, useRef, useEffect } from 'react';
import { useCdpAgent } from '../hooks/useCdpAgent';

export default function ChatComponent() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const messagesEndRef = useRef(null);
  const { sendMessage, error, isReady } = useCdpAgent();

  const handleSubmit = async (message: string) => {
    try {
      setMessages(prev => [...prev, { role: 'user', content: message }]);
      const responses = await sendMessage(message);
      responses.forEach(response => {
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      });
    } catch (err) {
      setMessages(prev => [...prev, { role: 'error', content: 'Failed to send message' }]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="w-full h-[80vh] flex flex-col bg-white rounded-lg shadow">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-4 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white rounded-br-none' 
                : msg.role === 'error'
                ? 'bg-red-500 text-white rounded-bl-none'
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <textarea
          placeholder={isReady ? "Send a message..." : "Initializing agent..."}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
          disabled={!isReady}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
      </div>
    </div>
  );
}
