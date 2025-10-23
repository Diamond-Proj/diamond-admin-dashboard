'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BuilderSteps } from './builder/builder-steps';
import { BuilderReview } from './builder/builder-review';
import { BuilderLogs } from './builder/builder-logs';
import { useToast } from '@/components/ui/use-toast';
import {
  BuilderFormData,
  ImageBuilderPayload,
  ImageBuilderResponse
} from '@/app/images/types';
import { isPerlmutterHost } from '@/app/utils/hosts';

interface ImageBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_STEPS = [
  {
    id: 'endpoint',
    title: 'Endpoint & Resources',
    description:
      'Select the HPC endpoint and configure compute resource allocation settings'
  },
  {
    id: 'container',
    title: 'Container Info',
    description: 'Configure your container name, build location, and base image'
  },
  {
    id: 'build',
    title: 'Build Configuration',
    description:
      'Configure build dependencies, environment variables, and commands'
  },
  {
    id: 'review',
    title: 'Review & Build',
    description: 'Review your configuration before starting the build process'
  }
];

const PERLMUTTER_STEPS = [
  {
    id: 'endpoint',
    title: 'Perlmutter Image',
    description: 'Select the endpoint and enter the Shifter image to pull'
  },
  {
    id: 'review',
    title: 'Review & Pull',
    description: 'Review your configuration before submitting the pull job'
  }
];

export function ImageBuilderModal({
  isOpen,
  onClose,
  onSuccess
}: ImageBuilderModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<BuilderFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buildData, setBuildData] = useState<{
    task_id: string;
    container_name: string;
  } | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setCurrentStep(0);
      setFormData({});
      setIsSubmitting(false);
      setBuildData(null);
      setShowLogs(false);
    }
  }, [isOpen]);

  const updateFormData = useCallback((stepData: Partial<BuilderFormData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  }, []);

  const isPerlmutter = isPerlmutterHost(formData.endpointHost);

  const steps = useMemo(
    () => (isPerlmutter ? PERLMUTTER_STEPS : DEFAULT_STEPS),
    [isPerlmutter]
  );

  useEffect(() => {
    const lastIndex = steps.length - 1;
    if (currentStep > lastIndex) {
      setCurrentStep(Math.max(0, lastIndex));
    }
  }, [currentStep, steps]);

  const currentStepConfig = steps[currentStep];
  const currentStepId = currentStepConfig?.id;
  const isReviewStep = currentStepId === 'review';

  const canProceed = () => {
    switch (currentStepId) {
      case 'endpoint':
        if (isPerlmutter) {
          return Boolean(formData.endpoint && formData.baseImage);
        }
        return Boolean(formData.endpoint && formData.partition && formData.account);
      case 'container':
        return Boolean(formData.containerName && formData.baseImage);
      case 'build':
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const containerName = isPerlmutter
        ? formData.baseImage || ''
        : formData.containerName || '';

      const payload: ImageBuilderPayload = {
        endpoint: formData.endpoint || '',
        partition: isPerlmutter ? '' : formData.partition || '',
        name: containerName,
        location: isPerlmutter ? '' : formData.location || '',
        base_image: formData.baseImage || '',
        dependencies: isPerlmutter ? '' : formData.dependencies || '',
        environment: isPerlmutter ? '' : formData.environment || '',
        commands: isPerlmutter ? '' : formData.commands || '',
        account: formData.account || '',
        reservation: formData.reservation || ''
      };

      const response = await fetch('/api/image_builder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok)
        throw new Error('Failed to submit image build configuration');

      const result: ImageBuilderResponse = await response.json();
      setBuildData({
        task_id: result.task_id,
        container_name: result.container_name
      });
      setShowLogs(true);

      toast({
        title: 'Build Started',
        description:
          'Your container image build has been submitted successfully!'
      });
    } catch (error) {
      console.error('Error submitting build:', error);
      toast({
        title: 'Build Failed',
        description:
          'Failed to submit image build configuration. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuildComplete = () => {
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Image Builder
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {showLogs ? 'Build in Progress' : currentStepConfig?.description}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        {!showLogs && (
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-rose-600 transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
          {showLogs && buildData ? (
            <BuilderLogs
              taskId={buildData.task_id}
              containerName={buildData.container_name}
              endpoint={formData.endpoint!}
              onComplete={handleBuildComplete}
            />
          ) : (
            <div className="p-6">
              {isReviewStep ? (
                <BuilderReview formData={formData as BuilderFormData} />
              ) : currentStepId ? (
                <BuilderSteps
                  stepId={currentStepId}
                  formData={formData}
                  onUpdate={updateFormData}
                />
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        {!showLogs && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex cursor-pointer items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex cursor-pointer items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="flex cursor-pointer items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {isSubmitting ? 'Starting Build...' : 'Start Build'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
