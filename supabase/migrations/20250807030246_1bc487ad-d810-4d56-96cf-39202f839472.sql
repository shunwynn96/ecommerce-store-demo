-- Insert 5 demo user accounts
INSERT INTO public.profiles (user_id, email, role) VALUES
  (gen_random_uuid(), 'demo.user1@example.com', 'user'),
  (gen_random_uuid(), 'demo.user2@example.com', 'user'),
  (gen_random_uuid(), 'demo.user3@example.com', 'user'),
  (gen_random_uuid(), 'demo.user4@example.com', 'user'),
  (gen_random_uuid(), 'demo.user5@example.com', 'user');