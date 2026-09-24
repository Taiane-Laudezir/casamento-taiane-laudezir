# Casamento T&L — Webhook seguro Mercado Pago

Esta versão mantém o Pix direto e o Checkout Pro funcionando e acrescenta
validação segura do Webhook do Mercado Pago.

## Nova variável no Render

Crie:

`MP_WEBHOOK_SECRET`

Cole como valor a **chave secreta do Webhook de teste** mostrada em:
Mercado Pago Developers → sua aplicação → Webhooks → Configurar notificações.

Não coloque a chave no código e não a envie por chat.

## O que o servidor faz

1. Recebe a notificação em `/api/webhooks/mercadopago`.
2. Valida `x-signature` usando HMAC-SHA256 e `x-request-id`.
3. Para uma Order real (`ORD...`), consulta `/v1/orders/{id}` usando `MP_ACCESS_TOKEN`.
4. Registra no Render apenas dados essenciais da Order.
5. Responde HTTP 200 quando a notificação é válida.

O simulador do Mercado Pago pode usar um Data ID fictício (`123456`).
Nesse caso a assinatura é validada e o servidor responde 200 sem tentar consultar
uma Order inexistente.

## Teste recomendado

Depois do deploy:
1. Mercado Pago Developers → Webhooks → Simular notificação.
2. Evento: Order (Mercado Pago).
3. Data ID: 123456.
4. Resultado esperado: `200 - OK`.
5. Nos logs do Render deve aparecer:
   - `Webhook Mercado Pago autenticado`
   - `Webhook de simulação validado com sucesso.`

Depois faça uma nova compra com a conta Comprador de teste.
Nos logs deve aparecer:
`Order Mercado Pago confirmada`.

Commit sugerido:
`Ativa validação segura do webhook Mercado Pago`
