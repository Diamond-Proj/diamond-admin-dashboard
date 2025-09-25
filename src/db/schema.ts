import {
  pgTable,
  varchar,
  text,
  foreignKey,
  timestamp,
  boolean,
  bigint,
  primaryKey,
  json
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

// Tables
export const profile = pgTable('profile', {
  identityId: varchar('identity_id', { length: 255 }).primaryKey().notNull(),
  name: varchar({ length: 255 }),
  email: varchar({ length: 255 }),
  institution: text()
});

export const task = pgTable(
  'task',
  {
    taskId: varchar('task_id').primaryKey().notNull(),
    taskName: varchar('task_name'),
    identityId: varchar('identity_id', { length: 255 }),
    taskStatus: varchar('task_status'),
    taskCreateTime: timestamp('task_create_time', {
      mode: 'string'
    }).defaultNow(),
    logPath: varchar('log_path'),
    endpointId: varchar('endpoint_id'),
    batchJobId: varchar('batch_job_id'),
    stdoutPath: varchar('stdout_path'),
    stderrPath: varchar('stderr_path'),
    computeEndpointId: varchar('compute_endpoint_id'),
    checkpointPath: varchar('checkpoint_path'),
    taskStatusChangedTime: timestamp('task_status_changed_time', {
      mode: 'string'
    }).defaultNow()
  },
  (table) => [
    foreignKey({
      columns: [table.identityId],
      foreignColumns: [profile.identityId],
      name: 'task_identity_id_profile_identity_id_fk'
    })
  ]
);

export const container = pgTable(
  'container',
  {
    name: varchar().primaryKey().notNull(),
    containerTaskId: varchar('container_task_id'),
    containerStatus: varchar('container_status'),
    identityId: varchar('identity_id', { length: 255 }),
    baseImage: varchar('base_image'),
    location: varchar(),
    description: text(),
    dependencies: text(),
    environment: text(),
    commands: text(),
    endpointId: varchar('endpoint_id'),
    isPublic: boolean('is_public').default(false)
  },
  (table) => [
    foreignKey({
      columns: [table.identityId],
      foreignColumns: [profile.identityId],
      name: 'container_identity_id_profile_identity_id_fk'
    })
  ]
);

export const dataset = pgTable(
  'dataset',
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({
      name: 'dataset_id_seq',
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1
    }),
    collectionUuid: varchar('collection_uuid').notNull(),
    globusPath: varchar('globus_path').notNull(),
    systemPath: varchar('system_path').notNull(),
    public: boolean().default(false).notNull(),
    machineName: varchar('machine_name').notNull(),
    datasetMetadata: text('dataset_metadata'),
    identityId: varchar('identity_id').notNull()
  },
  (table) => [
    foreignKey({
      columns: [table.identityId],
      foreignColumns: [profile.identityId],
      name: 'dataset_identity_id_fkey'
    })
  ]
);

export const endpoints = pgTable(
  'endpoints',
  {
    endpointUuid: varchar('endpoint_uuid').notNull(),
    identityId: varchar('identity_id', { length: 255 }).notNull(),
    endpointName: varchar('endpoint_name'),
    endpointHost: varchar('endpoint_host'),
    partitions: json(),
    accounts: json(),
    endpointStatus: varchar('endpoint_status'),
    diamondDir: text('diamond_dir')
  },
  (table) => [
    foreignKey({
      columns: [table.identityId],
      foreignColumns: [profile.identityId],
      name: 'endpoints_identity_id_profile_identity_id_fk'
    }),
    primaryKey({
      columns: [table.endpointUuid, table.identityId],
      name: 'endpoints_endpoint_uuid_identity_id_pk'
    })
  ]
);

// Relations
export const taskRelations = relations(task, ({ one }) => ({
  profile: one(profile, {
    fields: [task.identityId],
    references: [profile.identityId]
  })
}));

export const profileRelations = relations(profile, ({ many }) => ({
  tasks: many(task),
  containers: many(container),
  datasets: many(dataset),
  endpoints: many(endpoints)
}));

export const containerRelations = relations(container, ({ one }) => ({
  profile: one(profile, {
    fields: [container.identityId],
    references: [profile.identityId]
  })
}));

export const datasetRelations = relations(dataset, ({ one }) => ({
  profile: one(profile, {
    fields: [dataset.identityId],
    references: [profile.identityId]
  })
}));

export const endpointsRelations = relations(endpoints, ({ one }) => ({
  profile: one(profile, {
    fields: [endpoints.identityId],
    references: [profile.identityId]
  })
}));

// Export types
export type Profile = typeof profile.$inferSelect;
export type NewProfile = typeof profile.$inferInsert;

export type Task = typeof task.$inferSelect;
export type NewTask = typeof task.$inferInsert;

export type Container = typeof container.$inferSelect;
export type NewContainer = typeof container.$inferInsert;

export type Dataset = typeof dataset.$inferSelect;
export type NewDataset = typeof dataset.$inferInsert;

export type Endpoint = typeof endpoints.$inferSelect;
export type NewEndpoint = typeof endpoints.$inferInsert;
