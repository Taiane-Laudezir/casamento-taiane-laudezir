# Casamento T&L — Mercado Pago TESTE

Primeira versão de integração com pagamento.

## Fluxo implementado

1. O convidado escolhe um presente.
2. O site abre a confirmação do presente.
3. O backend cria uma Order no Mercado Pago.
4. O Mercado Pago devolve `checkout_url`.
5. O convidado é redirecionado para o Checkout Pro.
6. Após o pagamento, retorna ao site com uma mensagem de sucesso, pendência ou falha.

## Segurança

- `MP_ACCESS_TOKEN` permanece exclusivamente no Render.
- O navegador nunca recebe o Access Token.
- O valor dos presentes fixos é validado no servidor.
- Cada Order usa `X-Idempotency-Key`.
- Esta versão usa apenas ambiente de teste.

## Render

A variável já cadastrada deve continuar com o nome:

`MP_ACCESS_TOKEN`

Opcionalmente, cadastre também:

`BASE_URL=https://casamento-taiane-laudezir.onrender.com`

Se `BASE_URL` não existir, o servidor usa automaticamente o endereço público do site.

## Ainda não incluído

O endpoint de Webhook está preparado, mas a validação e confirmação automática
do pagamento serão feitas na próxima etapa, depois de validarmos o Checkout Pro.

## Commit sugerido

`Mercado Pago teste - Checkout Pro Orders`
