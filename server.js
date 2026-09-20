require("dotenv").config();
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const QRCode = require("qrcode");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DEFAULT_BASE_URL = "https://casamento-taiane-laudezir.onrender.com";

app.set("trust proxy", 1);
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

function getBaseUrl(req) {
  const configured = String(process.env.BASE_URL || "").trim().replace(/\/+$/, "");
  if (configured) return configured;

  const host = req.get("host");
  if (host && !host.includes("localhost") && !host.startsWith("127.")) {
    return `https://${host}`;
  }
  return DEFAULT_BASE_URL;
}

function getGift(giftId, customAmount) {
  if (giftId === "custom") {
    const amount = Number(customAmount);
    if (!Number.isFinite(amount) || amount < 10 || amount > 10000) {
      return { error: "O valor livre deve estar entre R$ 10,00 e R$ 10.000,00." };
    }
    return {
      gift: { name: "Presente livre", value: Math.round(amount * 100) / 100 },
      amount: Math.round(amount * 100) / 100
    };
  }

  const gift = gifts[giftId];
  if (!gift) return { error: "Presente não encontrado." };
  return { gift, amount: gift.value };
}


// PIX DIRETO — dados públicos necessários para gerar o BR Code.
// A chave Pix é exibida no site conforme solicitado.
const PIX_KEY = "58c24f5c-0aa8-4bc6-8851-c641b0952280";
const PIX_HOLDER = "TAIANE IZABELE DE SOUSA";
const PIX_CITY = "SAO JOSE PINHAIS";

function pixTlv(id, value) {
  const text = String(value);
  return `${id}${String(text.length).padStart(2, "0")}${text}`;
}

function pixCrc16(payload) {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function buildPixPayload(amount) {
  const merchantAccount =
    pixTlv("00", "BR.GOV.BCB.PIX") +
    pixTlv("01", PIX_KEY);

  const additionalData = pixTlv("05", "***");

  let payload =
    pixTlv("00", "01") +
    pixTlv("01", "11") +
    pixTlv("26", merchantAccount) +
    pixTlv("52", "0000") +
    pixTlv("53", "986");

  if (Number.isFinite(amount) && amount > 0) {
    payload += pixTlv("54", amount.toFixed(2));
  }

  payload +=
    pixTlv("58", "BR") +
    pixTlv("59", PIX_HOLDER.slice(0, 25)) +
    pixTlv("60", PIX_CITY.slice(0, 15)) +
    pixTlv("62", additionalData);

  payload += "6304";
  return payload + pixCrc16(payload);
}

app.post("/api/pix", async (req, res) => {
  try {
    const { giftId, customAmount } = req.body || {};
    const resolved = getGift(giftId, customAmount);

    if (resolved.error) {
      return res.status(400).json({ message: resolved.error });
    }

    const { gift, amount } = resolved;
    const payload = buildPixPayload(amount);
    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 420
    });

    res.json({
      giftName: gift.name,
      amount,
      pixKey: PIX_KEY,
      pixCopyPaste: payload,
      qrDataUrl
    });
  } catch (error) {
    console.error("Erro ao gerar Pix:", error);
    res.status(500).json({ message: "Não foi possível gerar o Pix." });
  }
});

app.get("/api/health", (req, res) => {
  const token = String(process.env.MP_ACCESS_TOKEN || "");
  res.json({
    ok: true,
    version: "19.0.0-mp-test",
    mercadoPagoConfigured: Boolean(token && token !== "SEU_ACCESS_TOKEN_AQUI")
  });
});

app.post("/api/checkout/order", async (req, res) => {
  try {
    const accessToken = String(process.env.MP_ACCESS_TOKEN || "").trim();

    if (!accessToken || accessToken === "SEU_ACCESS_TOKEN_AQUI") {
      return res.status(503).json({
        message: "A credencial do Mercado Pago ainda não está configurada no servidor."
      });
    }

    const { giftId, customAmount } = req.body || {};
    const resolved = getGift(giftId, customAmount);

    if (resolved.error) {
      return res.status(400).json({ message: resolved.error });
    }

    const { gift, amount } = resolved;
    const amountText = amount.toFixed(2);
    const baseUrl = getBaseUrl(req);
    const reference = `TL-${giftId}-${Date.now()}`.slice(0, 64);

    const payload = {
      type: "online",
      processing_mode: "manual",
      total_amount: amountText,
      external_reference: reference,
      items: [
        {
          title: gift.name,
          quantity: 1,
          unit_price: amountText
        }
      ],
      config: {
        online: {
          success_url: `${baseUrl}/?payment_result=success`,
          failure_url: `${baseUrl}/?payment_result=failure`,
          pending_url: `${baseUrl}/?payment_result=pending`,
          auto_return: "approved"
        }
      }
    };

    const mpResponse = await fetch("https://api.mercadopago.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID()
      },
      body: JSON.stringify(payload)
    });

    const result = await mpResponse.json().catch(() => ({}));

    if (!mpResponse.ok) {
      console.error("Mercado Pago Orders API:", JSON.stringify(result, null, 2));
      return res.status(mpResponse.status).json({
        message: "O Mercado Pago não conseguiu criar o checkout.",
        code: result.code || result.error || null,
        details: result.message || result.error || "Verifique a credencial e tente novamente."
      });
    }

    if (!result.checkout_url) {
      console.error("Order criada sem checkout_url:", result);
      return res.status(502).json({
        message: "A ordem foi criada, mas o Mercado Pago não retornou o endereço do checkout."
      });
    }

    return res.status(201).json({
      orderId: result.id,
      status: result.status,
      checkoutUrl: result.checkout_url
    });
  } catch (error) {
    console.error("Erro ao criar order:", error);
    return res.status(500).json({
      message: "Erro interno ao iniciar o pagamento."
    });
  }
});

// Endpoint reservado para a próxima etapa: confirmação automática por Webhook.
// Nesta versão de TESTE ele apenas confirma o recebimento.
app.post("/api/webhooks/mercadopago", (req, res) => {
  console.log("Webhook Mercado Pago recebido:", {
    query: req.query,
    body: req.body
  });
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Site: http://localhost:${PORT}`);
});
