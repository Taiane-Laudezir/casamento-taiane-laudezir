# Casamento T&L — Webhook via SDK oficial Mercado Pago

Esta versão substitui a validação HMAC manual pelo `WebhookSignatureValidator`
do SDK oficial `mercadopago` (v3.6.1).

## Por que esta versão

O simulador de Webhook retornava 200, mas notificações reais de Orders de teste
eram rejeitadas como `Assinatura inválida`.

A validação agora usa diretamente a implementação oficial do Mercado Pago:

- `x-signature`
- `x-request-id`
- `data.id`
- `MP_WEBHOOK_SECRET`

O SDK atual preserva corretamente o `data.id` de Orders no manifesto de assinatura.

## Ambiente de teste

Enquanto `MP_ACCESS_TOKEN` for a credencial de teste:

- mantenha a URL configurada em **Modo de teste**;
- não é necessário preencher a URL de produção agora;
- mantenha `Order (Mercado Pago)` marcado no Modo de teste;
- `MP_WEBHOOK_SECRET` deve ser a assinatura secreta exibida no Modo de teste.

## Render

Mantenha estas variáveis:

- `MP_ACCESS_TOKEN`
- `MP_WEBHOOK_SECRET`

Não exponha os valores em prints ou no GitHub.

## Teste

Após deploy:

1. Simule `Order (Mercado Pago)` com Data ID `123456`.
2. Confirme `200 - OK`.
3. Faça uma compra real de teste com o comprador `Test`.
4. Nos logs, o esperado é:
   - `Webhook Mercado Pago autenticado`
   - `Order Mercado Pago confirmada`

Commit sugerido:

`Usa SDK oficial no webhook Mercado Pago`
