# Casamento T&L — V10 Anchor Fix

Correção específica para o problema observado no computador e no celular:
ao clicar nos botões/menu, a página parava antes do início real da seção e
deixava parte da seção/imagem anterior visível.

## O que foi corrigido

- removido o `scroll-margin-top` da V9;
- links internos agora calculam a posição exata da seção;
- menu mobile fecha antes do cálculo da rolagem;
- a URL continua mostrando `#historia`, `#evento`, `#presentes` etc.,
  mas sem provocar um segundo salto;
- funcionamento igual no desktop e no mobile.

## Atualização

Substitua os arquivos locais pelos desta V10, faça Commit + Push no GitHub Desktop.
O Render fará o redeploy automaticamente.
