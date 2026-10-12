import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),
  year: integer('year').notNull(),
  name: text('name').notNull(),
  status: text('status').notNull().default('activo'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const units = pgTable('units', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').notNull().default('blue'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const objectives = pgTable('objectives', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const descriptors = pgTable('descriptors', {
  id: serial('id').primaryKey(),
  objectiveId: integer('objective_id').notNull().references(() => objectives.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  initiative: text('initiative'),
  indicator: text('indicator'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const actions = pgTable('actions', {
  id: serial('id').primaryKey(),
  descriptorId: integer('descriptor_id').notNull().references(() => descriptors.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  executionUnitId: integer('execution_unit_id').references(() => units.id, { onDelete: 'set null' }),
  evaluationUnitId: integer('evaluation_unit_id').references(() => units.id, { onDelete: 'set null' }),
  startMonth: integer('start_month'),
  endMonth: integer('end_month'),
  // Kept for historical values; active progress is calculated from month statuses.
  completionPercentage: integer('completion_percentage').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const actionMonthStatuses = pgTable('action_month_statuses', {
  id: serial('id').primaryKey(),
  actionId: integer('action_id').notNull().references(() => actions.id, { onDelete: 'cascade' }),
  month: integer('month').notNull(),
  status: text('status', { enum: ['done', 'missed'] }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('action_month_statuses_action_month_idx').on(table.actionId, table.month),
])

export const followUps = pgTable('follow_ups', {
  id: serial('id').primaryKey(),
  actionId: integer('action_id').notNull().references(() => actions.id, { onDelete: 'cascade' }),
  month: integer('month').notNull(),
  executionComment: text('execution_comment'),
  evaluationResponse: text('evaluation_response'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const observations = pgTable('observations', {
  id: serial('id').primaryKey(),
  actionId: integer('action_id').notNull().references(() => actions.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const findingReports = pgTable('finding_reports', {
  id: serial('id').primaryKey(),
  year: integer('year').notNull(),
  name: text('name').notNull(),
  status: text('status', { enum: ['activo', 'cerrado'] }).notNull().default('activo'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const findings = pgTable('findings', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id').notNull().references(() => findingReports.id, { onDelete: 'cascade' }),
  reference: text('reference').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  agencyArea: text('agency_area'),
  origin: text('origin'),
  regulatoryBasis: text('regulatory_basis'),
  assignedArea: text('assigned_area'),
  strategy: text('strategy'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const findingMonthUpdates = pgTable('finding_month_updates', {
  id: serial('id').primaryKey(),
  findingId: integer('finding_id').notNull().references(() => findings.id, { onDelete: 'cascade' }),
  month: integer('month').notNull(),
  status: text('status', { enum: ['corrected', 'observed', 'pending'] }),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('finding_month_updates_finding_month_idx').on(table.findingId, table.month),
])

export const findingObservations = pgTable('finding_observations', {
  id: serial('id').primaryKey(),
  findingId: integer('finding_id').notNull().references(() => findings.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
