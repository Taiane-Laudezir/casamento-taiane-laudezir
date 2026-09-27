# Casamento T&L — v22.0.3 — retry robusto de Order

Esta versão mantém a integração estável do Mercado Pago e o envio por Resend.

Correções no retry de mensagem por cartão:
- primeiro consulta a Order pelo ID original;
- em 404, busca pela `external_reference` assinada;
- a busca usa uma janela maior e não depende do filtro de status;
- se o filtro por `external_reference` retornar vazio, faz uma busca ampla do período e compara a referência no servidor;
- quando a API devolve uma Order recuperada pela referência, valida obrigatoriamente `processed`, `accredited`, mesma referência e mesmo valor antes do envio;
- `package.json` e `/api/health` identificam corretamente a versão 22.0.3.

Não altera as variáveis de ambiente existentes.
