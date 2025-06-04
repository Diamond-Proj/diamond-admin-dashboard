import { pgTable, text, varchar, json, timestamp, foreignKey } from 'drizzle-orm/pg-core';

// Profile table schema
export const profiles = pgTable('profile', {
  identity_id: varchar('identity_id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  institution: text('institution')
});

// Task table schema
export const tasks = pgTable('task', {
  task_id: varchar('task_id').primaryKey(),
  task_name: varchar('task_name'),
  identity_id: varchar('identity_id', { length: 255 })
    .references(() => profiles.identity_id),
  task_status: varchar('task_status'),
  task_create_time: timestamp('task_create_time').defaultNow(),
  log_path: varchar('log_path'),
  endpoint_id: varchar('endpoint_id')
});

// Container table schema
export const containers = pgTable('container', {
  name: varchar('name').primaryKey(),
  container_task_id: varchar('container_task_id'),
  container_status: varchar('container_status'),
  identity_id: varchar('identity_id', { length: 255 })
    .references(() => profiles.identity_id),
  base_image: varchar('base_image'),
  location: varchar('location'),
  description: text('description'),
  dependencies: text('dependencies'),
  environment: text('environment'),
  commands: text('commands'),
  endpoint_id: varchar('endpoint_id')
});

export const endpoints = pgTable('endpoints', {
  endpoint_uuid: varchar('endpoint_uuid').primaryKey(),
  identity_id: varchar('identity_id', { length: 255 })
    .notNull()
    .references(() => profiles.identity_id),
  endpoint_name: varchar('endpoint_name'),
  endpoint_host: varchar('endpoint_host'),
  partitions: json('partitions'),
  accounts: json('accounts'),
});

// Export types
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type Container = typeof containers.$inferSelect;
export type NewContainer = typeof containers.$inferInsert; 

export type Endpoint = typeof endpoints.$inferSelect;
export type NewEndpoint = typeof endpoints.$inferInsert;
