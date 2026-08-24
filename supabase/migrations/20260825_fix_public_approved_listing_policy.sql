-- Keep the public read policy aligned with the lowercase status values
-- used by the application and admin approval workflow.
alter policy "Public can read approved listings"
on public.listings
using (status = 'approved');
