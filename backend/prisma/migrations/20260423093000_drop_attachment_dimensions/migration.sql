-- Remove unused image dimension metadata from attachments
ALTER TABLE "attachments"
  DROP COLUMN "width",
  DROP COLUMN "height";
