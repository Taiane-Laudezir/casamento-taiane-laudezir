# Diagnóstico seguro das variáveis Mercado Pago

Esta versão não exibe valores secretos. O endpoint `/api/health` informa apenas se as variáveis existem no processo Node e lista seus nomes.

Esperado:
- `mercadoPagoConfigured: true`
- `legacyConfigured: true`
- `testConfigured: true`
- `prodConfigured: true`
- `mpEnvironmentKeys` contendo as quatro chaves `MP_...`

Commit sugerido: `Diagnostica variaveis Mercado Pago`
