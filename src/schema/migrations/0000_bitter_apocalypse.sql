DO $$ BEGIN
 CREATE TYPE "agency_role" AS ENUM('agency-owner', 'agency-admin', 'subaccount-user', 'subaccount-guest');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
