import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  displayName: varchar("display_name", { length: 120 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const fantasyTeams = pgTable("fantasy_teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const fantasyTeamPlayers = pgTable(
  "fantasy_team_players",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fantasyTeamId: uuid("fantasy_team_id")
      .notNull()
      .references(() => fantasyTeams.id, { onDelete: "cascade" }),
    nhlPlayerId: integer("nhl_player_id").notNull(),
    playerName: varchar("player_name", { length: 160 }).notNull(),
    position: varchar("position", { length: 16 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("fantasy_team_players_team_player_unique").on(
      table.fantasyTeamId,
      table.nhlPlayerId,
    ),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  fantasyTeams: many(fantasyTeams),
}));

export const fantasyTeamsRelations = relations(fantasyTeams, ({ one, many }) => ({
  owner: one(users, {
    fields: [fantasyTeams.ownerId],
    references: [users.id],
  }),
  players: many(fantasyTeamPlayers),
}));

export const fantasyTeamPlayersRelations = relations(
  fantasyTeamPlayers,
  ({ one }) => ({
    fantasyTeam: one(fantasyTeams, {
      fields: [fantasyTeamPlayers.fantasyTeamId],
      references: [fantasyTeams.id],
    }),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type FantasyTeam = typeof fantasyTeams.$inferSelect;
export type NewFantasyTeam = typeof fantasyTeams.$inferInsert;
export type FantasyTeamPlayer = typeof fantasyTeamPlayers.$inferSelect;
export type NewFantasyTeamPlayer = typeof fantasyTeamPlayers.$inferInsert;
