import { relations } from "drizzle-orm/relations";
import { profile, task, container, dataset, endpoints } from "./schema";

export const taskRelations = relations(task, ({one}) => ({
	profile: one(profile, {
		fields: [task.identityId],
		references: [profile.identityId]
	}),
}));

export const profileRelations = relations(profile, ({many}) => ({
	tasks: many(task),
	containers: many(container),
	datasets: many(dataset),
	endpoints: many(endpoints),
}));

export const containerRelations = relations(container, ({one}) => ({
	profile: one(profile, {
		fields: [container.identityId],
		references: [profile.identityId]
	}),
}));

export const datasetRelations = relations(dataset, ({one}) => ({
	profile: one(profile, {
		fields: [dataset.identityId],
		references: [profile.identityId]
	}),
}));

export const endpointsRelations = relations(endpoints, ({one}) => ({
	profile: one(profile, {
		fields: [endpoints.identityId],
		references: [profile.identityId]
	}),
}));