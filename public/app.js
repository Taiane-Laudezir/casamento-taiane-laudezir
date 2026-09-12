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
let brickController = null;
let mpPublicKey = null;

const grid = document.getElementById("giftGrid");
const modal = document.getElementById("paymentModal");
const nameEl = document.getElementById("selectedGiftName");
const valueEl = document.getElementById("selectedGiftValue");
const container = document.getElementById("paymentBrick_container");
const money = value => Number(value).toLocaleString("pt-BR", {style:"currency",currency:"BRL"});

async function loadConfig() {
  try {
    const response = await fetch("/api/config");
    const config = await response.json();
    mpPublicKey = config.publicKey || null;
  } catch (_) {
    mpPublicKey = null;
  }
}
loadConfig();

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

async function openPayment(gift) {
  selectedGift = gift;
  nameEl.textContent = gift.name;
  valueEl.textContent = money(gift.value);
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  await renderMercadoPagoBrick();
}

function closePayment() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
  if (brickController) {
    brickController.unmount();
    brickController = null;
  }
}

function renderSetupMessage() {
  container.innerHTML = `
    <div class="setup-message">
      <strong>Mercado Pago pronto para conectar</strong>
      <span>Para ativar Pix e cartão, configure a Public Key e o Access Token no arquivo <code>.env</code> e abra o site pelo servidor Node.</span>
    </div>`;
}

async function renderMercadoPagoBrick() {
  if (!mpPublicKey) {
    renderSetupMessage();
    return;
  }

  if (typeof MercadoPago === "undefined") {
    container.innerHTML = "<strong>Não foi possível carregar o checkout do Mercado Pago.</strong>";
    return;
  }

  container.innerHTML = "";
  const mp = new MercadoPago(mpPublicKey, { locale: "pt-BR" });
  const builder = mp.bricks();

  brickController = await builder.create("payment", "paymentBrick_container", {
    initialization: {
      amount: selectedGift.value
    },
    customization: {
      paymentMethods: {
        creditCard: "all",
        bankTransfer: "all"
      }
    },
    callbacks: {
      onReady: () => {},
      onSubmit: ({ formData }) => new Promise(async (resolve, reject) => {
        try {
          const response = await fetch("/api/payments", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
              giftId: selectedGift.id,
              customAmount: selectedGift.id === "custom" ? selectedGift.value : undefined,
              formData
            })
          });

          const result = await response.json();
          if (!response.ok) throw new Error(result.message || "Erro ao processar pagamento.");

          const status = result.status || "processando";
          container.innerHTML = `
            <div class="payment-result">
              <div class="result-icon">✓</div>
              <h3>Obrigado pelo presente!</h3>
              <p>Recebemos a solicitação de pagamento.</p>
              <p><strong>Status:</strong> ${status}</p>
              <small>Pagamento nº ${result.id || "-"}</small>
            </div>`;
          resolve();
        } catch (error) {
          alert(error.message);
          reject(error);
        }
      }),
      onError: error => {
        console.error(error);
        container.insertAdjacentHTML("beforeend",
          '<p class="payment-error">Ocorreu um erro ao carregar o pagamento. Tente novamente.</p>');
      }
    }
  });
}


// V9: em um novo acesso, iniciar sempre no topo/capa.
window.addEventListener("load", () => {
  const entry = performance.getEntriesByType("navigation")[0];
  const navType = entry ? entry.type : "navigate";

  if (navType === "navigate") {
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }
});
