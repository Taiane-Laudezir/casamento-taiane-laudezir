# Casamento T&L — compatibilidade de assinatura Webhook Orders

Esta versão mantém a configuração limpa de produção e altera somente a validação
da assinatura do Webhook.

Para `data.id` alfanumérico, o servidor tenta validar com:
1. o ID exatamente como recebido;
2. se necessário, o mesmo ID em minúsculas.

Nos dois casos a validação continua criptográfica com `MP_WEBHOOK_SECRET`
usando o SDK oficial do Mercado Pago. Não existe bypass de assinatura.

O log mostrará apenas:
- `signatureDataIdMode: 'original'`
ou
- `signatureDataIdMode: 'lowercase'`

Variáveis esperadas:
- `MP_ACCESS_TOKEN`
- `MP_WEBHOOK_SECRET`

Commit sugerido:
`Compatibiliza assinatura webhook Orders`
