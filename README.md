# Casamento T&L — v22.0.0 — mensagens por e-mail

Esta versão parte da **v21.0.1 estável** e preserva a integração de produção do Mercado Pago, incluindo a compatibilidade de assinatura do Webhook Orders (`original` / `lowercase`).

## O que foi adicionado

Antes de escolher Pix ou cartão, o convidado preenche obrigatoriamente:
- nome;
- e-mail;
- mensagem para Taiane e Laudezir.

### Cartão de crédito
O checkout do Mercado Pago continua usando a mesma Orders API. Após o retorno de pagamento aprovado, o servidor consulta a Order diretamente no Mercado Pago, confirma `processed / accredited`, confere Order, referência e valor, e só então envia a mensagem por e-mail.

### Pix direto
O Pix continua sendo o Pix direto já existente, sem passar pelo Mercado Pago. Como esse Pix não possui confirmação automática no site, após pagar o convidado toca em **“Já fiz o Pix — enviar minha mensagem”** para enviar a mensagem aos noivos.

## Envio de e-mail

A versão usa a API do Resend pelo backend. O e-mail recebido pelos noivos contém:
- nome do convidado;
- e-mail do convidado;
- presente e valor;
- forma de pagamento;
- mensagem.

O e-mail do convidado é configurado como `Reply-To`, permitindo responder diretamente a ele.

## Variáveis do Render

Manter as existentes:
- `MP_ACCESS_TOKEN`
- `MP_WEBHOOK_SECRET`

Adicionar:
- `RESEND_API_KEY`
- `GIFT_EMAIL_TO`

Opcionais:
- `GIFT_EMAIL_FROM` — remetente de um domínio verificado no Resend. Se ausente, usa `Taiane & Laudezir <onboarding@resend.dev>`.
- `GIFT_MESSAGE_SECRET` — segredo exclusivo para assinar dados da mensagem. Se ausente, usa `MP_WEBHOOK_SECRET` como fallback.

Depois de configurar, `/api/health` deve mostrar:
- `mercadoPagoConfigured: true`
- `webhookConfigured: true`
- `giftEmailConfigured: true`

## Observação importante

A lógica já validada do Mercado Pago/Webhook não foi removida nem substituída. A funcionalidade de mensagem foi adicionada ao redor do fluxo existente.
