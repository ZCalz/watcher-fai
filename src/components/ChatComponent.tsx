
'use client';
import { useState, useRef, useEffect } from 'react';

export default function ChatComponent() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (message: string) => {
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
  };

  return (
    <div className="w-full h-[80vh] flex flex-col bg-white rounded-lg shadow">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-4 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white rounded-br-none' 
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
          placeholder="Send a message..."
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
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
