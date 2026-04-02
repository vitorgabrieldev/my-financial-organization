create table if not exists public.idempotency_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_key text not null,
  method text not null check (method in ('POST', 'PATCH', 'PUT', 'DELETE')),
  route text not null,
  request_hash text not null,
  status_code integer not null check (status_code between 100 and 599),
  response_body jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null default timezone('utc', now()) + interval '24 hours',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint idempotency_requests_user_key_method_route_unique unique (
    user_id,
    request_key,
    method,
    route
  )
);

create index if not exists idx_idempotency_requests_user_expires
  on public.idempotency_requests(user_id, expires_at);

drop trigger if exists tr_idempotency_requests_set_updated_at on public.idempotency_requests;
create trigger tr_idempotency_requests_set_updated_at
before update on public.idempotency_requests
for each row execute function public.set_updated_at();

alter table public.idempotency_requests enable row level security;

drop policy if exists "Idempotency requests can be read by self" on public.idempotency_requests;
create policy "Idempotency requests can be read by self"
on public.idempotency_requests
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Idempotency requests can be inserted by self" on public.idempotency_requests;
create policy "Idempotency requests can be inserted by self"
on public.idempotency_requests
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Idempotency requests can be updated by self" on public.idempotency_requests;
create policy "Idempotency requests can be updated by self"
on public.idempotency_requests
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Idempotency requests can be deleted by self" on public.idempotency_requests;
create policy "Idempotency requests can be deleted by self"
on public.idempotency_requests
for delete
to authenticated
using (auth.uid() = user_id);

grant select, insert, update, delete on public.idempotency_requests to authenticated;
