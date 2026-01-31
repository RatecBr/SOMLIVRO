# Operação

## Deploy

Este projeto pode ser publicado em:
- GitHub Pages (via GitHub Actions)
- Vercel (recomendado para SPA/PWA, se aplicável)

### Variáveis no deploy

No provedor (GitHub Actions/Vercel), configurar:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAILS` (emails de admin permitidos)

Sem as variáveis do Supabase, o sistema entra em modo “Supabase não configurado”.

## Troubleshooting

### “Falha ao carregar audiobooks / Supabase não configurado”

Possíveis causas:
- env vars do Supabase não foram configuradas no deploy
- tabela `audiobooks` não existe no banco
- políticas do Supabase bloqueando leitura

O que checar:
- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- scripts em [schema.sql](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/supabase/schema.sql) e [storage.sql](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/supabase/storage.sql)

### “Acesso negado” no Admin

O usuário autenticou, mas o email não está liberado em `VITE_ADMIN_EMAILS`.

## PWA (decisão futura)

O sistema já inclui `manifest.json`, mas para ser PWA completo ainda precisa de Service Worker e ícones PNG.
O checklist técnico está registrado para implementação quando for decidido.

