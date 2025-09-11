import { is_authenticated } from '@/lib/authUtils'
import { DataTransferPanel } from './panel'

export default async function DataTransferPage() {
  const isAuthenticated = await is_authenticated();
  return (
    <main className="flex flex-1 flex-col gap-4 m-8 md:gap-8 md:p-6 items-start">
      <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl mb-6 text-foreground text-left">Data Transfer</h1>
      <div className="flex flex-2 flex-col items-center gap-2 px-8 w-full">
        <DataTransferPanel isAuthenticated={isAuthenticated}/>
      </div>
    </main>
  );
}