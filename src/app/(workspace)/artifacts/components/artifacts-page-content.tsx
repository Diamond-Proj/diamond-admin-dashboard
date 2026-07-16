'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Check,
  CircleAlert,
  Container,
  Copy,
  Database,
  Globe2,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Waypoints
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { VirtualSelect } from '@/components/ui/virtual-select';
import { useAuthSessionContext } from '@/lib/auth/session-context';

import { ArtifactModal } from './artifact-modal';
import type {
  Artifact,
  ArtifactsApiResponse,
  ArtifactType
} from '../artifacts.types';

const typeDetails = {
  container: {
    label: 'Container',
    Icon: Container,
    color: 'text-cyan-700 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-300'
  },
  dataset: {
    label: 'Dataset',
    Icon: Database,
    color:
      'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300'
  },
  model: {
    label: 'Model',
    Icon: Waypoints,
    color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300'
  },
  generic: {
    label: 'Generic',
    Icon: Box,
    color: 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
  }
} satisfies Record<
  ArtifactType,
  { label: string; Icon: typeof Box; color: string }
>;

const artifactTypeOptions = [
  'All artifact types',
  'Datasets',
  'Containers',
  'Models',
  'Generic'
] as const;
const artifactTypeValues: Record<
  (typeof artifactTypeOptions)[number],
  'all' | ArtifactType
> = {
  'All artifact types': 'all',
  Datasets: 'dataset',
  Containers: 'container',
  Models: 'model',
  Generic: 'generic'
};
const visibilityOptions = ['All visibility', 'Private', 'Public'] as const;
const visibilityValues: Record<
  (typeof visibilityOptions)[number],
  'all' | 'public' | 'private'
> = {
  'All visibility': 'all',
  Private: 'private',
  Public: 'public'
};

function getPreviewArtifacts(identityId: string): Artifact[] {
  return [
    {
      id: '7e7b96c1-24ab-4da2-9544-5ddd3e56df17',
      machine_name: 'Anvil@RCAC',
      identity_id: identityId,
      public: false,
      collection_uuid: '4f99675c-ac1f-4a03-8c13-a9e86de27467',
      globus_path: '/diamond/models/llama-3.1-8b-sft',
      system_path: '/anvil/projects/diamond/models/llama-3.1-8b-sft',
      artifact_name: 'Llama 3.1 8B — SFT checkpoint',
      artifact_type: 'model',
      artifact_metadata: '{"format":"safetensors","epoch":3}',
      description: 'Checkpoint from the instruction-tuning run.',
      creation_date: '2026-07-15T18:42:00',
      param_size: '8B',
      architecture: 'LlamaForCausalLM'
    },
    {
      id: '1092a8f2-21fa-4bfd-a371-39edb5f93a62',
      machine_name: 'DeltaAI@NCSA',
      identity_id: identityId,
      public: true,
      collection_uuid: 'e38ee745-6d04-11e5-ba46-22000b92c6ec',
      globus_path: '/containers/pytorch-2.7-cuda12.8.sif',
      system_path: '/projects/diamond/containers/pytorch-2.7-cuda12.8.sif',
      artifact_name: 'PyTorch 2.7 CUDA runtime',
      artifact_type: 'container',
      artifact_metadata: null,
      description: 'GPU runtime used by training and evaluation jobs.',
      creation_date: '2026-07-13T09:15:00',
      base_image: 'pytorch/pytorch:2.7.1-cuda12.8-cudnn9-runtime',
      container_type: 'apptainer'
    },
    {
      id: '37355c71-e02a-46d7-8b0f-60b20d20aeb7',
      machine_name: 'Frontera@TACC',
      identity_id: identityId,
      public: false,
      collection_uuid: 'c7a9f2d1-b88a-4af0-b22a-147b2c4fe268',
      globus_path: '/datasets/materials/oxide-structures-v4',
      system_path: '/scratch1/diamond/datasets/oxide-structures-v4',
      artifact_name: 'Oxide structures v4',
      artifact_type: 'dataset',
      artifact_metadata: '{"samples":284193,"format":"parquet"}',
      description: null,
      creation_date: '2026-07-08T14:30:00',
      has_dataset_details: true
    },
    {
      id: 'd9225388-d47c-4561-88b4-3f657ab656d8',
      machine_name: 'Delta@NCSA',
      identity_id: 'shared-preview-user',
      public: true,
      collection_uuid: '5f4d636c-71da-11e8-b5a0-0ac6873fc732',
      globus_path: '/shared/benchmarks/mlperf-results',
      system_path: '/projects/shared/mlperf/results-2026',
      artifact_name: 'MLPerf training results',
      artifact_type: 'generic',
      artifact_metadata: null,
      description: 'Published benchmark outputs shared by another researcher.',
      creation_date: '2026-06-29T11:05:00'
    },
    {
      id: '922308ca-cdec-49e3-b731-ec39e43190bd',
      machine_name: 'Lonestar6@TACC',
      identity_id: identityId,
      public: false,
      collection_uuid: 'ad1c9b30-6f62-4a66-aa06-b6f413cefc7e',
      globus_path: '/experiments/run-042/output',
      system_path: '/scratch/diamond/experiments/run-042/output',
      artifact_name: null,
      artifact_type: 'generic',
      artifact_metadata: null,
      description: null,
      creation_date: null
    }
  ];
}

