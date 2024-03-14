import { relations } from 'drizzle-orm';
import {
  boolean,
  decimal,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const icon = pgEnum('icon', [
  'settings',
  'chart',
  'calendar',
  'check',
  'chip',
  'compass',
  'database',
  'flag',
  'home',
  'info',
  'link',
  'lock',
  'messages',
  'notification',
  'payment',
  'power',
  'receipt',
  'shield',
  'star',
  'tune',
  'videorecorder',
  'wallet',
  'warning',
  'headphone',
  'send',
  'pipelines',
  'person',
  'category',
  'contact',
  'clipboardIcon',
]);

export const role = pgEnum('role', [
  'agency-owner',
  'agency-admin',
  'subaccount-user',
  'subaccount-guest',
]);

const timeStamps = {
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
};

export const userTable = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 256 }),
  email: varchar('email', { length: 256 }).notNull().unique(),
  role: role('role').default('subaccount-user').notNull(),
  agencyId: uuid('agency_id').references(() => agencyTable.id, {
    onDelete: 'cascade',
  }),
  ...timeStamps,
});

export type User = typeof userTable.$inferSelect;
export const userTableRelation = relations(userTable, ({ one, many }) => ({
  agency: one(agencyTable, {
    fields: [userTable.agencyId],
    references: [agencyTable.id],
  }),
  permissions: many(permissionTable),
  tickets: many(ticketTable),
  notifications: many(notificationTable),
}));

export const permissionTable = pgTable(
  'permission',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 256 }).notNull(),
    subAccountId: uuid('sub_account_id')
      .references(() => subaccountTable.id, { onDelete: 'cascade' })
      .notNull(),
    access: boolean('access'),
  },
  ({ email }) => ({
    emailIdx: index('email_idx').on(email),
  })
);

export const permissionTableRelation = relations(
  permissionTable,
  ({ one }) => ({
    subaccount: one(subaccountTable, {
      fields: [permissionTable.subAccountId],
      references: [subaccountTable.id],
    }),
    user: one(userTable, {
      fields: [permissionTable.email],
      references: [userTable.email],
    }),
  })
);

export const agencyTable = pgTable('agency', {
  id: uuid('id').primaryKey().defaultRandom(),
  connectedAccountId: text('connected_account_id'),
  customerId: text('customer_id').notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  agencyLogo: varchar('agency_logo', { length: 256 }).notNull(),
  companyEmail: varchar('company_email', { length: 256 }).notNull().unique(),
  companyPhone: varchar('company_phone', { length: 256 }),
  whiteLabel: boolean('white_label').default(true).notNull(),
  address: varchar('address', { length: 256 }).notNull(),
  city: varchar('city', { length: 256 }).notNull(),
  zipCode: varchar('zip_code', { length: 256 }).notNull(),
  state: varchar('state', { length: 256 }).notNull(),
  country: varchar('country', { length: 256 }).notNull(),
  goal: integer('goal').default(5).notNull(),
  ...timeStamps,
});

export type Agency = typeof agencyTable.$inferSelect;

export const agencyTableRelation = relations(agencyTable, ({ many, one }) => ({
  users: many(userTable),
  subaccounts: many(subaccountTable),
  notifications: many(notificationTable),
  invitations: many(invitationTable),
  agencySidebarOptionTable: many(agencySidebarOptionTable),
  subscription: one(subscriptionTable, {
    fields: [agencyTable.id],
    references: [subscriptionTable.agencyId],
  }),
  addOns: many(addOnsTable),
}));

export const subaccountTable = pgTable('subaccount', {
  id: uuid('id').primaryKey().defaultRandom(),
  connectAccountId: text('connect_account_id'),
  name: varchar('name', { length: 256 }),
  subAccountLogo: text('subaccount_logo').notNull(),
  companyEmail: text('company_email').notNull(),
  companyPhone: varchar('company_phone', { length: 64 }),
  goal: integer('goal').default(5).notNull(),
  address: varchar('address', { length: 256 }).notNull(),
  city: varchar('city', { length: 256 }).notNull(),
  zipCode: varchar('zip_code', { length: 256 }).notNull(),
  state: varchar('state', { length: 256 }).notNull(),
  country: varchar('country', { length: 256 }).notNull(),
  agencyId: uuid('agency_id')
    .references(() => agencyTable.id, { onDelete: 'cascade' })
    .notNull(),
});

