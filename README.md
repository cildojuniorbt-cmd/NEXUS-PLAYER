# NEXUS PLAYER WEB

Primeira versão web do Nexus Player, em português brasileiro.

## Recursos
- Reprodução de arquivos locais de áudio e vídeo
- Biblioteca da sessão, pesquisa e favoritos
- Aleatório, repetir, volume e progresso
- Equalizador de cinco bandas via Web Audio API
- Tema claro/escuro e layout responsivo
- Manifest e service worker para experiência PWA básica

## Testar localmente
Abra esta pasta no VS Code e execute no terminal:
`py -m http.server 5173`
Acesse http://localhost:5173.

## Publicar no GitHub Pages
Em Settings > Pages, escolha Deploy from a branch, branch main e pasta /(root).
O site ficará em https://cildojuniorbt-cmd.github.io/NEXUS-PLAYER/.

## Limitações
Os arquivos são escolhidos pelo usuário e permanecem disponíveis apenas durante a sessão atual. Não há sincronização em nuvem. A compatibilidade de formatos depende do navegador.
