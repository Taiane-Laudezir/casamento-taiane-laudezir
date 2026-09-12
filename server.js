require("dotenv").config();
const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const gifts = {
  "cafe-manha": { name: "Café da manhã dos recém-casados", value: 50 },
  "drinks": { name: "Drinks na lua de mel", value: 80 },
  "sobremesa": { name: "Sobremesa especial", value: 100 },
  "brinde": { name: "Um brinde aos recém-casados", value: 120 },
  "jantar-romantico": { name: "Jantar romântico", value: 150 },
  "malas": { name: "Ajuda com as malas", value: 180 },
  "passeio-turistico": { name: "Passeio turístico", value: 200 },
  "dia-praia": { name: "Dia especial na praia", value: 250 },
  "jantar-vinho": { name: "Jantar especial com vinho", value: 300 },
  "transfer": { name: "Transfer dos recém-casados", value: 350 },
  "diaria": { name: "Uma diária da lua de mel", value: 400 },
  "relax": { name: "Momento relax para o casal", value: 450 },
  "upgrade": { name: "Upgrade da hospedagem", value: 500 },
  "barco": { name: "Passeio especial de barco", value: 600 },
  "passagens": { name: "Ajuda com as passagens", value: 700 },
  "experiencia-romantica": { name: "Experiência romântica", value: 800 },
  "experiencia-inesquecivel": { name: "Experiência inesquecível", value: 1000 },
  "lua-de-mel": { name: "Ajuda com a lua de mel", value: 1200 },
  "superpresente": { name: "Superpresente dos recém-casados", value: 1500 }
};

app.get("/api/config", (req, res) => {
  const key = process.env.MP_PUBLIC_KEY || "";
  res.json({
    mercadoPagoConfigured: Boolean(key && key !== "SUA_PUBLIC_KEY_AQUI"),
    publicKey: key && key !== "SUA_PUBLIC_KEY_AQUI" ? key : null
  });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, version: "3.0.0" });
});

app.post("/api/payments", async (req, res) => {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken || accessToken === "SEU_ACCESS_TOKEN_AQUI") {
      return res.status(503).json({
        message: "Mercado Pago ainda não configurado no servidor."
      });
    }

    const { giftId, customAmount, formData } = req.body || {};
    if (!formData) {
      return res.status(400).json({ message: "Dados do pagamento incompletos." });
    }

    let gift;
    let amount;

    if (giftId === "custom") {
      amount = Number(customAmount);
      if (!Number.isFinite(amount) || amount < 10 || amount > 10000) {
        return res.status(400).json({ message: "Valor livre inválido." });
      }
      gift = { name: "Presente livre", value: amount };
    } else {
      gift = gifts[giftId];
      if (!gift) {
        return res.status(400).json({ message: "Presente não encontrado." });
      }
      amount = gift.value;
    }

    // Mantemos o preço no servidor: o navegador não decide o valor dos presentes fixos.
    const payload = {
      ...formData,
      transaction_amount: amount,
      description: `Presente de casamento - ${gift.name}`,
      external_reference: `CASAMENTO-${giftId}-${Date.now()}`,
      metadata: {
        wedding: "Taiane e Laudezir",
        gift_id: giftId,
        gift_name: gift.name
      }
    };

    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID()
      },
      body: JSON.stringify(payload)
    });

    const result = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Mercado Pago:", result);
      return res.status(mpResponse.status).json({
        message: "Não foi possível concluir o pagamento.",
        details: result
      });
    }

    res.json({
      id: result.id,
      status: result.status,
      statusDetail: result.status_detail,
      paymentMethodId: result.payment_method_id,
      paymentTypeId: result.payment_type_id,
      pointOfInteraction: result.point_of_interaction || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno ao processar o pagamento." });
  }
});

// Endpoint preparado para futura confirmação automática via webhook.
// Antes de usar em produção, configurar a URL de notificações no painel do Mercado Pago
// e implementar a validação/consulta do pagamento pelo ID recebido.
app.post("/api/webhooks/mercadopago", (req, res) => {
  console.log("Webhook recebido:", req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Site: http://localhost:${PORT}`);
});