async function readApiError(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as {
      error?: string;
      reason?: string;
      message?: string;
    };
    return data.error ?? data.reason ?? data.message ?? fallback;
  } catch {
    return fallback;
  }
}

export function ArtifactsPageContent() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const artifactsRef = useRef<Artifact[]>([]);
  const [mockMode, setMockMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | ArtifactType>('all');
  const [visibility, setVisibility] = useState<'all' | 'public' | 'private'>(
    'all'
  );
  const [modalArtifact, setModalArtifact] = useState<
    Artifact | null | undefined
  >(undefined);
  const [deleting, setDeleting] = useState<Artifact | null>(null);
  const { session } = useAuthSessionContext();
  const { toast } = useToast();
  const identityId = session.userInfo?.id;

  const loadArtifacts = useCallback(
    async (quiet = false) => {
      const canRefreshQuietly = quiet && artifactsRef.current.length > 0;
      if (canRefreshQuietly) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        if (mockMode) {
          await new Promise((resolve) => window.setTimeout(resolve, 2000));
          setArtifacts(getPreviewArtifacts(identityId ?? 'preview-user'));
          return;
        }

        const response = await fetch('/api/artifacts', {
          credentials: 'include'
        });
        if (!response.ok)
          throw new Error(
            await readApiError(response, 'Unable to load artifacts')
          );
        const data = (await response.json()) as ArtifactsApiResponse;
        setArtifacts(data.artifacts ?? []);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load artifacts'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [identityId, mockMode]
  );

  useEffect(() => {
    void loadArtifacts();
  }, [loadArtifacts]);

  useEffect(() => {
    artifactsRef.current = artifacts;
  }, [artifacts]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return artifacts.filter((artifact) => {
      const matchesSearch =
        !query ||
        [
          artifact.artifact_name,
          artifact.description,
          artifact.machine_name,
          artifact.globus_path,
          artifact.system_path,
          artifact.id
        ].some((value) => value?.toLowerCase().includes(query));
      const matchesType = type === 'all' || artifact.artifact_type === type;
      const matchesVisibility =
        visibility === 'all' || artifact.public === (visibility === 'public');
      return matchesSearch && matchesType && matchesVisibility;
    });
  }, [artifacts, search, type, visibility]);

  const counts = useMemo(
    () => ({
      total: artifacts.length,
      owned: artifacts.filter((artifact) => artifact.identity_id === identityId)
        .length,
      public: artifacts.filter((artifact) => artifact.public).length,
      machines: new Set(artifacts.map((artifact) => artifact.machine_name)).size
    }),
    [artifacts, identityId]
  );
  const summary: Array<{ label: string; value: number }> = [
    { label: 'Total', value: counts.total },
    { label: 'Owned', value: counts.owned },
    { label: 'Public', value: counts.public },
    { label: 'Machines', value: counts.machines }
  ];

  const saveArtifact = (saved: Artifact) => {
    setArtifacts((current) => {
      const index = current.findIndex(
        (item) =>
          item.id === saved.id && item.machine_name === saved.machine_name
      );
      if (index < 0) return [saved, ...current];
      return current.map((item, itemIndex) =>
        itemIndex === index ? saved : item
      );
    });
    setModalArtifact(undefined);
  };

  const deleteArtifact = async () => {
    if (!deleting) return;
    try {
      const response = await fetch(
        `/api/artifact/${encodeURIComponent(deleting.id)}?machine_name=${encodeURIComponent(deleting.machine_name)}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (!response.ok)
        throw new Error(
          await readApiError(response, 'Unable to delete artifact')
        );
      setArtifacts((current) =>
        current.filter(
          (item) =>
            item.id !== deleting.id ||
            item.machine_name !== deleting.machine_name
        )
      );
      setDeleting(null);
      toast({
        title: 'Artifact deleted',
        description: 'This replica was removed from Diamond.'
      });
    } catch (deleteError) {
      toast({
        title: 'Error',
        description:
          deleteError instanceof Error
            ? deleteError.message
            : 'Unable to delete artifact',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
      <section className="flex flex-col justify-between gap-3 border-b border-slate-200/70 pb-4 sm:flex-row sm:items-center dark:border-slate-700/70">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Artifacts
          </h1>
          <dl className="flex w-full items-center sm:w-auto">
            {summary.map(({ label, value }) => (
              <div
                key={label}
                className="flex min-w-16 flex-col border-l border-slate-200 px-3 first:border-l-0 first:pl-0 dark:border-slate-700"
              >
                <dd className="flex h-6 items-center text-xl leading-none font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                  {loading ? (
                    <span
                      className="inline-block h-4 w-5 animate-pulse rounded bg-slate-200 dark:bg-slate-700"
                      aria-label={`Loading ${label.toLowerCase()}`}
                    />
                  ) : (
                    value
                  )}
                </dd>
                <dt className="mt-1 text-xs leading-none text-slate-500 dark:text-slate-400">
                  {label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex gap-2">
          {process.env.NODE_ENV === 'development' ? (
            <Button
              variant="outline"
              onClick={() => setMockMode((enabled) => !enabled)}
              aria-pressed={mockMode}
              className={
                mockMode
                  ? 'border-amber-400/70 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-600/70 dark:bg-amber-950/35 dark:text-amber-300 dark:hover:bg-amber-950/55'
                  : undefined
              }
            >
              <span
                className={`mr-2 h-2 w-2 rounded-full ${mockMode ? 'bg-amber-500' : 'bg-slate-400'}`}
              />
              Mock mode
            </Button>
          ) : null}
          <Button
            variant="outline"
            onClick={() => void loadArtifacts(true)}
            disabled={refreshing}
            aria-label="Refresh artifacts"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
          </Button>
          <Button onClick={() => setModalArtifact(null)}>
            <Plus className="mr-2 h-4 w-4" />
            Register artifact
          </Button>
        </div>
      </section>

      <section className="relative">
        <div className="relative z-20 grid gap-2 border-b border-slate-200/70 p-3 lg:grid-cols-[minmax(240px,1fr)_210px_190px] dark:border-slate-700/70">
          <label className="relative">
            <span className="sr-only">Search artifacts</span>
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              aria-label="Search artifacts"
              className="border-slate-300 bg-white pl-9 shadow-sm dark:border-slate-600 dark:bg-slate-900"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, path, machine, or ID…"
            />
          </label>
          <VirtualSelect
            options={[...artifactTypeOptions]}
            selected={
              artifactTypeOptions.find(
                (option) => artifactTypeValues[option] === type
              ) ?? artifactTypeOptions[0]
            }
            onSelect={(option) =>
              setType(
                artifactTypeValues[
                  option as (typeof artifactTypeOptions)[number]
                ]
              )
            }
            placeholder="All artifact types"
            searchPlaceholder="Search types..."
          />
          <VirtualSelect
            options={[...visibilityOptions]}
            selected={
              visibilityOptions.find(
                (option) => visibilityValues[option] === visibility
              ) ?? visibilityOptions[0]
            }
            onSelect={(option) =>
              setVisibility(
                visibilityValues[option as (typeof visibilityOptions)[number]]
              )
            }
            placeholder="All visibility"
            searchPlaceholder="Search visibility..."
          />
        </div>
      </section>

      {loading ? (
        <div
            className="dashboard-card divide-y divide-slate-200/70 rounded-sm dark:divide-slate-700/70"
          role="status"
          aria-label="Loading artifacts"
        >
          {[0, 1, 2, 3].map((row) => (
            <div
              key={row}
              className="grid animate-pulse grid-cols-[36px_1fr] items-center gap-3 px-4 py-4 lg:grid-cols-[36px_minmax(190px,1.5fr)_minmax(140px,.8fr)_minmax(150px,1fr)_120px_80px] lg:gap-4"
            >
              <span className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <span className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
              <span className="hidden h-4 w-3/4 rounded bg-slate-200 lg:block dark:bg-slate-700" />
              <span className="hidden h-4 w-full rounded bg-slate-200 lg:block dark:bg-slate-700" />
              <span className="hidden h-4 w-20 rounded bg-slate-200 lg:block dark:bg-slate-700" />
              <span className="hidden h-8 w-16 rounded bg-slate-200 lg:block dark:bg-slate-700" />
            </div>
          ))}
          <span className="sr-only">Loading artifacts…</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500 dark:text-slate-400">
          <CircleAlert className="h-4 w-4 text-amber-500/80" />
          <p>{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-32 flex-col items-center justify-center text-center">
          <Box className="mb-3 h-10 w-10 text-slate-400" />
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            No artifacts found
          </p>
        </div>
      ) : (
          <section className="dashboard-card overflow-hidden rounded-sm">
          <div className="hidden grid-cols-[minmax(240px,1.5fr)_minmax(140px,.8fr)_minmax(150px,1fr)_120px_88px] border-b border-slate-200/70 bg-slate-50/70 px-4 py-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase lg:grid dark:border-slate-700/70 dark:bg-slate-800/35 dark:text-slate-400 lg:[&>span+span]:border-l lg:[&>span+span]:border-slate-200/80 lg:[&>span+span]:pl-4 dark:lg:[&>span+span]:border-slate-700/80">
            <span>Artifact</span>
            <span>Machine</span>
            <span>Location</span>
            <span>Created</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-slate-200/70 dark:divide-slate-700/70">
            {filtered.map((artifact) => (
              <ArtifactCard
                key={`${artifact.id}-${artifact.machine_name}`}
                artifact={artifact}
                owned={artifact.identity_id === identityId}
                onEdit={() => setModalArtifact(artifact)}
                onDelete={() => setDeleting(artifact)}
              />
            ))}
          </div>
        </section>
      )}

      <ArtifactModal
        artifact={modalArtifact}
        onClose={() => setModalArtifact(undefined)}
        onSaved={saveArtifact}
      />
      {deleting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-artifact-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-[hsl(var(--dashboard-surface))] p-6 shadow-2xl dark:border-slate-700"
          >
            <h2
              id="delete-artifact-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Delete artifact replica?
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              This removes{' '}
              <strong>{deleting.artifact_name || 'Untitled artifact'}</strong>{' '}
              from <strong>{deleting.machine_name}</strong>. It does not delete
              files from the machine.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => void deleteArtifact()}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete artifact
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ArtifactCard({
  artifact,
  owned,
  onEdit,
  onDelete
}: {
  artifact: Artifact;
  owned: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const details = typeDetails[artifact.artifact_type];
  const Icon = details.Icon;
  const copyId = async () => {
    await navigator.clipboard.writeText(artifact.id);
    setCopied(true);
    toast({ description: 'Artifact ID copied' });
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <article className="group grid gap-3 px-4 py-3 transition-colors duration-150 hover:bg-slate-50/80 lg:grid-cols-[minmax(240px,1.5fr)_minmax(140px,.8fr)_minmax(150px,1fr)_120px_88px] lg:items-stretch lg:gap-0 dark:hover:bg-slate-800/30 lg:[&>*+*]:border-l lg:[&>*+*]:border-slate-200/80 lg:[&>*+*]:pl-4 dark:lg:[&>*+*]:border-slate-700/80">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${details.color}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {artifact.artifact_name || 'Untitled artifact'}
          </h2>
          <div className="mt-1 flex min-w-0 items-center gap-2 text-xs">
            <span
              className={`rounded px-1.5 py-0.5 font-medium ${details.color}`}
            >
              {details.label}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 text-slate-500">
              {artifact.public ? (
                <Globe2 className="h-3 w-3" />
              ) : (
                <Lock className="h-3 w-3" />
              )}
              {artifact.public ? 'Public' : 'Private'}
            </span>
          </div>
          {artifact.description ? (
            <p
              className="mt-1 truncate text-xs text-slate-500"
              title={artifact.description}
            >
              {artifact.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="min-w-0 pl-12 lg:pl-0">
        <p className="mb-0.5 text-[11px] font-medium text-slate-400 lg:hidden">
          Machine
        </p>
        <p className="truncate text-sm text-slate-700 dark:text-slate-300">
          {artifact.machine_name}
        </p>
        {artifact.artifact_type === 'model' &&
        (artifact.param_size || artifact.architecture) ? (
          <p className="truncate text-xs text-slate-500">
            {[artifact.param_size, artifact.architecture]
              .filter(Boolean)
              .join(' · ')}
          </p>
        ) : null}
        {artifact.artifact_type === 'container' && artifact.base_image ? (
          <p
            className="truncate text-xs text-slate-500"
            title={artifact.base_image}
          >
            {artifact.base_image}
          </p>
        ) : null}
      </div>

      <div className="min-w-0 pl-12 lg:pl-0">
        <p className="mb-0.5 text-[11px] font-medium text-slate-400 lg:hidden">
          Location
        </p>
        <p
          className="truncate font-mono text-xs text-slate-700 dark:text-slate-300"
          title={artifact.system_path}
        >
          {artifact.system_path}
        </p>
        <button
          type="button"
          onClick={() => void copyId()}
          className="hover:text-primary focus-visible:outline-primary mt-0.5 inline-flex cursor-pointer items-center gap-1 font-mono text-[10px] text-slate-400 transition-colors focus-visible:outline-2"
          aria-label={`Copy ID for ${artifact.artifact_name || 'artifact'}`}
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? 'Copied' : artifact.id.slice(0, 8)}
        </button>
      </div>

      <div className="pl-12 lg:pl-0">
        <p className="mb-0.5 text-[11px] font-medium text-slate-400 lg:hidden">
          Created
        </p>
        <p className="text-sm whitespace-nowrap text-slate-700 dark:text-slate-300">
          {artifact.creation_date
            ? new Intl.DateTimeFormat(undefined, {
                dateStyle: 'medium'
              }).format(new Date(artifact.creation_date))
            : '—'}
        </p>
      </div>

      <div className="flex items-center justify-end gap-1 pl-12 lg:pl-0">
        {owned ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              aria-label={`Edit ${artifact.artifact_name || 'artifact'}`}
              className="h-10 w-10"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              aria-label={`Delete ${artifact.artifact_name || 'artifact'}`}
              className="h-10 w-10 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <span className="text-xs text-slate-400">Read only</span>
        )}
      </div>
    </article>
  );
}
