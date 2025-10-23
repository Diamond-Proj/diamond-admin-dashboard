'use client';

import { Server, Container, Terminal } from 'lucide-react';
import { BuilderFormData, ReviewSection } from '@/app/images/types';
import { isPerlmutterHost } from '@/app/utils/hosts';

interface BuilderReviewProps {
  formData: BuilderFormData;
}

export function BuilderReview({ formData }: BuilderReviewProps) {
  const isPerlmutter = isPerlmutterHost(formData.endpointHost);

  const computingItems = [
    { label: 'Endpoint', value: formData.endpoint },
    ...(isPerlmutter
      ? []
      : [
          {
            label: 'Partition',
            value: formData.partition || 'Not set'
          }
        ]),
    {
      label: 'Account',
      value: isPerlmutter
        ? 'Not required (Perlmutter)'
        : formData.account || 'Not set'
    },
    {
      label: 'Reservation',
      value: isPerlmutter
        ? 'Not required (Perlmutter)'
        : formData.reservation || 'None'
    }
  ];

  const sections: ReviewSection[] = [
    {
      title: 'Computing Resources',
      icon: <Server className="text-primary h-5 w-5" />,
      items: computingItems
    },
    {
      title: 'Container Configuration',
      icon: <Container className="text-primary h-5 w-5" />,
      items: [
        { label: 'Container Name', value: formData.containerName },
        {
          label: 'Build Location',
          value: isPerlmutter
            ? 'Not applicable (Perlmutter)'
            : formData.location || 'Default'
        },
        { label: 'Base Image', value: formData.baseImage }
      ]
    },
    {
      title: 'Build Configuration',
      icon: <Terminal className="text-primary h-5 w-5" />,
      items: isPerlmutter
        ? [
            {
              label: 'Shifter Configuration',
              value: 'No additional configuration required'
            }
          ]
        : [
            {
              label: 'Dependencies',
              value: formData.dependencies ? 'Configured' : 'None',
              expandable: formData.dependencies,
              content: formData.dependencies
            },
            {
              label: 'Environment Variables',
              value: formData.environment ? 'Configured' : 'None',
              expandable: formData.environment,
              content: formData.environment
            },
            {
              label: 'Build Commands',
              value: formData.commands ? 'Configured' : 'None',
              expandable: formData.commands,
              content: formData.commands
            }
          ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Build Process Information */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
            <span className="text-xs text-white">i</span>
          </div>
          <div className="text-sm">
            <p className="mb-1 font-medium text-blue-900 dark:text-blue-100">
              Build Process Information
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              {`The build process may take several minutes to complete depending on your configuration. You'll be able to monitor the build logs in real-time once the process starts.`}
            </p>
          </div>
        </div>
      </div>

      {/* Review Sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-card dark:bg-card rounded-lg border p-6 dark:border-gray-800"
          >
            <div className="mb-4 flex items-center gap-2">
              {section.icon}
              <h4 className="text-lg font-semibold">{section.title}</h4>
            </div>

            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground text-sm font-medium">
                      {item.label}:
                    </span>
                    <span className="ml-4 flex-1 text-right text-sm">
                      {item.value}
                    </span>
                  </div>

                  {item.expandable && (
                    <div className="bg-muted/50 dark:bg-muted/30 mt-2 rounded-md p-3">
                      <pre className="text-muted-foreground font-mono text-xs whitespace-pre-wrap">
                        {item.content}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
