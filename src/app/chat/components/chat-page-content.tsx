'use client';

import { useState } from 'react';
import { ChatSelection } from './chat-selection';
import { ConversationWindow } from './conversation-window';

interface ChatPageContentProps {
  isAuthenticated: boolean;
}

export function ChatPageContent({ isAuthenticated }: ChatPageContentProps) {
  const [llm, setLLM] = useState('');
  const [conversation, setConversation] = useState('');

  const onCreateNewConversation = () => {
    console.log('Creating new conversation...');
    setConversation(`new-conversation-${Date.now()}`); // Example: set a new conversation ID
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-3xl font-bold">
            Active Chatbots
          </h1>
          <p className="text-muted-foreground text-lg">
            Interact with your LLMs running in the cloud.
          </p>
        </div>
      </div>

      <ChatSelection
        llm={llm}
        setLLM={setLLM}
        conversation={conversation}
        setConversation={setConversation}
        onCreateNewConversation={onCreateNewConversation}
      />

      { llm != '' && conversation != '' ? (
        <ConversationWindow
          llm={llm}
          conversation={conversation}
        />
      ) : <></>}
    </div>
  );
}