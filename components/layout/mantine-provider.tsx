'use client';

import { MantineProvider, createTheme } from '@mantine/core';

// Minimal Mantine theme that won't conflict with Tailwind
const mantineTheme = createTheme({
  components: {
    // Override components to use minimal styling
  },
});

export function ClientMantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={mantineTheme}>
      {children}
    </MantineProvider>
  );
} 
