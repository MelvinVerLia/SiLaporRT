-- Add relation column from attachments to message
ALTER TABLE "attachments" ADD COLUMN "messageId" TEXT;

-- Add index to optimize message -> attachments lookups
CREATE INDEX "attachments_messageId_idx" ON "attachments"("messageId");

-- Add foreign key for message attachments
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_messageId_fkey"
  FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing JSONB message attachments into attachments table
WITH extracted AS (
  SELECT
    m."id" AS message_id,
    m."createdAt" AS message_created_at,
    t.ordinality,
    t.item,
    NULLIF(t.item->>'publicId', '') AS public_id
  FROM "message" m
  CROSS JOIN LATERAL jsonb_array_elements(m."attachments") WITH ORDINALITY AS t(item, ordinality)
  WHERE m."attachments" IS NOT NULL
    AND jsonb_typeof(m."attachments") = 'array'
),
dedup AS (
  SELECT
    e.*,
    ROW_NUMBER() OVER (PARTITION BY e.public_id ORDER BY e.message_created_at, e.ordinality) AS public_id_rank
  FROM extracted e
),
prepared AS (
  SELECT
    d.message_id,
    d.message_created_at,
    d.ordinality,
    COALESCE(NULLIF(d.item->>'filename', ''), NULLIF(d.item->>'publicId', ''), 'attachment') AS filename,
    COALESCE(NULLIF(d.item->>'url', ''), NULLIF(d.item->>'secure_url', '')) AS url,
    COALESCE(NULLIF(d.item->>'fileType', ''), 'document') AS file_type,
    NULLIF(d.item->>'provider', '') AS provider,
    CASE
      WHEN d.public_id IS NULL THEN NULL
      WHEN d.public_id_rank > 1 THEN NULL
      WHEN EXISTS (
        SELECT 1 FROM "attachments" a WHERE a."publicId" = d.public_id
      ) THEN NULL
      ELSE d.public_id
    END AS public_id,
    NULLIF(d.item->>'resourceType', '') AS resource_type,
    NULLIF(d.item->>'format', '') AS format,
    CASE
      WHEN (d.item->>'bytes') ~ '^[0-9]+$' THEN (d.item->>'bytes')::INTEGER
      ELSE NULL
    END AS bytes,
    CASE
      WHEN (d.item->>'width') ~ '^[0-9]+$' THEN (d.item->>'width')::INTEGER
      ELSE NULL
    END AS width,
    CASE
      WHEN (d.item->>'height') ~ '^[0-9]+$' THEN (d.item->>'height')::INTEGER
      ELSE NULL
    END AS height
  FROM dedup d
)
INSERT INTO "attachments" (
  "id",
  "filename",
  "url",
  "fileType",
  "provider",
  "publicId",
  "resourceType",
  "format",
  "bytes",
  "width",
  "height",
  "messageId",
  "createdAt"
)
SELECT
  'msgatt_' || md5(p.message_id || ':' || p.ordinality || ':' || random()::TEXT) AS id,
  p.filename,
  p.url,
  p.file_type,
  p.provider,
  p.public_id,
  p.resource_type,
  p.format,
  p.bytes,
  p.width,
  p.height,
  p.message_id,
  p.message_created_at
FROM prepared p
WHERE p.url IS NOT NULL;

-- Remove legacy JSONB column from message table
ALTER TABLE "message" DROP COLUMN "attachments";
