# Operação

## Deploy

Este projeto pode ser publicado em:
- GitHub Pages (via GitHub Actions)
- Vercel (recomendado para SPA/PWA, se aplicável)

### Rotas SPA (importante)

Como o sistema é uma SPA, URLs diretas como `/entrar` precisam ser reescritas para servir o `index.html`.

- No Vercel, isso é feito via [vercel.json](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/vercel.json).
- No GitHub Pages, o workflow já cria `dist/404.html` como fallback para SPA.

### Variáveis no deploy

No provedor (GitHub Actions/Vercel), configurar:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

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

O usuário autenticou, mas não tem permissão de admin.

Regras:
- Admin principal: `marx.jane.menezes@gmail.com`
- Outros admins: concedidos pelo admin principal no painel

### Confirmação de cadastro cai em 404

Sintoma:
- Ao confirmar o email, abre uma URL como `/entrar#access_token=...` e aparece 404.

Causa:
- O provedor não está reescrevendo rotas SPA para `index.html`.

Solução:
- Garantir `vercel.json` no deploy Vercel e/ou fallback de SPA no host.
- No Supabase Auth, garantir que Redirect URLs incluem a rota de login (ex.: `/entrar`).

### “email rate limit exceeded” (429)

Sintoma:
- Ao criar conta, aparece mensagem de limite de email e o console mostra 429.

Causa:
- Rate limit temporário do provedor de envio de emails do Supabase (muitas tentativas em pouco tempo).

Mitigações:
- Aguardar e tentar mais tarde.
- Evitar múltiplos envios/reenvios em sequência.
- Em produção, configurar um SMTP próprio para melhorar entregabilidade e reduzir limites.

## PWA (decisão futura)

O sistema já inclui `manifest.json`, mas para ser PWA completo ainda precisa de Service Worker e ícones PNG.
O checklist técnico está registrado para implementação quando for decidido.
