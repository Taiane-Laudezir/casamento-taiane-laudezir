# Casamento T&L — V12 Mobile

Correção específica da seção **Nossa Família** no celular.

## Causa encontrada
Uma regra antiga mantinha `.family-photo` com `min-height: 520px` no mobile.
Mesmo com a imagem menor, o contêiner continuava alto e criava o grande espaço vazio abaixo da foto.

## Correção aplicada
- `min-height: 0` no bloco da foto;
- altura automática do contêiner;
- imagem com altura automática;
- alinhamento do bloco no início da seção;
- desktop e demais seções permanecem inalterados.

## Atualização
Substitua os arquivos pela V12, faça Commit + Push no GitHub Desktop.
O Render fará o redeploy automaticamente.