export const subaccountTableRelation = relations(
  subaccountTable,
  ({ many, one }) => ({
    agency: one(agencyTable, {
      fields: [subaccountTable.agencyId],
      references: [agencyTable.id],
    }),
    sidebarOptions: many(subAccountSidebarOptionTable),
    permissions: many(permissionTable),
    funnels: many(funnelTable),
    media: many(mediaTable),
    contacts: many(contactTable),
    triggers: many(triggerTable),
    automations: many(automationTable),
    pipelines: many(pipelineTable),
    tags: many(tagTable),
    notifications: many(notificationTable),
  })
);

export type Subaccount = typeof subaccountTable.$inferSelect;
export const tagTable = pgTable('tag', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  color: varchar('color', { length: 256 }).notNull(),
  subAccountId: uuid('subaccount_id')
    .references(() => subaccountTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timeStamps,
});

export const tagTableRelations = relations(tagTable, ({ one, many }) => ({
  subaccount: one(subaccountTable, {
    fields: [tagTable.subAccountId],
    references: [subaccountTable.id],
  }),
  // tickets: many(ticketTable),
}));

export const pipelineTable = pgTable('pipeline', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  subAccountId: uuid('subaccount_id')
    .references(() => subaccountTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timeStamps,
});

export const pipelineTableRelations = relations(
  pipelineTable,
  ({ one, many }) => ({
    lanes: many(laneTable),
    subaccount: one(subaccountTable, {
      fields: [pipelineTable.subAccountId],
      references: [subaccountTable.id],
    }),
  })
);

export const laneTable = pgTable('lane', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  order: integer('order').default(0).notNull(),
  pipelineId: uuid('pipeline_id')
    .references(() => pipelineTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timeStamps,
});

export const laneTableRelations = relations(laneTable, ({ one, many }) => ({
  pipeline: one(pipelineTable, {
    fields: [laneTable.pipelineId],
    references: [pipelineTable.id],
  }),
  tickets: many(ticketTable),
}));

export const ticketTable = pgTable('ticket', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  order: integer('order').default(0).notNull(),
  value: decimal('value'),
  description: text('description'),
  customerId: uuid('id').references(() => contactTable.id, {
    onDelete: 'cascade',
  }),
  assignedUserId: uuid('assigned_user_id').references(() => userTable.id, {
    onDelete: 'cascade',
  }),
  laneId: uuid('lane_id')
    .references(() => laneTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timeStamps,
});

export const ticketTableRelations = relations(ticketTable, ({ one, many }) => ({
  lane: one(laneTable, {
    fields: [ticketTable.laneId],
    references: [laneTable.id],
  }),
  assignedUser: one(userTable, {
    fields: [ticketTable.assignedUserId],
    references: [userTable.id],
  }),
  customers: one(contactTable, {
    fields: [ticketTable.customerId],
    references: [contactTable.id],
  }),
}));

export const triggerType = pgEnum('trigger_type', ['contact-form']);

export const triggerTable = pgTable('trigger', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  type: triggerType('type').notNull(),
  subAccountId: uuid('subaccount_id')
    .references(() => subaccountTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timeStamps,
});

export const triggerTableRelations = relations(
  triggerTable,
  ({ one, many }) => ({
    subaccount: one(subaccountTable, {
      fields: [triggerTable.subAccountId],
      references: [subaccountTable.id],
    }),
    automations: many(automationTable),
  })
);

export const automationTable = pgTable('automation', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  published: boolean('published').default(false).notNull(),
  triggerId: uuid('trigger_id').references(() => triggerTable.id, {
    onDelete: 'cascade',
  }),
  subAccountId: uuid('subaccount_id')
    .references(() => subaccountTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timeStamps,
});

