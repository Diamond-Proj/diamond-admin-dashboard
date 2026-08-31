'use client';

import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { VirtualSelect } from '@/components/ui/virtual-select';
import { VALID_MACHINES } from '@/app/(workspace)/datasets/utils';

import type {
  Artifact,
  ArtifactFormData,
  ArtifactType
} from '../artifacts.types';

const artifactTypeLabels = ['Generic', 'Dataset', 'Model', 'Container'];
const artifactTypeByLabel: Record<string, ArtifactType> = {
  Generic: 'generic',
  Dataset: 'dataset',
  Model: 'model',
  Container: 'container'
};
const artifactTypeLabelByValue: Record<ArtifactType, string> = {
  generic: 'Generic',
  dataset: 'Dataset',
  model: 'Model',
  container: 'Container'
};
const containerTypeLabels = ['Unspecified', 'Apptainer', 'Docker'];

const emptyForm: ArtifactFormData = {
  artifact_name: '',
  artifact_type: 'generic',
  machine_name: '',
  collection_uuid: '',
  globus_path: '',
  system_path: '',
  description: '',
  artifact_metadata: '',
  public: false,
  container_base_image: '',
  container_type: '',
  model_param_size: '',
  model_architecture: ''
};

function formFromArtifact(artifact: Artifact): ArtifactFormData {
  return {
    artifact_name: artifact.artifact_name ?? '',
    artifact_type: artifact.artifact_type,
    machine_name: artifact.machine_name,
    collection_uuid: artifact.collection_uuid,
    globus_path: artifact.globus_path,
    system_path: artifact.system_path,
    description: artifact.description ?? '',
    artifact_metadata: artifact.artifact_metadata ?? '',
    public: artifact.public,
    container_base_image: artifact.base_image ?? '',
    container_type: artifact.container_type ?? '',
    model_param_size: artifact.param_size ?? '',
    model_architecture: artifact.architecture ?? ''
  };
}

