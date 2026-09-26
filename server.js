require("dotenv").config();
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const QRCode = require("qrcode");
const {
  WebhookSignatureValidator,
  InvalidWebhookSignatureError
} = require("mercadopago");

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


function normalizeGuest(raw) {
  const name = String(raw?.name || "").trim().replace(/\s+/g, " ");
  const email = String(raw?.email || "").trim().toLowerCase();
  const message = String(raw?.message || "").trim();

  if (name.length < 2 || name.length > 80) {
    return { error: "Informe seu nome." };
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 160;
  if (!emailOk) {
    return { error: "Informe um e-mail válido." };
  }

  if (message.length < 2 || message.length > 1200) {
    return { error: "Escreva uma mensagem de até 1.200 caracteres." };
  }

  return { guest: { name, email, message } };
}

function getMessageSigningSecret() {
  return String(process.env.GIFT_MESSAGE_SECRET || process.env.MP_WEBHOOK_SECRET || "").trim();
}

function createMessageToken(payload) {
  const secret = getMessageSigningSecret();
  if (!secret) throw new Error("Segredo de assinatura da mensagem não configurado.");

  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function readMessageToken(token) {
  const secret = getMessageSigningSecret();
  if (!secret) throw new Error("Segredo de assinatura da mensagem não configurado.");

  const [body, signature] = String(token || "").split(".");
  if (!body || !signature) throw new Error("Token de mensagem inválido.");

  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("Token de mensagem inválido.");
  }

  const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (!parsed || typeof parsed !== "object") throw new Error("Token de mensagem inválido.");
  if (!parsed.createdAt || Date.now() - Number(parsed.createdAt) > 1000 * 60 * 60 * 24 * 7) {
    throw new Error("A mensagem expirou. Inicie o presente novamente.");
  }
  return parsed;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendGiftMessageEmail({ guest, giftName, amount, paymentMethod, paymentStatus, idempotencyKey }) {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const emailTo = String(process.env.GIFT_EMAIL_TO || "").trim();
  const emailFrom = String(process.env.GIFT_EMAIL_FROM || "Taiane & Laudezir <onboarding@resend.dev>").trim();

  if (!apiKey || !emailTo) {
    const error = new Error("Envio de e-mail ainda não configurado.");
    error.status = 503;
    throw error;
  }

  const subject = `💚 Presente de ${guest.name} — ${giftName}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#2d3028;line-height:1.6">
      <div style="border:1px solid #e8decd;border-radius:18px;overflow:hidden;background:#fff">
        <div style="background:#596545;color:#fff;padding:24px 28px">
          <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:.85">Casamento Taiane & Laudezir</div>
          <h1 style="font-family:Georgia,serif;font-size:28px;margin:8px 0 0">Vocês receberam uma mensagem 💚</h1>
        </div>
        <div style="padding:28px">
          <p style="margin-top:0"><strong>De:</strong> ${escapeHtml(guest.name)}</p>
          <p><strong>E-mail:</strong> ${escapeHtml(guest.email)}</p>
          <p><strong>Presente:</strong> ${escapeHtml(giftName)}</p>
          <p><strong>Valor:</strong> ${Number(amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          <p><strong>Pagamento:</strong> ${escapeHtml(paymentMethod)}${paymentStatus ? ` — ${escapeHtml(paymentStatus)}` : ""}</p>
          <div style="margin-top:24px;padding:20px;background:#f7f2e8;border-radius:14px;border-left:4px solid #b99a63">
            <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#596545;margin-bottom:8px">Mensagem para os noivos</div>
            <div style="white-space:pre-wrap;font-family:Georgia,serif;font-size:18px">${escapeHtml(guest.message)}</div>
          </div>
          <p style="font-size:12px;color:#73766d;margin:24px 0 0">Ao responder este e-mail, a resposta será direcionada ao e-mail informado pelo convidado.</p>
        </div>
      </div>
    </div>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": String(idempotencyKey).slice(0, 250)
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [emailTo],
      reply_to: guest.email,
      subject,
      html
    })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result?.message || "Não foi possível enviar o e-mail.");
    error.status = response.status;
    error.details = result;
    throw error;
  }

  return result;
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
    const { giftId, customAmount, guest: guestRaw } = req.body || {};
    const resolved = getGift(giftId, customAmount);
    const guestResolved = normalizeGuest(guestRaw);

    if (resolved.error) {
      return res.status(400).json({ message: resolved.error });
    }
    if (guestResolved.error) {
      return res.status(400).json({ message: guestResolved.error });
    }

    const { gift, amount } = resolved;
    const { guest } = guestResolved;
    const messageToken = createMessageToken({
      type: "pix",
      giftId,
      giftName: gift.name,
      amount,
      guest,
      createdAt: Date.now()
    });
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
      qrDataUrl,
      messageToken
    });
  } catch (error) {
    console.error("Erro ao gerar Pix:", error);
    res.status(500).json({ message: "Não foi possível gerar o Pix." });
  }
});

app.get("/api/health", (req, res) => {
  const token = String(process.env.MP_ACCESS_TOKEN || "").trim();
  const webhookSecret = String(process.env.MP_WEBHOOK_SECRET || "").trim();

  res.json({
    ok: true,
    version: "22.0.0-gift-messages",
    mercadoPagoConfigured: Boolean(token && token !== "SEU_ACCESS_TOKEN_AQUI"),
    webhookConfigured: Boolean(webhookSecret),
    giftEmailConfigured: Boolean(String(process.env.RESEND_API_KEY || "").trim() && String(process.env.GIFT_EMAIL_TO || "").trim())
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

    const { giftId, customAmount, guest: guestRaw } = req.body || {};
    const resolved = getGift(giftId, customAmount);
    const guestResolved = normalizeGuest(guestRaw);

    if (resolved.error) {
      return res.status(400).json({ message: resolved.error });
    }
    if (guestResolved.error) {
      return res.status(400).json({ message: guestResolved.error });
    }

    const { gift, amount } = resolved;
    const { guest } = guestResolved;
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

    const messageToken = createMessageToken({
      type: "card",
      orderId: result.id,
      externalReference: reference,
      giftId,
      giftName: gift.name,
      amount,
      guest,
      createdAt: Date.now()
    });

    return res.status(201).json({
      orderId: result.id,
      status: result.status,
      checkoutUrl: result.checkout_url,
      messageToken
    });
  } catch (error) {
    console.error("Erro ao criar order:", error);
    return res.status(500).json({
      message: "Erro interno ao iniciar o pagamento."
    });
  }
});


app.post("/api/gift-message/pix", async (req, res) => {
  try {
    const data = readMessageToken(req.body?.messageToken);
    if (data.type !== "pix") {
      return res.status(400).json({ message: "Mensagem Pix inválida." });
    }

    await sendGiftMessageEmail({
      guest: data.guest,
      giftName: data.giftName,
      amount: data.amount,
      paymentMethod: "Pix direto",
      paymentStatus: "pagamento informado pelo convidado",
      idempotencyKey: `gift-pix/${crypto.createHash("sha256").update(req.body.messageToken).digest("hex").slice(0, 40)}`
    });

    return res.json({ ok: true, message: "Mensagem enviada aos noivos." });
  } catch (error) {
    console.error("Erro ao enviar mensagem do Pix:", { status: error.status || null, message: error.message });
    return res.status(error.status || 500).json({ message: error.message || "Não foi possível enviar a mensagem." });
  }
});

app.post("/api/gift-message/card", async (req, res) => {
  try {
    const data = readMessageToken(req.body?.messageToken);
    const orderId = String(req.body?.orderId || "");

    if (data.type !== "card" || !orderId || String(data.orderId) !== orderId) {
      return res.status(400).json({ message: "Mensagem do cartão inválida." });
    }

    const order = await fetchMercadoPagoOrder(orderId);
    const returnedId = String(order.id || "");
    const status = String(order.status || "").toLowerCase();
    const statusDetail = String(order.status_detail || "").toLowerCase();
    const externalReference = String(order.external_reference || "");
    const totalAmount = Number(order.total_amount);

    const paid = status === "processed" && statusDetail === "accredited";
    const sameOrder = returnedId.toUpperCase() === orderId.toUpperCase();
    const sameReference = externalReference === String(data.externalReference || "");
    const sameAmount = Number.isFinite(totalAmount) && Math.abs(totalAmount - Number(data.amount)) < 0.01;

    if (!paid || !sameOrder || !sameReference || !sameAmount) {
      return res.status(409).json({
        message: paid ? "Não foi possível relacionar a mensagem ao pagamento." : "O pagamento ainda não está confirmado."
      });
    }

    await sendGiftMessageEmail({
      guest: data.guest,
      giftName: data.giftName,
      amount: data.amount,
      paymentMethod: "Cartão de crédito — Mercado Pago",
      paymentStatus: "pagamento confirmado",
      idempotencyKey: `gift-card/${orderId}`
    });

    return res.json({ ok: true, message: "Mensagem enviada aos noivos." });
  } catch (error) {
    console.error("Erro ao enviar mensagem do cartão:", { status: error.status || null, message: error.message });
    const status = error.status && error.status < 500 ? error.status : 500;
    return res.status(status).json({ message: error.message || "Não foi possível enviar a mensagem." });
  }
});

function validateMercadoPagoWebhook(req) {
  const secret = String(process.env.MP_WEBHOOK_SECRET || "").trim();
  const xSignature = String(req.get("x-signature") || "");
  const xRequestId = String(req.get("x-request-id") || "");
  const queryDataId = String(req.query["data.id"] || "");

  if (!secret) {
    return { ok: false, status: 503, reason: "MP_WEBHOOK_SECRET não configurado." };
  }

  if (!xSignature || !xRequestId || !queryDataId) {
    console.warn("Webhook Mercado Pago sem campos necessários:", {
      hasSignature: Boolean(xSignature),
      hasRequestId: Boolean(xRequestId),
      hasDataId: Boolean(queryDataId)
    });
    return { ok: false, status: 400, reason: "Cabeçalhos ou data.id ausentes." };
  }

  const candidates = [{ mode: "original", dataId: queryDataId }];
  const lowerDataId = queryDataId.toLowerCase();

  if (lowerDataId !== queryDataId) {
    candidates.push({ mode: "lowercase", dataId: lowerDataId });
  }

  let lastSignatureError = null;

  for (const candidate of candidates) {
    try {
      WebhookSignatureValidator.validate({
        xSignature,
        xRequestId,
        dataId: candidate.dataId,
        secret
      });

      return {
        ok: true,
        dataId: queryDataId,
        signatureDataIdMode: candidate.mode
      };
    } catch (error) {
      if (error instanceof InvalidWebhookSignatureError) {
        lastSignatureError = error;
        continue;
      }

      console.error("Erro inesperado ao validar Webhook Mercado Pago:", {
        name: error?.name || null,
        message: error?.message || String(error)
      });
      return { ok: false, status: 500, reason: "Erro ao validar assinatura." };
    }
  }

  console.warn("Webhook Mercado Pago rejeitado:", {
    reason: lastSignatureError?.message || "Assinatura inválida.",
    dataId: queryDataId,
    dataIdModesTried: candidates.map(item => item.mode)
  });

  return { ok: false, status: 401, reason: "Assinatura inválida." };
}

async function fetchMercadoPagoOrder(orderId) {
  const accessToken = String(process.env.MP_ACCESS_TOKEN || "").trim();

  if (!accessToken || accessToken === "SEU_ACCESS_TOKEN_AQUI") {
    throw new Error("MP_ACCESS_TOKEN não configurado.");
  }

  const response = await fetch(
    `https://api.mercadopago.com/v1/orders/${encodeURIComponent(orderId)}`,
    {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      result?.message || result?.error || `Mercado Pago respondeu HTTP ${response.status}`
    );
    error.status = response.status;
    error.details = result;
    throw error;
  }

  return result;
}

// Webhook seguro do Mercado Pago:
// 1) valida x-signature com HMAC-SHA256;
// 2) confirma a Order diretamente na API;
// 3) registra apenas dados essenciais nos logs.
// Não existe banco de dados nesta versão; o objetivo é validar a confirmação automática.
app.post("/api/webhooks/mercadopago", async (req, res) => {
  const validation = validateMercadoPagoWebhook(req);
  const queryDataId = String(req.query["data.id"] || "");
  const bodyDataId = String(req.body?.data?.id || "");
  const orderId = validation.dataId || queryDataId || bodyDataId;

  if (!validation.ok) {
    const accessToken = String(process.env.MP_ACCESS_TOKEN || "").trim();
    const isTestEnvironment = accessToken.startsWith("TEST-");

    // Fallback restrito ao ambiente de teste.
    // Em produção, uma assinatura inválida sempre é rejeitada.
    if (isTestEnvironment && /^ORDTST/i.test(orderId)) {
      try {
        const order = await fetchMercadoPagoOrder(orderId);
        const returnedId = String(order.id || "");

        if (!returnedId || returnedId.toUpperCase() !== orderId.toUpperCase()) {
          return res.sendStatus(401);
        }

        console.log("Order de TESTE confirmada pela API:", {
          id: returnedId,
          status: order.status || null,
          statusDetail: order.status_detail || null,
          externalReference: order.external_reference || null,
          totalAmount: order.total_amount || null
        });

        return res.sendStatus(200);
      } catch (error) {
        console.error("Falha ao confirmar Order de TESTE pela API:", {
          orderId,
          status: error.status || null,
          message: error.message
        });

        if (!error.status || error.status >= 500) return res.sendStatus(503);
        return res.sendStatus(401);
      }
    }

    console.warn("Webhook Mercado Pago rejeitado:", validation.reason);
    return res.sendStatus(validation.status);
  }

  console.log("Webhook Mercado Pago autenticado:", {
    notificationId: req.body?.id || null,
    action: req.body?.action || null,
    type: req.body?.type || null,
    liveMode: req.body?.live_mode ?? null,
    dataId: orderId,
    signatureDataIdMode: validation.signatureDataIdMode || "original"
  });

  // Simulações de conectividade usam Data ID que não representa uma Order real.
  if (!/^ORD/i.test(orderId)) {
    console.log("Webhook de simulação validado com sucesso.");
    return res.sendStatus(200);
  }

  try {
    const order = await fetchMercadoPagoOrder(orderId);

    console.log("Order Mercado Pago confirmada:", {
      id: order.id || orderId,
      status: order.status || null,
      statusDetail: order.status_detail || null,
      externalReference: order.external_reference || null,
      totalAmount: order.total_amount || null
    });

    return res.sendStatus(200);
  } catch (error) {
    console.error("Falha ao consultar Order após Webhook:", {
      orderId,
      status: error.status || null,
      message: error.message
    });

    if (!error.status || error.status >= 500) return res.sendStatus(503);
    return res.sendStatus(200);
  }
});

app.listen(PORT, () => {
  console.log(`Site: http://localhost:${PORT}`);
});
