create or replace function public.log_listing_admin_activity()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_action text;
begin
  if v_actor is null or not exists (
    select 1 from public.admins a where a.user_id = v_actor
  ) then
    return new;
  end if;

  if old.status is distinct from new.status then
    v_action := case new.status
      when 'approved' then 'listing_approved'
      when 'rejected' then 'listing_rejected'
      else 'listing_status_changed'
    end;

    insert into public.admin_activity_log (
      actor_user_id, listing_id, action, old_status, new_status, details
    ) values (
      v_actor, new.id, v_action, old.status, new.status,
      jsonb_build_object('listing_type', new.listing_type)
    );
  end if;

  if old.verification_status is distinct from new.verification_status then
    v_action := case
      when new.verification_status = 'verified' then 'listing_verified'
      when old.verification_status = 'verified' then 'listing_verification_reset'
      else 'listing_verification_changed'
    end;

    insert into public.admin_activity_log (
      actor_user_id, listing_id, action, details
    ) values (
      v_actor, new.id, v_action,
      jsonb_build_object(
        'old_verification_status', old.verification_status,
        'new_verification_status', new.verification_status,
        'listing_type', new.listing_type
      )
    );
  end if;

  return new;
end;
$$;

comment on function public.log_listing_admin_activity() is
'Automatically records authenticated administrator listing status and verification changes.';

drop trigger if exists trg_log_listing_admin_activity on public.listings;
create trigger trg_log_listing_admin_activity
after update of status, verification_status on public.listings
for each row
execute function public.log_listing_admin_activity();