export const automationTableRelations = relations(
  automationTable,
  ({ one, many }) => ({
    subaccount: one(subaccountTable, {
      fields: [automationTable.subAccountId],
      references: [subaccountTable.id],
    }),
    trigger: one(triggerTable, {
      fields: [automationTable.triggerId],
      references: [triggerTable.id],
    }),
    actions: many(actionTable),
    automationInstances: many(automationInstanceTable),
  })
);

export const automationInstanceTable = pgTable('automation_instance', {
  id: uuid('id').primaryKey().defaultRandom(),
  automationId: uuid('automation_id')
    .references(() => automationTable.id, { onDelete: 'cascade' })
    .notNull(),
  active: boolean('active').default(false).notNull(),
  ...timeStamps,
});

export const automationInstanceTableRelation = relations(
  automationInstanceTable,
  ({ one }) => ({
    automation: one(automationTable, {
      fields: [automationInstanceTable.automationId],
      references: [automationTable.id],
    }),
  })
);

export const actionType = pgEnum('action_type', ['create-contact']);

export const actionTable = pgTable('action', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 257 }).notNull(),
  type: actionType('type').notNull(),
  order: integer('order').notNull(),
  laneId: text('laneId').notNull().default('0'),
  automationId: uuid('automation_id')
    .references(() => automationTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timeStamps,
});

export const actionTableRelation = relations(actionTable, ({ one }) => ({
  automation: one(automationTable, {
    fields: [actionTable.automationId],
    references: [automationTable.id],
  }),
}));

export const contactTable = pgTable('contact', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  subaccountId: uuid('subaccount_id')
    .references(() => subaccountTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timeStamps,
});

export const contactTableRelation = relations(
  contactTable,
  ({ one, many }) => ({
    subaccount: one(subaccountTable, {
      fields: [contactTable.subaccountId],
      references: [subaccountTable.id],
    }),

    tickets: many(ticketTable),
  })
);

export const mediaTable = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).notNull(),
  type: varchar('type', { length: 256 }),
  line: varchar('line', { length: 256 }).unique().notNull(),
  subaccountId: uuid('subaccount_id')
    .references(() => subaccountTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timeStamps,
});

export const mediaTableRelation = relations(mediaTable, ({ one, many }) => ({
  subaccount: one(subaccountTable, {
    fields: [mediaTable.subaccountId],
    references: [subaccountTable.id],
  }),
}));

export const funnelTable = pgTable('funnel', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  favicon: text('favicon'),
  subdomainName: varchar('subdomain_name', { length: 256 }),
  description: text('description'),
  published: boolean('published').default(false).notNull(),
  liveProducts: json('live_products').$type<Array<string>>().default([]),
  subaccountId: uuid('subaccount_id')
    .references(() => subaccountTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timeStamps,
});

export const funnelTableRelation = relations(funnelTable, ({ one, many }) => ({
  subaccount: one(subaccountTable, {
    fields: [funnelTable.subaccountId],
    references: [subaccountTable.id],
  }),
  funnelPages: many(funnelPageTable),
  classNames: many(classNameTable),
}));

export const classNameTable = pgTable('className', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  color: varchar('color', { length: 256 }).notNull(),
  customData: text('custom_data'),

  funnelId: uuid('funnel_id')
    .references(() => funnelTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timeStamps,
});

export const classNameTableRelation = relations(classNameTable, ({ one }) => ({
  funnel: one(funnelTable, {
    fields: [classNameTable.funnelId],
    references: [funnelTable.id],
  }),
}));

export const funnelPageTable = pgTable('funnel_page', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  pathname: text('pathname').notNull(),
  visits: integer('visits').default(0).notNull(),
  content: text('content'),
  order: integer('order').notNull(),
  previewImage: text('preview_image'),
  funnelId: uuid('funnel_id')
    .references(() => funnelTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timeStamps,
});

export const funnelPageTableRelation = relations(
  funnelPageTable,
  ({ one }) => ({
    funnel: one(funnelTable, {
      fields: [funnelPageTable.funnelId],
      references: [funnelTable.id],
    }),
  })
);

export const agencySidebarOptionTable = pgTable('agency_sidebar_option', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  link: text('content').default('#'),
  icon: icon('icon').default('info').notNull(),
  agencyId: uuid('agency_id').references(() => agencyTable.id, {
    onDelete: 'cascade',
  }),
  ...timeStamps,
});

