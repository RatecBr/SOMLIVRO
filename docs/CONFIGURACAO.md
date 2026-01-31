# Configuração

## Variáveis de Ambiente

Use o arquivo [.env.example](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/.env.example) como base.

### Supabase

- `VITE_SUPABASE_URL`
  - Ex.: `https://xxxx.supabase.co`
- `VITE_SUPABASE_ANON_KEY`
  - Chave pública (anon/publishable)

Sem essas variáveis no deploy, o app entra em modo “Supabase não configurado” e orienta o usuário.

## Supabase Auth (URLs)

Para confirmação de cadastro e redirecionamento correto:

- Em **Supabase → Authentication → URL Configuration**
  - `Site URL`: URL principal do sistema (ex.: `https://www.somlivro.com/`)
  - `Redirect URLs`: incluir a rota de login e/ou wildcard, por exemplo:
    - `https://www.somlivro.com/entrar`
    - `https://www.somlivro.com/*`
    - `http://localhost:3000/*` (dev)

Observação:
- O cadastro do usuário comum envia `emailRedirectTo` para `/entrar` automaticamente (para cair na tela de login após confirmar).

### Admin (allowlist)

## Admin (permissões)

Regras do sistema:
- O administrador principal é fixo: `marx.jane.menezes@gmail.com`.
- Apenas esse usuário pode conceder/remover acesso de Admin para outros emails.
- Outros admins são cadastrados no banco (tabela `admin_users`).

Para habilitar esse controle no Supabase, aplique os scripts:
- [schema.sql](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/supabase/schema.sql)
- [storage.sql](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/supabase/storage.sql)

Após aplicado, a gestão de admins fica disponível no painel administrativo quando logado como o administrador principal.

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
