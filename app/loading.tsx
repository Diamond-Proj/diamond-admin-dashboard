import { Logo } from '@/components/icons';

export default function Loading() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      <div className="relative flex -translate-y-14 flex-col items-center justify-center p-10 lg:translate-x-[-110px] lg:translate-y-[-60px]">
        {/* Diamond Logo */}
        <div className="mb-8">
          <div className="mb-4 inline-flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br from-rose_red/10 to-rose_red/5 shadow-xl dark:from-honolulu_blue/10 dark:to-honolulu_blue/5">
            <Logo width={120} height={120} className="h-24 w-24" />
          </div>
        </div>

        {/* Two-line message */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-lg text-gray-600 dark:text-gray-400">
            We&apos;re preparing something special for you.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Please wait while we load the content.
          </p>
        </div>

        {/* Three dots animation */}
        <div className="flex justify-center space-x-3">
          <div className="h-4 w-4 animate-bounce rounded-full bg-rose_red [animation-delay:0ms] [animation-duration:1.4s] dark:bg-honolulu_blue"></div>
          <div className="h-4 w-4 animate-bounce rounded-full bg-rose_red [animation-delay:200ms] [animation-duration:1.4s] dark:bg-honolulu_blue"></div>
          <div className="h-4 w-4 animate-bounce rounded-full bg-rose_red [animation-delay:400ms] [animation-duration:1.4s] dark:bg-honolulu_blue"></div>
        </div>
      </div>
    </div>
  );
}
