# Configuração

## Variáveis de Ambiente

Use o arquivo [.env.example](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/.env.example) como base.

### Supabase

- `VITE_SUPABASE_URL`
  - Ex.: `https://xxxx.supabase.co`
- `VITE_SUPABASE_ANON_KEY`
  - Chave pública (anon/publishable)

Sem essas variáveis no deploy, o app entra em modo “Supabase não configurado” e orienta o usuário.

### Admin (allowlist)

- `VITE_ADMIN_EMAILS`
  - Lista de emails separados por vírgula e/ou espaço.
  - Ex.: `admin@dominio.com, outro@dominio.com`

Regras:
- O painel `/admin` só abre o dashboard se o usuário autenticado estiver nessa lista.
- Um usuário fora da allowlist verá “Acesso negado” ao tentar acessar o Admin.

### Outras

- `TENANT_ID`
  - Mantido para compatibilidade com build/base do projeto.

## Supabase (Banco e Storage)

O repositório inclui SQLs de referência:
- [schema.sql](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/supabase/schema.sql)
- [storage.sql](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/supabase/storage.sql)

### Modelo de dados (alto nível)

- `public.audiobooks`
  - Metadados do catálogo (título, autor, capa, url do áudio etc.)

### Storage

- Bucket `media`
  - Usado para upload de capas e arquivos de áudio

## Segurança e Observações

- O controle de “admin vs usuário comum” no app é por **allowlist** (VITE_ADMIN_EMAILS).
- Para segurança completa, recomenda-se reforçar o back-end com RLS/policies no Supabase:
  - restringir escrita na tabela/bucket apenas para admins
  - manter leitura pública ou apenas para autenticados, conforme a regra de negócio

