'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';

interface ConversationWindowProps {
  llm: string;
  conversation: string;
}

export function ConversationWindow({ llm, conversation }: ConversationWindowProps) {
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // fetch messages from HTTP server here
    if (llm && conversation) {
      setMessages([
        { id: '1', role: 'user', content: `Hello LLM ${llm}, regarding conversation ${conversation}!` },
        { id: '2', role: 'assistant', content: 'Hi there! How can I help you today?' },
        { id: '3', role: 'user', content: 'I need some information about the project.' },
        { id: '4', role: 'assistant', content: 'Sure, what specifically would you like to know?' },
      ]);
    } else {
      setMessages([]);
    }
  }, [llm, conversation, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[70vh] rounded-xl border border-gray-200/60 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length > 0 ? (
          messages.map((m) => (
            <div key={m.id} className={`mb-4 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-3 rounded-lg ${
                m.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
              }`}>
                {m.content}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground">Select an LLM and a conversation to start chatting.</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t border-gray-200/60 p-4 dark:border-gray-700/60">
        <div className="relative flex items-center">
          <input
            className="flex-1 rounded-lg border border-gray-300 bg-white py-3 pr-10 pl-4 text-gray-900 transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-400"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="absolute right-3 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"

          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
