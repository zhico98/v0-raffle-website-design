-- Delete all existing raffle rounds to start fresh
DELETE FROM raffle_rounds;

-- Create new 24-hour rounds for all raffles
INSERT INTO raffle_rounds (raffle_id, round_number, start_time, end_time, status, total_tickets_sold, total_prize_pool)
VALUES
  ('1', 1, NOW(), NOW() + INTERVAL '24 hours', 'active', 0, 0),
  ('2', 1, NOW(), NOW() + INTERVAL '24 hours', 'active', 0, 0),
  ('3', 1, NOW(), NOW() + INTERVAL '24 hours', 'active', 0, 0),
  ('4', 1, NOW(), NOW() + INTERVAL '24 hours', 'active', 0, 0);
