# Recruit Secure App (Next.js + Supabase)

## Passos
1. Supabase → **SQL Editor** → cole e rode `supabase/sql/01_supabase.sql`.
2. Storage → **Buckets** → crie `curriculos` como **Private**.
3. Project Settings → **API** → copie `Project URL`, `anon key`, `service role key`.
4. Copie `.env.example` para `.env.local` e preencha as variáveis.
5. **Edge Functions**: crie/deploy `upload-curriculo`, `get-curriculo-url`, `processa-curriculo` com **Verify JWT: ON** e **Secrets** (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`; e Upstash se usar).
6. Local: `npm install` → `npm run dev` → `http://localhost:3000`.

## Promover usuário a admin
```sql
update public.profiles p
set role = 'admin'
from auth.users u
where u.email = 'SEU-EMAIL@DOMINIO.COM' and p.id = u.id;

Rotas

/ — Vagas públicas (view vagas_publicas)

/login — E-mail/senha

/app — Dashboard autenticado

/candidatos — RLS + role recrutador/admin

/vagas/gerenciar — role admin


---

**Importante:** ative **Verify JWT** em cada Edge Function e use apenas **URL assinada** para baixar arquivos do bucket privado.

---

Se quiser, eu adapto esse brief com **seu e-mail** já no SQL de promoção e com o **seu Project URL** do Supabase — é só me mandar esses dois dados.
```
