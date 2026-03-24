-- +goose Up
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS square_image_url TEXT,
  ADD COLUMN IF NOT EXISTS landscape_image_url TEXT;

-- +goose Down
ALTER TABLE events
  DROP COLUMN IF EXISTS landscape_image_url,
  DROP COLUMN IF EXISTS square_image_url;
