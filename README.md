# Casamento T&L — validação de Orders de teste pela API

## O que muda

O SDK oficial continua sendo usado para validar Webhooks normalmente.

Se uma notificação REAL de teste (`ORDTST...`) falhar na assinatura,
o servidor consulta diretamente:

`GET /v1/orders/{id}`

usando `MP_ACCESS_TOKEN` de teste.

A Order só é aceita se a API retornar exatamente o mesmo ID.

## Segurança

- `ORDTST...` → pode ser confirmada pela API do Mercado Pago durante os testes.
- `ORD...` de produção → NÃO possui fallback e continua exigindo assinatura válida.
- Nenhuma chave é exposta nos logs.

## Log esperado

Após nova compra de teste:

`Order de TESTE confirmada pela API`

O status esperado para pagamento aprovado é:

`processed`

com detalhe:

`accredited`

Commit sugerido:

`Valida orders de teste pela API`
