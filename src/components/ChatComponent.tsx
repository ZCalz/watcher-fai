
'use client';
import { useState } from 'react';

export default function ChatComponent() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);

  const handleSubmit = (message: string) => {
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <div className="space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <textarea
          placeholder="Ask something..."
          className="w-full p-2 border rounded-lg"
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
