# SOMLIVRO

Plataforma web para consumir audiobooks com player integrado, catálogo e área administrativa.

## Visão Geral

O SOMLIVRO é um sistema com foco em **usuário consumidor**:
- Página inicial (landing page) com chamada para explorar a biblioteca e cadastro grátis
- Biblioteca com catálogo e player
- Visitantes (sem login) veem apenas uma **prévia limitada** (ex.: 2 títulos)
- Usuários autenticados desbloqueiam o catálogo completo
- Admin é controlado por permissões: um admin principal e admins concedidos por ele

## Stack

- Vite + React
- TanStack Router (rotas por arquivos)
- TanStack Query (cache/requests)
- Supabase (Auth + Database + Storage)
- TailwindCSS + componentes shadcn/ui

## Rotas

- `/` : Landing page
- `/biblioteca` : Catálogo + Player (prévia para visitantes; completo para logados)
- `/entrar` : Login/cadastro do usuário comum (Supabase Auth)
- `/admin` : Painel Admin (apenas emails permitidos)

## Configuração (variáveis de ambiente)

Base:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `TENANT_ID` (padrão: `SOMLIVRO`)

Veja detalhes em:
- [CONFIGURACAO.md](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/docs/CONFIGURACAO.md)

## Banco de Dados / Storage (Supabase)

Scripts versionados (referência):
- [schema.sql](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/supabase/schema.sql)
- [storage.sql](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/supabase/storage.sql)

Documentação:
- [ARQUITETURA.md](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/docs/ARQUITETURA.md)
- [OPERACAO.md](file:///d:/Dropbox/DOWNLOAD/RATec/_APLICATIVOS/SOMLIVRO/docs/OPERACAO.md)

## Desenvolvimento Local

1) Instale dependências

2) Crie um `.env` baseado no `.env.example`

3) Rode o servidor de desenvolvimento

## Observações Importantes

- Deploy/push/publicação devem ser feitos apenas com autorização explícita do responsável.
- A limitação “visitante vê 2 títulos” é uma regra de UI/UX; se precisar de bloqueio real, implemente RLS/policies no Supabase.
- Confirmação de cadastro por email exige configuração correta de URLs no Supabase e rewrite de rotas SPA no host (Vercel/Pages).
