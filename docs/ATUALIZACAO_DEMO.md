# Atualização da demonstração após auditoria

Preparação de 17/10/2026 para o repositório existente `Sales-777/elias-painting-preview`. O envio e a publicação dependem de confirmação expressa do usuário; este documento descreve o conteúdo preparado, não comprova uma publicação concluída.

## Conteúdo da atualização

- Barreira de erro exclusiva do visualizador da galeria. Se o módulo falhar, a homepage permanece montada; a alternativa mantém a foto, permite fechar/Escape, abrir a imagem diretamente e recarregar a página. O foco fica contido e retorna à miniatura.
- Quatro links usam nomes derivados de seus textos visíveis. O diagrama também liga seus nomes acessíveis aos rótulos e números visíveis, sem mudar geometria, cores ou animação.
- Aviso “Independent design preview. Not the official website.” junto ao título da capa. Título e descrição do documento indicam a demonstração; `noindex, nofollow` preservado.
- Favicon aponta para o logo original existente, sem alterar seus pixels.
- Caminho `/elias-painting-preview/` mantido em Vite, índice da galeria, imagens responsivas, variantes, favicon e links estáticos sem JavaScript.
- Testes gerais incluem WCAG 2.1 A e há regressão específica dos problemas da auditoria, do estado de erro e de todas as categorias.
- O fluxo de Pages existente mantém suas ações fixadas e permissões e passa a aceitar também `push` em `main`. O disparo manual permanece. Essa mudança integra o resumo sujeito à aprovação; depois de aprovada, envios futuros à `main` também publicarão após build bem-sucedido.

## Preservação e exclusões

A atualização parte do histórico existente, sem força ou substituição do repositório. Não cria outro repositório, CNAME, domínio ou backend. Fotografias, cópias dos logos, catálogo, contato e textos comerciais não são substituídos. Os dados continuam condicionais, como na demonstração anterior.

Somente código, configuração e esta documentação pública são propostos para o commit. Ficam fora do envio: ZIPs, dossiês, referências de inspiração, relatórios locais, capturas, perfis de navegador, dependências instaladas, caches, estado do servidor local e credenciais. O site recebe apenas `dist/` pelo fluxo de Pages; os originais já presentes no repositório continuam parte do histórico público.

## Verificação reproduzível

Com Node 24 e Chrome instalado:

```powershell
npm ci
$env:PAGES_BASE_PATH='/elias-painting-preview/'
npm test
npm run build
node scripts/check-pages.mjs
```

Os testes verificam a galeria em 76 grupos, filtros All/Residential/Commercial/Epoxy/Other, acesso às versões agrupadas, carregamento tardio, foto integral de Power Washing, menu, foco, teclado, HTML sem JavaScript, nomes acessíveis, aviso, `noindex`, mídia e simulação da falha de `Lightbox-*.js`. `test:demo` repete a regressão nas larguras 320, 360, 390, 768, 1024, 1440 e 1920 px.

## Confirmações humanas ainda necessárias

Consentimento para divulgar fotos e marcas, autoria/atribuição dos trabalhos, vigência e atendimento do WhatsApp e validação do processo real de epóxi continuam pendentes. Abertura do link de contato não comprova recebimento ou resposta. Não são inventados endereço, avaliações, licenças, garantias ou canais de contato.

A demonstração não é o site oficial. Não retirar `noindex` sem uma decisão posterior. Publicar esta demonstração não autoriza migração nem alteração do domínio comercial.
