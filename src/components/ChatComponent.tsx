
'use client';
import { AgentChat } from '@coinbase/onchainkit/chat';
import { useState } from 'react';

export default function ChatComponent() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <AgentChat
        messages={messages}
        onSubmit={(message) => {
          setMessages((prev) => [...prev, { role: 'user', content: message }]);
        }}
        className="w-full"
        textareaProps={{
          placeholder: 'Ask something...',
          className: 'w-full p-2 border rounded-lg',
        }}
        buttonProps={{
          className: 'mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg',
        }}
      />
    </div>
  );
}
