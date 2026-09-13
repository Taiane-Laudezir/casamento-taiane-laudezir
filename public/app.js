const gifts = [
  {id:"cafe-manha",name:"Café da manhã dos recém-casados",text:"Um delicioso começo para os nossos dias juntos.",value:50},
  {id:"drinks",name:"Drinks na lua de mel",text:"Para brindarmos cada momento especial.",value:80},
  {id:"sobremesa",name:"Sobremesa especial",text:"Porque a vida fica mais doce a dois.",value:100},
  {id:"brinde",name:"Um brinde aos recém-casados",text:"Para celebrarmos nossa nova fase.",value:120},
  {id:"jantar-romantico",name:"Jantar romântico",text:"Uma noite especial para lembrarmos sempre.",value:150},
  {id:"malas",name:"Ajuda com as malas",text:"Para levarmos nossos sonhos ainda mais longe.",value:180},
  {id:"passeio-turistico",name:"Passeio turístico",text:"Para conhecermos novos lugares.",value:200},
  {id:"dia-praia",name:"Dia especial na praia",text:"Sol, mar e momentos inesquecíveis.",value:250},
  {id:"jantar-vinho",name:"Jantar especial com vinho",text:"Sabores que tornam a vida mais especial.",value:300},
  {id:"transfer",name:"Transfer dos recém-casados",text:"Para nos levar com mais conforto.",value:350},
  {id:"diaria",name:"Uma diária da lua de mel",text:"Mais uma noite para vivermos esse sonho.",value:400},
  {id:"relax",name:"Momento relax para o casal",text:"Para renovarmos as energias juntos.",value:450},
  {id:"upgrade",name:"Upgrade da hospedagem",text:"Para tornarmos nossa estadia ainda mais especial.",value:500},
  {id:"barco",name:"Passeio especial de barco",text:"Uma experiência única no mar.",value:600},
  {id:"passagens",name:"Ajuda com as passagens",text:"Para chegarmos mais longe juntos.",value:700},
  {id:"experiencia-romantica",name:"Experiência romântica",text:"Para colecionarmos grandes lembranças.",value:800},
  {id:"experiencia-inesquecivel",name:"Experiência inesquecível",text:"Porque os melhores momentos ficam para sempre.",value:1000},
  {id:"lua-de-mel",name:"Ajuda com a lua de mel",text:"Para realizarmos ainda mais sonhos.",value:1200},
  {id:"superpresente",name:"Superpresente dos recém-casados",text:"Para vivermos uma grande aventura juntos.",value:1500}
];

let selectedGift = null;

const grid = document.getElementById("giftGrid");
const modal = document.getElementById("paymentModal");
const nameEl = document.getElementById("selectedGiftName");
const valueEl = document.getElementById("selectedGiftValue");
const container = document.getElementById("paymentBrick_container");
const money = value => Number(value).toLocaleString("pt-BR", {style:"currency",currency:"BRL"});

gifts.forEach((g, i) => {
  const card = document.createElement("article");
  card.className = "gift-card";
  card.dataset.value = g.value;
  card.innerHTML = `
    <div class="gift-photo">
      <img src="assets/gift-${String(i + 1).padStart(2, "0")}.jpg" alt="${g.name}">
    </div>
    <div class="gift-body">
      <h3>${i + 1}. ${g.name}</h3>
      <p>${g.text}</p>
      <strong>${money(g.value)}</strong>
      <button class="btn gift-btn">Presentear</button>
    </div>`;
  card.querySelector("button").addEventListener("click", () => openPayment(g));
  grid.appendChild(card);
});

const custom = document.createElement("article");
custom.className = "gift-card custom-card";
custom.dataset.value = "custom";
custom.innerHTML = `
  <div class="gift-photo"><img src="assets/gift-20.jpg" alt="Presente livre"></div>
  <div class="gift-body">
    <h3>20. Presente livre</h3>
    <p>Você escolhe o valor e nos ajuda a escrever os próximos capítulos.</p>
    <input class="custom-input" id="customValue" type="number" min="10" max="10000" step="10" placeholder="Digite o valor">
    <button class="btn" id="customGiftBtn">Escolher valor</button>
  </div>`;
grid.appendChild(custom);

custom.querySelector("button").addEventListener("click", () => {
  const value = Number(document.getElementById("customValue").value);
  if (!value || value < 10) return alert("Digite um valor de pelo menos R$ 10,00.");
  if (value > 10000) return alert("O valor máximo é R$ 10.000,00.");
  openPayment({ id:"custom", name:"Presente livre", value });
});

const menuBtn = document.querySelector(".menu-btn");
const mainNav = document.querySelector(".nav-links");

if (menuBtn && mainNav) {
  menuBtn.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  });

  document.querySelectorAll(".nav-links a").forEach(a => a.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }));

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      mainNav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    }
  });
}

