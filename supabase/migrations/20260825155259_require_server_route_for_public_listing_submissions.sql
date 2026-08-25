-- Public listing submissions are now validated and inserted by /api/listings.
-- The server route uses Supabase server credentials and invokes the scope-aware
-- admin notification worker after a successful pending submission.
drop policy if exists "Anyone can submit listings" on public.listings;
