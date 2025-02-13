import { is_authenticated } from '@/lib/authUtils';
import { JobComposerForm } from './form';

export default async function JobComposerPage() {
  const isAuthenticated = await is_authenticated();
  return (
    <main className="flex flex-1 flex-col gap-4 m-8 md:gap-8 md:p-6 items-start">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Job Composer</h1>
      </div>
      <div className="flex flex-2 flex-row items-start gap-2 px-8 w-full">
        <div className="flex flex-col items-center gap-2 w-[60%]">
          <JobComposerForm />
        </div>
        <div className="flex-col gap-6 w-[40%] hidden" id="logComponents">
          <div className="bg-card dark:bg-card/80 shadow-lg rounded-xl p-6 border border-border h-fit">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Build Logs</h2>
              <div id="taskStdoutPollingStatus" className="text-sm text-muted-foreground">
                Waiting for build to start...
              </div>
            </div>
            <div id="stdoutLogs" className="font-mono text-sm whitespace-pre-wrap bg-muted/50 dark:bg-muted p-4 rounded-md min-h-[200px] max-h-[600px] overflow-y-auto">
              No logs available yet...
            </div>
          </div>
          <div className="bg-card dark:bg-card/80 shadow-lg rounded-xl p-6 border border-border h-fit">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Error Logs</h2>
              <div id="taskStderrPollingStatus" className="text-sm text-muted-foreground">
                Waiting for stderr logs...
              </div>
            </div>
            <div id="stderrLogs" className="font-mono text-sm whitespace-pre-wrap bg-muted/50 dark:bg-muted p-4 rounded-md min-h-[200px] max-h-[600px] overflow-y-auto">
              No stderr logs available yet...
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
