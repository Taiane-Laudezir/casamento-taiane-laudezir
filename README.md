# Casamento T&L — versão limpa para produção

Esta versão remove diagnósticos temporários de Webhook e textos de ambiente de teste.

## Variáveis esperadas no Render

Somente estas duas são usadas pelo código:

- `MP_ACCESS_TOKEN`
- `MP_WEBHOOK_SECRET`

Durante a etapa de teste, `MP_ACCESS_TOKEN` pode continuar sendo o token TEST.
Ao entrar em produção, substitua por Access Token de produção e use a assinatura
secreta cadastrada em Webhooks > Modo de produção.

## Webhook

- Validação principal: SDK oficial do Mercado Pago.
- Notificação válida: consulta a Order em `/v1/orders/{id}` para confirmar estado.
- Fallback para assinatura inválida: existe somente quando o Access Token começa
  por `TEST-` e o ID começa por `ORDTST`.
- Em produção, assinatura inválida é sempre rejeitada.

## Endpoint de saúde

`/api/health` informa apenas se Mercado Pago e Webhook estão configurados.
Não lista nomes de variáveis nem expõe valores.

## Textos do site

Foram removidas mensagens de "ambiente de teste" e a mensagem temporária sobre
ativar Webhook futuramente.

Commit sugerido:

`Limpa integracao Mercado Pago para producao`
