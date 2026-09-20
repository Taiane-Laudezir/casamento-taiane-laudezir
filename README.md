# Casamento T&L — Mercado Pago FIX ITEMS

Correção baseada no erro real devolvido pela API:

`$.items[0] - additionalProperties 'unit_measure', 'total_amount' not allowed`

## Alteração
Foram removidos dos itens da Order:
- `unit_measure`
- `total_amount`

O item agora envia somente:
- `title`
- `quantity`
- `unit_price`

O `total_amount` da Order continua sendo enviado normalmente no nível principal.

Pix direto permanece inalterado.

Commit sugerido:
`Corrige itens da Order Mercado Pago`
