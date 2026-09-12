# Casamento T&L — V15 Estável

Esta versão foi reconstruída a partir da **V13 estável**, sem carregar o
`transform` introduzido na V14.

## Ajustes da V15

- capa mobile reposicionada sem `transform`;
- texto da capa fica mais baixo e à esquerda para liberar o rosto da Taiane;
- altura e fluxo da capa não são alterados;
- navegação por âncoras da V10 preservada;
- menu mobile preservado;
- filtros e botões da lista de presentes preservados;
- seção Nossa Família com correção de espaço da V12 preservada;
- desktop permanece inalterado;
- prévia do WhatsApp usa o **convite oficial enviado pelo casal**.

## Validação automática realizada

- destinos internos: `#inicio`, `#historia`, `#familia`, `#padrinhos`, `#evento`, `#presentes`;
- menu mobile;
- navegação exata por âncoras;
- filtros de presentes;
- botões de presentes.

Observação: o checkout de presentes depende das credenciais do Mercado Pago,
que ainda serão configuradas.

## Atualização

1. Extraia a V15.
2. Substitua o conteúdo da pasta local `casamento-taiane-laudezir`.
3. No GitHub Desktop, confira os arquivos alterados.
4. Commit sugerido: `V15 - estabilização mobile e navegação`.
5. Clique em `Push origin`.
6. Aguarde `Deploy succeeded` no Render.
