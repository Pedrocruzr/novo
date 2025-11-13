create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','recrutador','viewer')),
  created_at timestamptz default now()
);

create or replace function public.is_admin() returns boolean
language sql stable as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

create or replace function public.is_recrutador_ou_admin() returns boolean
language sql stable as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('recrutador','admin'));
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role) values (new.id, 'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

alter table if exists public.candidatos add column if not exists curriculo_path text;

alter table public.candidatos enable row level security;
create policy if not exists candidatos_select on public.candidatos for select to authenticated using ( public.is_recrutador_ou_admin() );
create policy if not exists candidatos_cud on public.candidatos for all to authenticated using ( public.is_recrutador_ou_admin() ) with check ( public.is_recrutador_ou_admin() );

alter table public.vagas enable row level security;
create or replace view public.vagas_publicas as
select id, titulo, local, senioridade, publicada_em, descricao_publica
from public.vagas where status = 'publicada';

create policy if not exists vagas_select_internal on public.vagas for select to authenticated using ( true );
create policy if not exists vagas_cud_admin on public.vagas for all to authenticated using ( public.is_admin() ) with check ( public.is_admin() );

grant select on public.vagas_publicas to anon, authenticated;

alter table public.auditoria enable row level security;
revoke update, delete on public.auditoria from anon, authenticated;

create or replace function public.log_evento(categoria text, acao text, alvo text, detalhes jsonb)
returns void language plpgsql security definer as $$
begin
  insert into public.auditoria(usuario_id, categoria, acao, alvo, detalhes)
  values (auth.uid(), categoria, acao, alvo, detalhes);
end;
$$;

create policy if not exists auditoria_select_admin on public.auditoria for select to authenticated using ( public.is_admin() );
create policy if not exists auditoria_insert_via_func on public.auditoria for insert to authenticated with check ( auth.uid() is not null );

do $$ begin
  perform storage.create_bucket('curriculos', public := false);
exception when others then null; end $$;

alter table if exists storage.objects enable row level security;

create policy if not exists curriculos_no_select on storage.objects for select to authenticated using ( false );
create policy if not exists curriculos_insert on storage.objects for insert to authenticated with check ( bucket_id = 'curriculos' and public.is_recrutador_ou_admin() );
create policy if not exists curriculos_no_update on storage.objects for update to authenticated using ( false ) with check ( false );
create policy if not exists curriculos_no_delete on storage.objects for delete to authenticated using ( false );

revoke all on public.vagas from anon;
revoke all on public.candidatos from anon;
revoke all on public.auditoria from anon;
revoke insert, update, delete on public.vagas, public.candidatos, public.auditoria from anon;
