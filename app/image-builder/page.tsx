import { is_authenticated } from '@/lib/authUtils'
import { ImageBuilderStepper } from './stepper'

export default async function ImageBuilderPage() {
  const isAuthenticated = await is_authenticated()
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 items-start bg-background dark:bg-background/90">
      <div className="w-full max-w-[1400px] mx-auto md:mx-10">
        <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl mb-6 text-foreground text-left">Image Builder Debugger</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ImageBuilderStepper />
          <div className="bg-card dark:bg-card/80 shadow-lg rounded-xl p-6 border border-border h-fit">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Build Logs</h2>
              <div id="pollingStatus" className="text-sm text-muted-foreground">
                Waiting for build to start...
              </div>
            </div>
            <div id="buildLogs" className="font-mono text-sm whitespace-pre-wrap bg-muted/50 dark:bg-muted p-4 rounded-md min-h-[200px] max-h-[600px] overflow-y-auto">
              No logs available yet...
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}