'use client';

import React from 'react';
import { EndpointStep } from './steps/endpoint-step';
import { ContainerStep } from './steps/container-step';
import { BuildStep } from './steps/build-step';
import { BuilderFormData } from '@/app/images/types';

interface BuilderStepsProps {
  stepId: string;
  formData: Partial<BuilderFormData>;
  onUpdate: (data: Partial<BuilderFormData>) => void;
}

const STEP_COMPONENTS: Record<string, React.ComponentType<any>> = {
  endpoint: EndpointStep,
  container: ContainerStep,
  build: BuildStep
};

export function BuilderSteps({ stepId, formData, onUpdate }: BuilderStepsProps) {
  const Component = STEP_COMPONENTS[stepId];

  if (!Component) {
    return null;
  }

  return <Component formData={formData} onUpdate={onUpdate} />;
}
