-- Delete any existing rounds to start fresh
DELETE FROM raffle_rounds;

-- Create active 24-hour rounds for all raffles starting NOW
INSERT INTO raffle_rounds (
  raffle_id,
  round_number,
  start_time,
  end_time,
  status,
  total_tickets_sold,
  total_prize_pool
) VALUES
  -- Raffle 1: 0.0023 BNB
  ('1', 1, NOW(), NOW() + INTERVAL '24 hours', 'active', 0, 0),
  
  -- Raffle 2: 0.023 BNB
  ('2', 1, NOW(), NOW() + INTERVAL '24 hours', 'active', 0, 0),
  
  -- Raffle 3: 0.23 BNB
  ('3', 1, NOW(), NOW() + INTERVAL '24 hours', 'active', 0, 0),
  
  -- Raffle 4: FREE (0.322 BNB prize)
  ('4', 1, NOW(), NOW() + INTERVAL '24 hours', 'active', 0, 0);
