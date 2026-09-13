# Casamento T&L — PIX DIRETO + CARTÃO

## Fluxo de pagamento

### PIX
O Pix é exibido dentro do próprio site:
- QR Code;
- chave Pix aleatória;
- botão `Copiar chave`;
- Pix Copia e Cola;
- valor preenchido automaticamente conforme o presente selecionado.

**Atenção:** este Pix aponta para a chave real informada pelo casal. Um pagamento
feito por esse QR Code é uma transferência real, mesmo enquanto o Mercado Pago
ainda está usando credenciais de teste.

### CARTÃO DE CRÉDITO
O botão `Pagar com cartão` cria uma Order no Checkout Pro e redireciona o convidado
ao Mercado Pago.

O Checkout Pro foi configurado para:
- priorizar cartão de crédito;
- excluir Pix (`bank_transfer`);
- excluir boleto (`ticket`);
- excluir cartão de débito (`debit_card`).

A conta Mercado Pago/saldo pode ainda aparecer quando o próprio Mercado Pago não
permite sua exclusão.

## Segurança
- Access Token continua somente no Render;
- valores dos presentes fixos são validados no servidor;
- Orders usam `X-Idempotency-Key`;
- a chave Pix é pública por natureza nesta modalidade e aparece no site.

## Dependência adicionada
`qrcode` para gerar o QR Code Pix no servidor.

## Commit sugerido
`Pix direto e cartao Mercado Pago`
