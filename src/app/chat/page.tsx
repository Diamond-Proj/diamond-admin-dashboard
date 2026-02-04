import { ChatPageContent } from './components/chat-page-content';

export default async function ChatPage() {
  const isAuthenticated = true;

  return (
    <main className="min-h-full bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <ChatPageContent isAuthenticated={isAuthenticated} />
      </div>
    </main>
  );
}