export const agencySidebarOptionTableRelation = relations(
  agencySidebarOptionTable,
  ({ one }) => ({
    agency: one(agencyTable, {
      fields: [agencySidebarOptionTable.agencyId],
      references: [agencyTable.id],
    }),
  })
);

export type AgencySidebarOption = typeof agencySidebarOptionTable.$inferSelect;

export const subAccountSidebarOptionTable = pgTable(
  'subaccount_sidebar_option',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 256 }).notNull(),
    link: text('content').default('#'),
    icon: icon('icon').default('info').notNull(),
    subaccountId: uuid('subaccount_id').references(() => subaccountTable.id, {
      onDelete: 'cascade',
    }),
    ...timeStamps,
  }
);

export const subAccountSidebarOptionTableRelation = relations(
  subAccountSidebarOptionTable,
  ({ one }) => ({
    subaccount: one(subaccountTable, {
      fields: [subAccountSidebarOptionTable.subaccountId],
      references: [subaccountTable.id],
    }),
  })
);

export type SubaccountSidebarOption =
  typeof subAccountSidebarOptionTable.$inferSelect;

export const invitationStatus = pgEnum('invitation_status', [
  'accepted',
  'revoked',
  'pending',
]);

export const invitationTable = pgTable('invitation', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('name', { length: 256 }).notNull(),
  status: invitationStatus('status').default('pending').notNull(),
  role: role('role').default('subaccount-user').notNull(),
  agencyId: uuid('agency_id')
    .references(() => agencyTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timeStamps,
});

export const invitationTableRelation = relations(
  invitationTable,
  ({ one }) => ({
    agency: one(agencyTable, {
      fields: [invitationTable.agencyId],
      references: [agencyTable.id],
    }),
  })
);

export const notificationTable = pgTable('notification', {
  id: uuid('id').primaryKey().defaultRandom(),
  message: text('message').notNull(),
  agencyId: uuid('agency_id')
    .references(() => agencyTable.id, { onDelete: 'cascade' })
    .notNull(),
  subaccountId: uuid('subaccount_id').references(() => subaccountTable.id, {
    onDelete: 'cascade',
  }),
  userId: uuid('user_id')
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  ...timeStamps,
});

export const notificationTableRelation = relations(
  notificationTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [notificationTable.userId],
      references: [userTable.id],
    }),
    agency: one(agencyTable, {
      fields: [notificationTable.userId],
      references: [agencyTable.id],
    }),
    subaccount: one(subaccountTable, {
      fields: [notificationTable.userId],
      references: [subaccountTable.id],
    }),
  })
);

export type Notification = typeof notificationTable.$inferSelect;

export const plan = pgEnum('plan', [
  'price_1OYxkqFj9oKEERu1NbKUxXxN',
  'price_1OYxkqFj9oKEERu1KfJGWxgN',
]);

export const subscriptionTable = pgTable('subscription', {
  id: uuid('id').primaryKey().defaultRandom(),
  plan: plan('plan'),
  price: text('price'),
  active: boolean('active').notNull().default(false),
  priceId: text('price_id').notNull(),
  customerId: text('customer_id').notNull(),
  currentPeriodEndDate: timestamp('current_period_end_date').notNull(),
  subscriptionId: text('subscription_id').notNull(),
  agencyId: uuid('agency_id').references(() => agencyTable.id, {
    onDelete: 'cascade',
  }),
});

export const subscriptionTableRelation = relations(
  subscriptionTable,
  ({ one }) => ({
    agency: one(agencyTable, {
      fields: [subscriptionTable.agencyId],
      references: [agencyTable.id],
    }),
  })
);

export const addOnsTable = pgTable('add_ons', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  active: boolean('active').notNull().default(false),
  priceId: text('price_id').notNull(),
  agencyId: uuid('agency_id').references(() => agencyTable.id, {
    onDelete: 'cascade',
  }),
});

export const addOnsTableRelation = relations(addOnsTable, ({ one }) => ({
  agency: one(agencyTable, {
    fields: [addOnsTable.agencyId],
    references: [agencyTable.id],
  }),
}));
