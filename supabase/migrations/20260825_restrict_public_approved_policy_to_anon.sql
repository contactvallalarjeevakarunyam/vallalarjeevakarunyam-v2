-- Public visitors remain able to read approved listings, while authenticated
-- administrators use the scope-aware admin SELECT policy.
alter policy "Public can read approved listings"
on public.listings
to anon
using (status = 'approved');