import { relations } from "drizzle-orm/relations";
import { profile, endpoints, container, task } from "./schema";

export const endpointsRelations = relations(endpoints, ({one}) => ({
	profile: one(profile, {
		fields: [endpoints.identityId],
		references: [profile.identityId]
	}),
}));

export const profileRelations = relations(profile, ({many}) => ({
	endpoints: many(endpoints),
	containers: many(container),
	tasks: many(task),
}));

export const containerRelations = relations(container, ({one}) => ({
	profile: one(profile, {
		fields: [container.identityId],
		references: [profile.identityId]
	}),
}));

export const taskRelations = relations(task, ({one}) => ({
	profile: one(profile, {
		fields: [task.identityId],
		references: [profile.identityId]
	}),
}));