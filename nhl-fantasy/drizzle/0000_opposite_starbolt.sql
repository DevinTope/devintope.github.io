CREATE TABLE "fantasy_team_players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fantasy_team_id" uuid NOT NULL,
	"nhl_player_id" integer NOT NULL,
	"player_name" varchar(160) NOT NULL,
	"position" varchar(16),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fantasy_team_players_team_player_unique" UNIQUE("fantasy_team_id","nhl_player_id")
);
--> statement-breakpoint
CREATE TABLE "fantasy_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fantasy_teams_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"display_name" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "fantasy_team_players" ADD CONSTRAINT "fantasy_team_players_fantasy_team_id_fantasy_teams_id_fk" FOREIGN KEY ("fantasy_team_id") REFERENCES "public"."fantasy_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_teams" ADD CONSTRAINT "fantasy_teams_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;