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
    headline: 'One workspace for endpoints, images, datasets, and jobs.',
    screenshot: {
      src: '/screenshot/dashboard.png',
      alt: 'Diamond workspace dashboard showing endpoint and workload management views.',
      sideCardLabel: 'What you can do',
      sideCardItems: [
        'Sign in with Globus Auth and enter the shared workspace.',
        'Refresh endpoints and load the metadata needed to run work.',
        'Build images, register datasets, and launch tasks from one place.'
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
  stats: [
    {
      value: 'Endpoints',
      label: 'managed and available views',
      detail:
        'Refresh state, load preparation metadata, and keep managed systems ready.'
    },
    {
      value: 'Images',
      label: 'container build workflows',
      detail:
        'Build runtime images in the same workspace used for endpoints and jobs.'
    },
    {
      value: 'Tasks',
      label: 'template-driven submission',
      detail:
        'Submit repeatable jobs with built-in templates such as vLLM and DeepSpeed SFT.'
    }
  ],
  highlights: {
    eyebrow: '',
    title: 'Core workflows in one place',
    description:
      'Diamond keeps endpoint setup, runtime packaging, datasets, and task launch in one workspace.',
    supportPanel: {
      eyebrow: '',
      title: '',
      points: [
        'Operators can keep readiness, images, and submissions in view together.',
        'Researchers get a shorter path from infrastructure to first run.',
        'Shared teams can standardize workflows without losing operational context.'
      ]
    },
    items: [
      {
        icon: 'cpu',
        eyebrow: '',
        title: 'Prepare endpoints',
        description:
          'Track managed and available systems, inspect details, and load account and partition metadata.'
      },
      {
        icon: 'layers',
        eyebrow: '',
        title: 'Build images',
        description:
          'Launch container builds so runtime environments stay tied to the endpoints and jobs that use them.'
      },
      {
        icon: 'database',
        eyebrow: '',
        title: 'Register datasets',
        description:
          'Store paths, machine context, and visibility settings so inputs are easy to find before submission.'
      },
      {
        icon: 'rocket',
        eyebrow: '',
        title: 'Launch tasks',
        description:
          'Submit work against active managed endpoints with reusable task templates.'
      }
    ]
  },
  workflow: {
    eyebrow: '',
    title: 'From setup to run',
    steps: [
      {
        title: 'Connect and prepare endpoints',
        description:
          'Refresh endpoint state and load the metadata needed for submission.'
      },
      {
        title: 'Stage runtime and data',
        description:
          'Choose the image and register the datasets a job will use.'
      },
      {
        title: 'Submit and monitor tasks',
        description:
          'Pick a template, submit the task, and follow it through completion.'
      }
    ]
  },
  personas: {
    eyebrow: '',
    title: 'For shared HPC teams',
    items: [
      {
        title: 'Platform operators',
        description:
          'Keep endpoint prep, runtime packaging, and submission flow visible in one place.'
      },
      {
        title: 'Researchers and ML practitioners',
        description:
          'Move from access to dataset selection and task submission with fewer handoffs.'
      },
      {
        title: 'Programs supporting repeatable compute workflows',
        description:
          'Share a repeatable path from ready infrastructure to containerized job execution.'
      }
    ]
  },
  audiencePanel: {
    eyebrow: '',
    title: 'A clearer path from ready infrastructure to submitted jobs.',
    description:
      'Diamond replaces scattered tools with one connected operating flow.'
  },
  closing: {
    eyebrow: '',
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
