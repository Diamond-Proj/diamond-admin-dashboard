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
        'Sign in through Globus Auth and enter a shared workspace built for research teams.',
        'Refresh and manage endpoints, load endpoint metadata, and keep online systems ready for use.',
        'Build container images, register datasets, and launch tasks without jumping across separate admin tools.'
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
        'Diamond distinguishes managed systems from available ones and can refresh endpoint state and preparation metadata.'
    },
    {
      value: 'Images',
      label: 'container build workflows',
      detail:
        'Users can launch image build flows from the same workspace that tracks the endpoints and jobs those containers support.'
    },
    {
      value: 'Tasks',
      label: 'template-driven submission',
      detail:
        'The platform supports reusable submission patterns including vLLM inference and DeepSpeed SFT workflows.'
    }
  ],
  highlights: {
    eyebrow: 'Core capabilities',
    title: 'What the platform already does',
    description:
      'Diamond brings the operational pieces of HPC work into one interface so teams can move from platform setup to workload execution with less friction.',
    supportPanel: {
      eyebrow: 'In practice',
      title:
        'Diamond helps teams spend less time coordinating between tools and more time getting workloads ready to run.',
      points: [
        'Operators can keep endpoint readiness, runtime packaging, and task launch in view at the same time.',
        'Researchers get a clearer path from available infrastructure to a validated first run.',
        'Shared teams can standardize repeatable workflows without hiding the operational details that still matter.'
      ]
    },
    items: [
      {
        icon: 'cpu',
        eyebrow: 'Endpoints',
        title: 'Register, refresh, and prepare execution targets.',
        description:
          'Diamond surfaces managed and available endpoints, checks endpoint details, and runs preparation steps that load account and partition metadata for online managed systems.'
      },
      {
        icon: 'layers',
        eyebrow: 'Container images',
        title: 'Build the runtime environment inside the same workspace.',
        description:
          'The image area lets users launch container build workflows so application environments stay connected to the endpoints and jobs that will use them.'
      },
      {
        icon: 'database',
        eyebrow: 'Datasets',
        title: 'Register datasets with searchable paths and visibility controls.',
        description:
          'Dataset records include Globus paths, system paths, machine context, and public or private visibility so teams can find the right inputs before submission.'
      },
      {
        icon: 'rocket',
        eyebrow: 'Tasks',
        title: 'Launch work through reusable task templates.',
        description:
          'Diamond supports task submission against active managed endpoints and includes template flows for workloads such as vLLM inference and DeepSpeed supervised fine-tuning.'
      }
    ]
  },
  workflow: {
    eyebrow: 'Workflow',
    title: 'A practical path from platform setup to workload execution',
    steps: [
      {
        title: 'Connect and prepare endpoints',
        description:
          'Bring endpoint state into Diamond, identify which systems are managed, and load the metadata needed for later submissions.'
      },
      {
        title: 'Stage runtime and data',
        description:
          'Build or select the container image, then register datasets with the machine and path information jobs will need.'
      },
      {
        title: 'Submit and monitor tasks',
        description:
          'Choose a template, submit against an active managed endpoint, and track task status from pending to running to completion.'
      }
    ]
  },
  personas: {
    eyebrow: 'Who it helps',
    title: 'Built for the teams operating shared HPC workflows',
    items: [
      {
        title: 'Platform operators',
        description:
          'Keep endpoint management, metadata preparation, and runtime packaging visible in one place instead of scattering them across scripts and internal notes.'
      },
      {
        title: 'Researchers and ML practitioners',
        description:
          'Move from authenticated access to dataset selection and task submission with fewer hidden handoffs between systems.'
      },
      {
        title: 'Programs supporting repeatable compute workflows',
        description:
          'Use one interface to expose the supported path from infrastructure readiness through containerized, template-backed job execution.'
      }
    ]
  },
  audiencePanel: {
    eyebrow: 'Why teams use it',
    title:
      'Diamond makes the path from infrastructure readiness to job launch easier to understand and easier to repeat.',
    description:
      'Instead of splitting endpoint setup, container workflows, dataset registration, and submission across separate tools, Diamond presents them as one connected operating flow.'
  },
  closing: {
    eyebrow: 'Next step',
    title: 'Bring the operational workflow into one place with Diamond.',
    description:
      'Use Diamond to bring endpoints online, prepare runtime environments, register datasets, and launch reusable task workflows from a single interface designed for shared HPC operations.',
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
