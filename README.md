# Casamento T&L — Mercado Pago Orders FIX

Correção após o Render registrar:

`unsupported_properties / Properties not supported`

## Diagnóstico
O Access Token chegou ao Mercado Pago; a API rejeitou propriedades do corpo da Order.

## O que mudou
- payload da Order simplificado para os campos documentados;
- item agora inclui `unit_measure: "unit"` e `total_amount`;
- removidos temporariamente campos opcionais de captura/descrição/restrição de meios;
- URLs de retorno mantidas;
- log do Render passa a mostrar o JSON completo do erro caso haja nova falha;
- Pix direto permanece inalterado.

## Importante
Nesta versão de validação o Checkout Pro pode mostrar outros meios de pagamento além do cartão.
Primeiro confirmamos que a Order é criada. Depois reativamos as restrições uma a uma.

Commit sugerido:
`Corrige Orders API Mercado Pago`
