/**
 * Task Template Registry
 *
 * To add a new template:
 * 1. Create a <template_name>.json file in this directory following the TaskTemplate shape.
 * 2. Import it below and add it to TASK_TEMPLATES.
 */

import { TaskTemplate } from '../tasks.types';

import fineTuneLlama31SciFact from './finetune-llama31-scifact.json';
import batchInferenceFinetuned from './batch-inference-finetuned.json';

export const TASK_TEMPLATES: TaskTemplate[] = [
  fineTuneLlama31SciFact as TaskTemplate,
  batchInferenceFinetuned as TaskTemplate,
];
