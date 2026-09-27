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


## v22.0.4 — limpeza final do retorno de pagamento

- Remove `payment_result` da URL assim que o retorno é tratado, evitando que F5 ou um novo Pix reapresentem um aviso antigo.
- Fecha qualquer aviso antigo de cartão quando o convidado inicia um novo presente ou conclui o envio da mensagem via Pix.
- Dados pendentes de cartão passam a expirar em 24 horas em vez de 7 dias.
- Em uma falha real e recente de e-mail no retorno do cartão, o aviso oferece um botão de retry no próprio site, sem depender do parâmetro na URL.
- A lógica de pagamento, webhook e validação do Mercado Pago permanece inalterada.
