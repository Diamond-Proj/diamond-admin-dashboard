export const landingPageContent = {
  seo: {
    description:
      'Diamond HPC is a unified control plane for managed endpoints, container images, datasets, and task submission workflows.'
  },
  header: {
    eyebrow: 'Diamond HPC',
    label: 'Unified operations for research compute',
    docsHref: 'https://docs.diamondhpc.ai',
    docsLabel: 'Docs',
    signInHref: '/sign-in',
    signInLabel: 'Sign in',
    primaryCta: {
      href: '/dashboard',
      label: 'Open workspace',
      authenticatedLabel: 'Go to workspace'
    }
  },
  hero: {
    headline: 'Fine-tune and serve models from one workspace.',
    screenshot: {
      src: '/screenshot/dashboard.png',
      alt: 'Diamond workspace dashboard showing endpoint and workload management views.',
      sideCardLabel: 'What you can do',
      sideCardItems: [
        'Leverage your HPC allocations (e.g. NSF ACCESS)',
        'Train and fine-tune models for specific applications',
        'Serve those models on managed endpoints'
      ]
    },
    primaryCta: {
      label: 'Open workspace',
      authenticatedLabel: 'Return to workspace',
      href: '/dashboard'
    },
    secondaryCta: {
      label: 'Sign in',
      authenticatedLabel: 'Read the docs',
      href: '/sign-in',
      authenticatedHref: 'https://docs.diamondhpc.ai'
    }
  },
  hpcSystems: {
    eyebrow: 'Supported compute systems',
    title: 'Bring Diamond to the HPC environments your team already uses.',
    items: [
      {
        name: 'Delta',
        org: 'NCSA'
      },
      {
        name: 'Delta AI',
        org: 'NCSA'
      },
      {
        name: 'Frontera',
        org: 'TACC'
      },
      {
        name: 'Stampede3',
        org: 'TACC'
      },
      {
        name: 'Lonestar6',
        org: 'TACC'
      },
      {
        name: 'Anvil',
        org: 'RCAC'
      },
      {
        name: 'Bridges2',
        org: 'PSC'
      }
    ]
  },
  highlights: {
    title: 'Core workflows in one place',
    description:
      'Diamond keeps endpoint setup, runtime packaging, datasets, and task launch in one workspace.',
    supportPanel: {
      points: [
        'Operators can keep readiness, images, and submissions in view together.',
        'Researchers get a shorter path from infrastructure to first run.',
        'Shared teams can standardize workflows without losing operational context.'
      ]
    },
    items: [
      {
        icon: 'cpu',
        title: 'Prepare endpoints',
        description:
          'Manage available HPC systems to be used for task execution.'
      },
      {
        icon: 'layers',
        title: 'Build images',
        description:
          'Launch container builds so runtime environments stay tied to the endpoints and jobs that use them.'
      },
      {
        icon: 'database',
        title: 'Register datasets',
        description:
          'Store paths, machine context, and visibility settings so inputs are easy to find before submission.'
      },
      {
        icon: 'rocket',
        title: 'Launch tasks',
        description:
          'Submit work against active managed endpoints with reusable task templates.'
      }
    ]
  },
  closing: {
    title: 'Run the workflow in Diamond.',
    description:
      'Bring endpoints online, prepare runtime environments, register datasets, and launch reusable tasks from one interface.',
    primaryCta: {
      label: 'Open workspace',
      authenticatedLabel: 'Return to workspace',
      href: '/dashboard'
    },
    secondaryCta: {
      label: 'Read the docs',
      href: 'https://docs.diamondhpc.ai'
    }
  }
} as const;

export type LandingPageContent = typeof landingPageContent;
