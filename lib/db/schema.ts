import {
  pgTable,
  text,
  varchar,
  json,
  timestamp,
  foreignKey,
  primaryKey
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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
    primaryKey({ columns: [table.endpointUuid, table.identityId] }),
    foreignKey({
      columns: [table.identityId],
      foreignColumns: [profile.identityId],
      name: 'endpoints_identity_id_profile_identity_id_fk'
    })
  ]
);

export const profile = pgTable('profile', {
  identityId: varchar('identity_id', { length: 255 }).primaryKey().notNull(),
  name: varchar({ length: 255 }),
  email: varchar({ length: 255 }),
  institution: text()
});

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
    endpointId: varchar('endpoint_id')
  },
  (table) => [
    foreignKey({
      columns: [table.identityId],
      foreignColumns: [profile.identityId],
      name: 'container_identity_id_profile_identity_id_fk'
    })
  ]
);

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
    checkpointPath: varchar('checkpoint_path')
  },
  (table) => [
    foreignKey({
      columns: [table.identityId],
      foreignColumns: [profile.identityId],
      name: 'task_identity_id_profile_identity_id_fk'
    })
  ]
);

// Relations
export const profilesRelations = relations(profile, ({ many }) => ({
  endpoints: many(endpoints),
  containers: many(container),
  tasks: many(task)
}));

export const endpointsRelations = relations(endpoints, ({ one }) => ({
  profile: one(profile, {
    fields: [endpoints.identityId],
    references: [profile.identityId]
  })
}));

export const containersRelations = relations(container, ({ one }) => ({
  profile: one(profile, {
    fields: [container.identityId],
    references: [profile.identityId]
  })
}));

export const tasksRelations = relations(task, ({ one }) => ({
  profile: one(profile, {
    fields: [task.identityId],
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

export type Endpoint = typeof endpoints.$inferSelect;
export type NewEndpoint = typeof endpoints.$inferInsert;
