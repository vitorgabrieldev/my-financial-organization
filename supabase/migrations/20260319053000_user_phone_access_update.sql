alter table public.user_profiles
  add column if not exists phone text;

update public.user_profiles up
set phone = nullif(regexp_replace(coalesce(u.phone, ''), '\D', '', 'g'), '')
from auth.users u
where u.id = up.user_id
  and coalesce(up.phone, '') = '';

drop function if exists public.admin_create_user(text, text, text, boolean, jsonb);

create or replace function public.admin_create_user(
  p_email text,
  p_password text,
  p_full_name text default null,
  p_phone text default null,
  p_is_admin boolean default false,
  p_permissions jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  requester_id uuid := auth.uid();
  normalized_email text := lower(trim(p_email));
  normalized_phone text := nullif(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), '');
  new_user_id uuid := gen_random_uuid();
  permission_item jsonb;
  provider_payload jsonb;
begin
  if requester_id is null then
    raise exception 'Usuário não autenticado.';
  end if;

  if not public.is_admin(requester_id) then
    raise exception 'Apenas administradores podem criar usuários.';
  end if;

  if normalized_email is null or normalized_email = '' then
    raise exception 'Email obrigatório.';
  end if;

  if p_password is null or length(p_password) < 8 then
    raise exception 'Senha deve ter no mínimo 8 caracteres.';
  end if;

  if normalized_phone is not null and length(normalized_phone) > 11 then
    raise exception 'Telefone inválido.';
  end if;

  if exists (
    select 1
    from auth.users u
    where lower(u.email) = normalized_email
  ) then
    raise exception 'Email já cadastrado.';
  end if;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    phone,
    phone_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    is_sso_user,
    is_anonymous
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    normalized_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    timezone('utc', now()),
    normalized_phone,
    case when normalized_phone is not null then timezone('utc', now()) else null end,
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('phone', normalized_phone),
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    '',
    false,
    false
  );

  provider_payload := jsonb_build_object(
    'sub', new_user_id::text,
    'email', normalized_email,
    'email_verified', true
  );

  insert into auth.identities (
    id,
    user_id,
    provider_id,
    provider,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    gen_random_uuid(),
    new_user_id,
    new_user_id::text,
    'email',
    provider_payload,
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (provider_id, provider) do nothing;

  update public.user_profiles
    set email = normalized_email,
        full_name = coalesce(nullif(trim(p_full_name), ''), split_part(normalized_email, '@', 1)),
        phone = normalized_phone,
        is_admin = p_is_admin,
        created_by = requester_id
  where user_id = new_user_id;

  if jsonb_typeof(p_permissions) = 'array' and jsonb_array_length(p_permissions) > 0 then
    delete from public.user_module_permissions
    where user_id = new_user_id;

    for permission_item in
      select value from jsonb_array_elements(p_permissions)
    loop
      insert into public.user_module_permissions (
        user_id,
        module,
        can_view,
        can_list,
        can_create,
        can_edit,
        can_delete
      )
      values (
        new_user_id,
        (permission_item->>'module')::public.app_module,
        coalesce((permission_item->>'can_view')::boolean, false),
        coalesce((permission_item->>'can_list')::boolean, false),
        coalesce((permission_item->>'can_create')::boolean, false),
        coalesce((permission_item->>'can_edit')::boolean, false),
        coalesce((permission_item->>'can_delete')::boolean, false)
      )
      on conflict (user_id, module) do update
      set can_view = excluded.can_view,
          can_list = excluded.can_list,
          can_create = excluded.can_create,
          can_edit = excluded.can_edit,
          can_delete = excluded.can_delete;
    end loop;
  end if;

  if p_is_admin then
    update public.user_module_permissions
      set can_view = true,
          can_list = true,
          can_create = true,
          can_edit = true,
          can_delete = true
    where user_id = new_user_id;
  end if;

  return new_user_id;
end;
$$;

drop function if exists public.admin_update_user_access(uuid, text, boolean, jsonb);

create or replace function public.admin_update_user_access(
  p_target_user_id uuid,
  p_full_name text,
  p_phone text default null,
  p_is_admin boolean default false,
  p_permissions jsonb default '[]'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requester_id uuid := auth.uid();
  normalized_phone text := nullif(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), '');
  permission_item jsonb;
begin
  if requester_id is null then
    raise exception 'Usuário não autenticado.';
  end if;

  if not public.is_admin(requester_id) then
    raise exception 'Apenas administradores podem editar acessos.';
  end if;

  if not exists (
    select 1
    from public.user_profiles up
    where up.user_id = p_target_user_id
  ) then
    raise exception 'Usuário alvo não encontrado.';
  end if;

  if normalized_phone is not null and length(normalized_phone) > 11 then
    raise exception 'Telefone inválido.';
  end if;

  update public.user_profiles
    set full_name = coalesce(nullif(trim(p_full_name), ''), full_name),
        phone = normalized_phone,
        is_admin = p_is_admin
  where user_id = p_target_user_id;

  update auth.users
    set phone = normalized_phone,
        phone_confirmed_at = case when normalized_phone is not null then coalesce(phone_confirmed_at, timezone('utc', now())) else null end,
        updated_at = timezone('utc', now())
  where id = p_target_user_id;

  if jsonb_typeof(p_permissions) = 'array' then
    delete from public.user_module_permissions
    where user_id = p_target_user_id;

    for permission_item in
      select value from jsonb_array_elements(p_permissions)
    loop
      insert into public.user_module_permissions (
        user_id,
        module,
        can_view,
        can_list,
        can_create,
        can_edit,
        can_delete
      )
      values (
        p_target_user_id,
        (permission_item->>'module')::public.app_module,
        coalesce((permission_item->>'can_view')::boolean, false),
        coalesce((permission_item->>'can_list')::boolean, false),
        coalesce((permission_item->>'can_create')::boolean, false),
        coalesce((permission_item->>'can_edit')::boolean, false),
        coalesce((permission_item->>'can_delete')::boolean, false)
      )
      on conflict (user_id, module) do update
      set can_view = excluded.can_view,
          can_list = excluded.can_list,
          can_create = excluded.can_create,
          can_edit = excluded.can_edit,
          can_delete = excluded.can_delete;
    end loop;
  end if;

  if p_is_admin then
    update public.user_module_permissions
      set can_view = true,
          can_list = true,
          can_create = true,
          can_edit = true,
          can_delete = true
    where user_id = p_target_user_id;
  end if;
end;
$$;

grant execute on function public.admin_create_user(text, text, text, text, boolean, jsonb) to authenticated;
grant execute on function public.admin_update_user_access(uuid, text, text, boolean, jsonb) to authenticated;
