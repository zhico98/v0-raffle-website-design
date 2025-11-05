-- Delete all duplicate rounds, keeping only the most recent one for each raffle
DELETE FROM raffle_rounds
WHERE id NOT IN (
  SELECT DISTINCT ON (raffle_id, status) id
  FROM raffle_rounds
  WHERE status = 'active'
  ORDER BY raffle_id, status, created_at DESC
);

-- Add unique constraint to prevent duplicate active rounds
ALTER TABLE raffle_rounds
DROP CONSTRAINT IF EXISTS unique_active_round_per_raffle;

ALTER TABLE raffle_rounds
ADD CONSTRAINT unique_active_round_per_raffle 
UNIQUE (raffle_id, round_number, status);

-- Reset all active rounds to have proper 24-hour duration
UPDATE raffle_rounds
SET 
  start_time = NOW(),
  end_time = NOW() + INTERVAL '24 hours',
  updated_at = NOW()
WHERE status = 'active';
