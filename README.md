# Casamento T&L — diagnóstico do Webhook TEST/PROD

Esta versão usa o SDK oficial do Mercado Pago e tenta validar a assinatura com:

- `MP_WEBHOOK_SECRET_TEST`
- `MP_WEBHOOK_SECRET_PROD`
- `MP_WEBHOOK_SECRET` (compatibilidade)

Nenhuma chave é exposta nos logs. O servidor mostra somente a origem que validou:
`TEST`, `PROD` ou `LEGACY`.

Após uma compra de teste, procure no Render:

`Webhook Mercado Pago autenticado`

e veja:

`secretSource: 'TEST'`

ou

`secretSource: 'PROD'`

Commit sugerido:

`Diagnostica webhook com chaves test e prod`
