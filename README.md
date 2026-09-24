# Casamento T&L — correção Webhook Orders

Correção baseada no log real `Webhook Mercado Pago rejeitado: Assinatura inválida.`

## Causa
O validador anterior convertia o `data.id` da Order para minúsculas antes de calcular o HMAC.
No simulador isso não aparecia porque o Data ID usado era numérico (`123456`). Em uma notificação real, o ID é alfanumérico e normalmente começa com `ORD...`; mudar a capitalização altera a assinatura.

## Alteração
- preserva exatamente o `data.id` recebido no query param ao validar `x-signature`;
- mantém `MP_WEBHOOK_SECRET` e `MP_ACCESS_TOKEN` como estão;
- não altera Pix, Checkout Pro ou a lista de presentes.

## Teste após deploy
1. Faça uma nova compra com a conta Comprador de teste.
2. Abra Render → Logs.
3. Resultado esperado:
   - `Webhook Mercado Pago autenticado`
   - `Order Mercado Pago confirmada`

Commit sugerido:
`Corrige assinatura do webhook Orders`
