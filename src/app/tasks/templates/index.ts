/**
 * Task Template Registry
 *
 * To add a new template:
 * 1. Create a <template_name>.json file in this directory following the TaskTemplate shape.
 * 2. Import it below and add it to TASK_TEMPLATES.
 */

import { TaskTemplate } from '../tasks.types';

import deepspeedSftDelta from './deepspeed-sft-delta.json';
import llmBatchInference from './llm-batch-inference.json';

export const TASK_TEMPLATES: TaskTemplate[] = [
  deepspeedSftDelta as TaskTemplate,
  llmBatchInference as TaskTemplate,
];
