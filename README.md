# Elias Painting — prévia no GitHub Pages

Projeto preparado e testado em 17/10/2026. Envio do código e publicação da prévia autorizados pelo usuário. Repositório público: https://github.com/Sales-777/elias-painting-preview. Prévia publicada com sucesso em 17/10/2026: https://sales-777.github.io/elias-painting-preview/.

## O que existe no projeto

O ZIP original tem 409 arquivos, dentro da pasta Elias_Painting_Codigo. O site usa React 19, TypeScript, Tailwind e Vite 8. O código está em src/, as fotografias em assets/original/ e o catálogo em docs/image-catalog.json. A pasta dist/ do original era uma versão compilada para a raiz de um servidor local.

O processo de compilação prepara imagens WebP, verifica TypeScript, compila a página e pré-renderiza seu conteúdo. Não é necessário manter um servidor Node na hospedagem: o GitHub Pages recebe somente os arquivos finais de dist/.

## Publicação da prévia

Conta conectada: Sales-777.
Repositório: elias-painting-preview.
Endereço publicado: https://sales-777.github.io/elias-painting-preview/

Se o repositório for público, outras pessoas poderão consultar e baixar seu código e as imagens enviadas. O site publicado também poderá ser visitado por qualquer pessoa. A tag noindex, nofollow já existente foi preservada; ela não torna a página privada. O próprio protótipo informa que a atribuição das fotografias e os direitos de imagem aguardam confirmação.

Não existe arquivo CNAME neste pacote. Não adicionar domínio personalizado nem alterar DNS. A prévia usa apenas o endereço github.io e mantém o domínio oficial independente.

Autorização já concedida. Para concluir a publicação:

1. Criar na conta Sales-777 o repositório elias-painting-preview, com a visibilidade aprovada.
2. Enviar o conteúdo da pasta do pacote para a raiz do repositório. package.json e .github/ precisam ficar diretamente na raiz, sem uma pasta extra envolvendo tudo. Ao enviar, incluir a pasta oculta .github/. Usar Git ou GitHub Desktop ajuda a preservar as pastas.
3. Em Settings → Pages → Build and deployment → Source, selecionar GitHub Actions.
4. Em Actions, abrir “Publicar previa no GitHub Pages”, selecionar a branch main e clicar em Run workflow. Essa é a etapa que publica o site.
5. Aguardar a conclusão e abrir o endereço informado pela execução. Conferir capa, galeria, botão Get in Touch e versão de celular.

O fluxo é manual: enviar alterações ao repositório não publica uma nova versão automaticamente. Para atualizar o site, executar novamente Run workflow após revisar as alterações.

## Ajustes feitos

- vite.config.ts usa PAGES_BASE_PATH, com / como padrão para uso local.
- O fluxo define PAGES_BASE_PATH com o nome do repositório, por exemplo /elias-painting-preview/.
- Imagens geradas, srcSet, galeria, imagens ampliadas e links sem JavaScript respeitam esse caminho.
- A compilação no GitHub usa npm ci, npm test e npm run build com Node 24. Somente dist/ é publicada.
- As ações do GitHub estão fixadas por identificador de versão. A permissão de publicação fica somente na etapa de deploy.

O fluxo foi preparado para um repositório de projeto. Não usar o nome Sales-777.github.io: esse tipo de repositório exige base /.

## Abrir e editar no computador

Instalar Node.js 24. Na pasta que contém package.json:

```powershell
npm ci
npm run dev
```

Abrir o endereço local mostrado, normalmente http://127.0.0.1:5173/. Para encerrar, usar Ctrl+C no terminal.

O texto e os dados principais ficam em src/content/site.ts; a página fica em src/App.tsx e os componentes em src/components/. Não editar arquivos gerados em dist/.

Para conferir a versão destinada ao Pages:

```powershell
$env:PAGES_BASE_PATH='/elias-painting-preview/'
npm run build
npm run preview
```

Abrir http://127.0.0.1:4173/elias-painting-preview/. Para voltar à configuração local padrão antes de recompilar, executar Remove-Item Env:PAGES_BASE_PATH.

## Validação realizada

Instalação limpa concluída; compilação completa com base /elias-painting-preview/ aprovada; dois testes da galeria aprovados. Testes no Chrome em 360, 390, 768 e 1440 pixels: sem erros de JavaScript, sem respostas HTTP com erro e sem transbordamento horizontal. Filtros, carregamento progressivo, ampliação, teclado, retorno do foco, menu móvel e página sem JavaScript passaram. A análise automática de acessibilidade não encontrou violações nas verificações executadas; isso não substitui uma auditoria manual completa. Os links das três variantes agrupadas também apontam para arquivos existentes.

GitHub Actions executado com sucesso em 17/10/2026: instalação, testes, build e deploy aprovados. Execução: https://github.com/Sales-777/elias-painting-preview/actions/runs/39062120288.

O pacote para envio contém código, fotografias usadas na compilação, catálogo e configuração. Foram deixados fora os dossiês, referências de inspiração, capturas de testes, caches e dependências instaladas. Os arquivos originais do ZIP e de sources/ foram preservados.

Referências: https://vite.dev/guide/static-deploy.html#github-pages e https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