export function ArtifactModal({
  artifact,
  onClose,
  onSaved
}: {
  artifact: Artifact | null | undefined;
  onClose: () => void;
  onSaved: (artifact: Artifact) => void;
}) {
  const isOpen = artifact !== undefined;
  const isEditing = artifact !== null && artifact !== undefined;
  const [form, setForm] = useState<ArtifactFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) setForm(artifact ? formFromArtifact(artifact) : emptyForm);
  }, [artifact, isOpen]);

  if (!isOpen) return null;

  const update = <K extends keyof ArtifactFormData>(
    key: K,
    value: ArtifactFormData[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const required = isEditing
      ? []
      : ['collection_uuid', 'globus_path', 'system_path', 'machine_name'];
    const nextErrors: Record<string, string> = {};
    for (const key of required)
      if (!String(form[key as keyof ArtifactFormData]).trim())
        nextErrors[key] = 'Required';
    if (form.artifact_metadata.trim()) {
      try {
        JSON.parse(form.artifact_metadata);
      } catch {
        nextErrors.artifact_metadata = 'Enter valid JSON';
      }
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const shared = {
      artifact_name: form.artifact_name.trim() || null,
      description: form.description.trim() || null,
      artifact_metadata: form.artifact_metadata.trim() || null,
      public: form.public,
      container_base_image: form.container_base_image.trim() || null,
      container_type: form.container_type || null,
      model_param_size: form.model_param_size.trim() || null,
      model_architecture: form.model_architecture.trim() || null
    };
    const payload = isEditing
      ? shared
      : {
          ...shared,
          artifact_type: form.artifact_type,
          machine_name: form.machine_name,
          collection_uuid: form.collection_uuid.trim(),
          globus_path: form.globus_path.trim(),
          system_path: form.system_path.trim()
        };
    const url = isEditing
      ? `/api/artifact/${encodeURIComponent(artifact.id)}?machine_name=${encodeURIComponent(artifact.machine_name)}`
      : '/api/artifact';

    try {
      setSubmitting(true);
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as {
        artifact?: Artifact;
        message?: string;
        error?: string;
        reason?: string;
      };
      if (!response.ok || !result.artifact)
        throw new Error(
          result.error ?? result.reason ?? 'Unable to save artifact'
        );
      onSaved(result.artifact);
      toast({
        title: 'Success',
        description: result.message ?? 'Artifact saved'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Unable to save artifact',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (key: string) => (errors[key] ? 'border-red-500' : '');
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <div
        className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-slate-200/80 bg-[hsl(var(--dashboard-surface))] shadow-[0_24px_80px_-20px_rgba(15,23,42,0.55)] dark:border-slate-700/80"
        role="dialog"
        aria-modal="true"
        aria-labelledby="artifact-modal-title"
      >
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200/80 bg-[hsl(var(--dashboard-surface))]/95 pr-2 pl-4 dark:border-slate-700/80">
            <h2
              id="artifact-modal-title"
              className="text-sm font-semibold text-slate-900 dark:text-slate-100"
            >
              {isEditing ? 'Edit artifact' : 'Register artifact'}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close"
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            <section>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Name
                  <Input
                    className="mt-1"
                    value={form.artifact_name}
                    onChange={(e) => update('artifact_name', e.target.value)}
                    placeholder="Research output"
                  />
                </label>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span>Type</span>
                  <VirtualSelect
                    disabled={isEditing}
                    className="mt-1"
                    options={artifactTypeLabels}
                    selected={artifactTypeLabelByValue[form.artifact_type]}
                    onSelect={(option) =>
                      update('artifact_type', artifactTypeByLabel[option])
                    }
                    placeholder="Select a type"
                    searchPlaceholder="Search types..."
                  />
                </div>
              </div>
            </section>

            {!isEditing ? (
              <section className="border-t border-slate-200/80 pt-4 dark:border-slate-700/80">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    <span>Machine *</span>
                    <VirtualSelect
                      className={`mt-1 ${fieldClass('machine_name')}`}
                      options={[...VALID_MACHINES]}
                      selected={form.machine_name}
                      onSelect={(machine) => update('machine_name', machine)}
                      placeholder="Select a machine"
                      searchPlaceholder="Search machines..."
                    />
                    {errors.machine_name ? (
                      <span className="text-xs text-red-600">Required</span>
                    ) : null}
                  </div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Collection UUID *
                    <Input
                      className={`mt-1 ${fieldClass('collection_uuid')}`}
                      value={form.collection_uuid}
                      onChange={(e) =>
                        update('collection_uuid', e.target.value)
                      }
                    />
                    {errors.collection_uuid ? (
                      <span className="text-xs text-red-600">Required</span>
                    ) : null}
                  </label>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Globus path *
                    <Input
                      className={`mt-1 ${fieldClass('globus_path')}`}
                      value={form.globus_path}
                      onChange={(e) => update('globus_path', e.target.value)}
                      placeholder="/project/output"
                    />
                    {errors.globus_path ? (
                      <span className="text-xs text-red-600">Required</span>
                    ) : null}
                  </label>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    System path *
                    <Input
                      className={`mt-1 ${fieldClass('system_path')}`}
                      value={form.system_path}
                      onChange={(e) => update('system_path', e.target.value)}
                      placeholder="/scratch/output"
                    />
                    {errors.system_path ? (
                      <span className="text-xs text-red-600">Required</span>
                    ) : null}
                  </label>
                </div>
              </section>
            ) : null}

            <section className="border-t border-slate-200/80 pt-4 dark:border-slate-700/80">
              <div className="space-y-3">
                <label className="flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/70 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 sm:w-64 dark:border-slate-700/80 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800">
                  <span>Public</span>
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={form.public}
                    onChange={(e) => update('public', e.target.checked)}
                  />
                  <span className="peer-checked:bg-primary peer-focus-visible:ring-primary/30 relative h-5 w-9 rounded-full bg-slate-300 transition-colors peer-focus-visible:ring-2 dark:bg-slate-600 peer-checked:[&>span]:translate-x-4">
                    <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform" />
                  </span>
                </label>
                {form.artifact_type === 'container' ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Base image
                      <Input
                        className="mt-1"
                        value={form.container_base_image}
                        onChange={(e) =>
                          update('container_base_image', e.target.value)
                        }
                        placeholder="ubuntu:24.04"
                      />
                    </label>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      <span>Container format</span>
                      <VirtualSelect
                        className="mt-1"
                        options={containerTypeLabels}
                        selected={
                          form.container_type
                            ? form.container_type === 'apptainer'
                              ? 'Apptainer'
                              : 'Docker'
                            : 'Unspecified'
                        }
                        onSelect={(option) =>
                          update(
                            'container_type',
                            option === 'Unspecified'
                              ? ''
                              : (option.toLowerCase() as ArtifactFormData['container_type'])
                          )
                        }
                        placeholder="Select a format"
                        searchPlaceholder="Search formats..."
                      />
                    </div>
                  </div>
                ) : null}
                {form.artifact_type === 'model' ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Parameter size
                      <Input
                        className="mt-1"
                        value={form.model_param_size}
                        onChange={(e) =>
                          update('model_param_size', e.target.value)
                        }
                        placeholder="7B"
                      />
                    </label>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Architecture
                      <Input
                        className="mt-1"
                        value={form.model_architecture}
                        onChange={(e) =>
                          update('model_architecture', e.target.value)
                        }
                        placeholder="Transformer"
                      />
                    </label>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="border-t border-slate-200/80 pt-4 dark:border-slate-700/80">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700 sm:col-span-2 dark:text-slate-300">
                  Description
                  <Textarea
                    className="mt-1"
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    rows={2}
                  />
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2 dark:text-slate-300">
                  Metadata (JSON)
                  <Textarea
                    className={`mt-1 border-slate-800 bg-slate-950 font-mono text-xs text-slate-100 placeholder:text-slate-500 focus-visible:ring-slate-500/30 dark:border-slate-700 ${fieldClass('artifact_metadata')}`}
                    value={form.artifact_metadata}
                    onChange={(e) =>
                      update('artifact_metadata', e.target.value)
                    }
                    placeholder={'{"format":"safetensors"}'}
                    rows={3}
                  />
                  {errors.artifact_metadata ? (
                    <span className="text-xs text-red-600">
                      {errors.artifact_metadata}
                    </span>
                  ) : null}
                </label>
              </div>
            </section>
          </div>
          <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200/80 bg-[hsl(var(--dashboard-surface))]/95 px-4 py-3 shadow-[0_-8px_24px_-20px_rgba(15,23,42,0.6)] backdrop-blur dark:border-slate-700/80">
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isEditing ? 'Save' : 'Register'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