document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const f = btn.dataset.filter;

  document.querySelectorAll(".gift-card").forEach(card => {
    if (card.dataset.value === "custom") {
      card.classList.remove("hidden-card");
      return;
    }
    const v = Number(card.dataset.value);
    const show =
      f === "all" ||
      (f === "150" && v <= 150) ||
      (f === "300" && v > 150 && v <= 300) ||
      (f === "500" && v > 300 && v <= 500) ||
      (f === "501" && v > 500);
    card.classList.toggle("hidden-card", !show);
  });
}));

document.getElementById("closeModal").addEventListener("click", closePayment);
modal.addEventListener("click", e => {
  if (e.target === modal) closePayment();
});

function openPayment(gift) {
  selectedGift = gift;
  nameEl.textContent = gift.name;
  valueEl.textContent = money(gift.value);
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  renderCheckoutPro();
}

function closePayment() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

function renderCheckoutPro() {
  container.innerHTML = `
    <div class="checkout-pro-box">
      <strong>Pagamento seguro pelo Mercado Pago</strong>
      <p>Ao continuar, você será direcionado ao ambiente seguro do Mercado Pago para escolher a forma de pagamento.</p>
      <button class="btn checkout-pro-btn" id="startCheckoutBtn">Ir para o Mercado Pago</button>
      <small>Ambiente de teste nesta etapa da integração.</small>
    </div>`;

  document.getElementById("startCheckoutBtn").addEventListener("click", startCheckout);
}

async function startCheckout() {
  if (!selectedGift) return;

  const button = document.getElementById("startCheckoutBtn");
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Preparando checkout...";

  try {
    const response = await fetch("/api/checkout/order", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        giftId: selectedGift.id,
        customAmount: selectedGift.id === "custom" ? selectedGift.value : undefined
      })
    });

    const result = await response.json();

    if (!response.ok) {
      const extra = result.details ? `\n${result.details}` : "";
      throw new Error((result.message || "Não foi possível iniciar o pagamento.") + extra);
    }

    if (!result.checkoutUrl) {
      throw new Error("O Mercado Pago não retornou o link do checkout.");
    }

    window.location.href = result.checkoutUrl;
  } catch (error) {
    console.error(error);
    alert(error.message);
    button.disabled = false;
    button.textContent = originalText;
  }
}

function showPaymentReturnMessage() {
  const params = new URLSearchParams(window.location.search);
  const result = params.get("payment_result");
  if (!result) return;

  const messages = {
    success: {
      title: "Obrigado pelo presente!",
      text: "O Mercado Pago informou que o pagamento foi concluído. Na próxima etapa ativaremos também a confirmação automática por Webhook."
    },
    pending: {
      title: "Pagamento pendente",
      text: "O Mercado Pago ainda está processando o pagamento."
    },
    failure: {
      title: "Pagamento não concluído",
      text: "O pagamento não foi concluído. Você pode tentar novamente quando quiser."
    }
  };

  const message = messages[result] || messages.pending;
  const toast = document.createElement("div");
  toast.className = `payment-return payment-return-${result}`;
  toast.innerHTML = `
    <button type="button" class="payment-return-close" aria-label="Fechar">×</button>
    <strong>${message.title}</strong>
    <span>${message.text}</span>`;
  document.body.appendChild(toast);

  toast.querySelector("button").addEventListener("click", () => toast.remove());

  setTimeout(() => {
    document.getElementById("presentes")?.scrollIntoView({behavior:"smooth", block:"start"});
  }, 250);

  // Remove o marcador da URL sem recarregar a página.
  params.delete("payment_result");
  const query = params.toString();
  history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}`);
}

window.addEventListener("load", showPaymentReturnMessage);

// V9: em um novo acesso, iniciar sempre no topo/capa.
window.addEventListener("load", () => {
  const entry = performance.getEntriesByType("navigation")[0];
  const navType = entry ? entry.type : "navigate";

  const returningFromPayment = new URLSearchParams(window.location.search).has("payment_result");

  if (navType === "navigate" && !returningFromPayment) {
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }
});


// V10: navegação interna com posicionamento exato da seção.
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", event => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;

    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();

    // Fecha o menu mobile antes de calcular a posição final.
    if (typeof mainNav !== "undefined" && mainNav) {
      mainNav.classList.remove("open");
    }
    if (typeof menuBtn !== "undefined" && menuBtn) {
      menuBtn.setAttribute("aria-expanded", "false");
    }
    document.body.classList.remove("menu-open");

    const top = target.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top,
      left: 0,
      behavior: "smooth"
    });

    // Atualiza a URL sem provocar um segundo salto de rolagem.
    history.replaceState(null, "", hash);
  });
});


// V16 — botão fixo de retorno ao topo no mobile
(() => {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  const updateBackToTop = () => {
    btn.classList.toggle("show", window.scrollY > Math.max(320, window.innerHeight * 0.55));
  };

  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();

  btn.addEventListener("click", () => {
    const menu = document.querySelector(".mobile-menu");
    const menuBtn = document.querySelector(".menu-btn");
    if (menu) menu.classList.remove("open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");

    window.scrollTo({ top: 0, behavior: "smooth" });
    if (history.replaceState) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  });
})();
