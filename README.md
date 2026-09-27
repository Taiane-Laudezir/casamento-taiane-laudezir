# Casamento T&L — v22.0.2 — retry de mensagem por busca da Order

Esta versão parte da v22.0.1 e mantém a integração de produção do Mercado Pago intacta.

## Correção

No reenvio tardio da mensagem por e-mail, se `GET /v1/orders/{id}` responder 404, o servidor usa o endpoint oficial de busca de Orders e localiza a compra pela `external_reference` assinada no token da mensagem.

Depois disso, continua exigindo:
- `status: processed`;
- `status_detail: accredited`;
- mesma `external_reference`;
- mesmo valor do presente.

Só após essas validações o e-mail é enviado pelo Resend.

As variáveis do Render permanecem as mesmas:
- `MP_ACCESS_TOKEN`
- `MP_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `GIFT_EMAIL_TO`

Não é necessário fazer outro pagamento para testar o retry existente.
