# Arquitetura

## Fluxo de Telas

### Landing Page (`/`)

- Apresenta o produto e incentiva o usuário a:
  - abrir a biblioteca (prévia grátis)
  - criar conta / entrar (para liberar o catálogo completo)

Implementação:
- [LandingPage.tsx](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/src/components/LandingPage.tsx)

### Biblioteca (`/biblioteca`)

- Mostra catálogo + player.
- Visitante (sem sessão):
  - vê apenas uma prévia (limite de títulos)
  - é direcionado para cadastro/login para liberar o restante

Implementação:
- [AudiobookPlatform.tsx](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/src/components/AudiobookPlatform.tsx)
- [AudiobookCatalog.tsx](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/src/components/AudiobookCatalog.tsx)
- [AudioPlayer.tsx](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/src/components/AudioPlayer.tsx)

### Entrar (`/entrar`)

- Login/cadastro do usuário comum via Supabase Auth (email/senha).

Implementação:
- [UserLogin.tsx](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/src/components/UserLogin.tsx)

### Admin (`/admin`)

- Usa o mesmo app base, mas inicia em modo Admin.
- O dashboard só abre para emails autorizados (VITE_ADMIN_EMAILS).

Implementação:
- [AdminDashboard.tsx](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/src/components/AdminDashboard.tsx)
- [AdminLogin.tsx](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/src/components/AdminLogin.tsx)

## Roteamento

TanStack Router por arquivo:
- [routes/index.tsx](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/src/routes/index.tsx)
- [routes/biblioteca.tsx](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/src/routes/biblioteca.tsx)
- [routes/entrar.tsx](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/src/routes/entrar.tsx)
- [routes/admin.tsx](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/src/routes/admin.tsx)

## Integrações

### Supabase Client

- `getSupabaseConfig()` lê env e/ou localStorage:
  - [config.ts](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/src/lib/supabase/config.ts)
- `getSupabaseClient()` cria client singleton:
  - [client.ts](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/src/lib/supabase/client.ts)
- `useSupabaseSession()` controla sessão e readiness:
  - [useSupabaseSession.ts](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/src/lib/supabase/useSupabaseSession.ts)

### Catálogo (dados)

- Query principal usa TanStack Query e lê via `listAudiobooks()`:
  - [audiobooks.ts](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/src/lib/supabase/audiobooks.ts)

## Branding / Ícones

- Logo principal (header e assets): [app_icon.svg](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/public/app_icon.svg)
- Favicon (ícone recortado): [favicon.svg](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/public/favicon.svg)
- Referências no HTML: [index.html](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/index.html)

