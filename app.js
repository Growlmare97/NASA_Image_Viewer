const API_URL = "https://api.nasa.gov/planetary/apod";
const API_KEY = "MKUgyKuvV4B5CjxAZsNIDVHZIcZacZP1c84QS4kF";
const FAVORITES_KEY = "nasa-favorites";
const SUBSCRIPTION_KEY = "nasa-subscription";
const dateInput = document.getElementById("date-input");
const dedicationInput = document.getElementById("dedication-input");
const searchBtn = document.getElementById("search-btn");
const favoriteBtn = document.getElementById("favorite-btn");
const printBtn = document.getElementById("print-btn");
const emailInput = document.getElementById("email-input");
const subscribeBtn = document.getElementById("subscribe-btn");
const unsubscribeBtn = document.getElementById("unsubscribe-btn");
const testEmailBtn = document.getElementById("test-email-btn");
const subscriptionMeta = document.getElementById("subscription-meta");
const connectionStatus = document.getElementById("connection-status");
const subscriptionCard = document.querySelector(".subscription");
const daysInput = document.getElementById("days-input");
const topicFilter = document.getElementById("topic-filter");
const loadGalleryBtn = document.getElementById("load-gallery-btn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const titleEl = document.getElementById("apod-title");
const dateEl = document.getElementById("apod-date");
const topicPill = document.getElementById("topic-pill");
const dedicationOutput = document.getElementById("dedication-output");
const mediaWrapper = document.getElementById("media-wrapper");
const explanationEl = document.getElementById("apod-explanation");
const galleryGrid = document.getElementById("gallery-grid");
const favouritesGrid = document.getElementById("favourites-grid");
const exploreGrid = document.getElementById("explore-grid");
const randomBtn = document.getElementById("random-btn");
const onThisDayBtn = document.getElementById("on-this-day-btn");
const topicButtons = document.getElementById("topic-buttons");
const whatsappBtn = document.getElementById("whatsapp-btn");

let currentApod = null;
let galleryItems = [];

const today = new Date().toISOString().split("T")[0];
dateInput.max = today;
dateInput.value = today;

function setStatus(message) {
  statusEl.textContent = message;
}

function extractTopic(data) {
  const text = `${data.title || ""} ${data.explanation || ""}`.toLowerCase();
  if (text.includes("moon") || text.includes("lunar")) return "Moon";
  if (text.includes("mars")) return "Mars";
  if (text.includes("earth") || text.includes("aurora")) return "Earth";
  if (text.includes("sun") || text.includes("solar")) return "Sun";
  if (text.includes("galaxy")) return "Galaxy";
  if (text.includes("nebula")) return "Nebula";
  if (text.includes("star") || text.includes("supernova")) return "Stars";
  if (text.includes("comet") || text.includes("asteroid")) return "Comet";
  if (text.includes("black hole") || text.includes("quasar")) return "Black Hole";
  return "Other";
}

function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
}

function saveFavorites(items) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
}

function isFavorite(date) {
  return getFavorites().some((item) => item.date === date);
}

function updateFavoriteButton() {
  if (!currentApod) {
    favoriteBtn.textContent = "☆ Save to Favourites";
    return;
  }
  favoriteBtn.textContent = isFavorite(currentApod.date) ? "★ Remove Favourite" : "☆ Save to Favourites";
}

function renderDedication() {
  const dedication = dedicationInput.value.trim();
  if (!dedication) {
    dedicationOutput.textContent = "";
    dedicationOutput.classList.add("hidden");
    return;
  }
  dedicationOutput.textContent = `Dedication: ${dedication}`;
  dedicationOutput.classList.remove("hidden");
}

function renderMedia(data) {
  mediaWrapper.innerHTML = "";
  if (data.media_type === "image") {
    const img = document.createElement("img");
    img.src = data.url;
    img.alt = data.title;
    img.loading = "lazy";
    mediaWrapper.appendChild(img);
    return;
  }

  if (data.media_type === "video") {
    const frame = document.createElement("iframe");
    frame.src = data.url;
    frame.title = data.title;
    frame.allowFullscreen = true;
    mediaWrapper.appendChild(frame);
    return;
  }

  mediaWrapper.textContent = "Unsupported media type.";
}

function renderCard(item, target, withOpenButton = true) {
  const card = document.createElement("article");
  card.className = "gallery-card";
  const topic = item.topic || extractTopic(item);
  const thumb = item.media_type === "image" ? item.url : (item.thumbnail_url || "");
  card.innerHTML = `
    ${thumb ? `<img src="${thumb}" alt="${item.title}" loading="lazy" />` : ""}
    <h3>${item.title}</h3>
    <p class="meta">${item.date} • ${topic}</p>
    ${withOpenButton ? `<button type="button" class="open-btn" data-date="${item.date}">Open</button>` : ""}
  `;
  target.appendChild(card);
}

function renderFavourites() {
  favouritesGrid.innerHTML = "";
  const favorites = getFavorites();
  if (!favorites.length) {
    favouritesGrid.innerHTML = "<p class='meta'>No favourites yet.</p>";
    return;
  }
  favorites.forEach((item) => renderCard(item, favouritesGrid));
}

function updateTopicFilterOptions(items) {
  const topics = new Set(["All", ...items.map((item) => item.topic)]);
  topicFilter.innerHTML = "";
  topics.forEach((topic) => {
    const option = document.createElement("option");
    option.value = topic;
    option.textContent = topic;
    topicFilter.appendChild(option);
  });
}

function renderGallery() {
  galleryGrid.innerHTML = "";
  const selectedTopic = topicFilter.value;
  const filtered = selectedTopic === "All" ? galleryItems : galleryItems.filter((item) => item.topic === selectedTopic);

  if (!filtered.length) {
    galleryGrid.innerHTML = "<p class='meta'>No gallery items for this filter.</p>";
    return;
  }

  filtered.forEach((item) => renderCard(item, galleryGrid));
}

async function fetchApod(date) {
  setStatus("Loading NASA photo... 🚀");
  const params = new URLSearchParams({ api_key: API_KEY, date, thumbs: "true" });

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.msg || "Could not load data from NASA API.");
    }

    currentApod = { ...data, topic: extractTopic(data) };
    titleEl.textContent = currentApod.title;
    dateEl.textContent = currentApod.date;
    topicPill.textContent = currentApod.topic;
    explanationEl.textContent = currentApod.explanation;
    renderMedia(currentApod);
    renderDedication();
    updateFavoriteButton();

    resultEl.classList.remove("hidden");
    setStatus("Loaded. You can save to favourites, browse the gallery, or export as a card.");
  } catch (error) {
    setStatus(`Error: ${error.message}`);
  }
}

async function loadGallery() {
  setStatus("Loading gallery...");
  const days = Number(daysInput.value);
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  const params = new URLSearchParams({
    api_key: API_KEY,
    start_date: start.toISOString().split("T")[0],
    end_date: end.toISOString().split("T")[0],
    thumbs: "true"
  });

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.msg || "Could not load gallery from NASA API.");
    }

    galleryItems = data.map((item) => ({ ...item, topic: extractTopic(item) })).reverse();
    updateTopicFilterOptions(galleryItems);
    renderGallery();
    setStatus("Gallery ready.");
  } catch (error) {
    setStatus(`Error: ${error.message}`);
  }
}

async function handleSubscription(save = true) {
  const email = emailInput.value.trim();
  if (!email || !email.includes("@")) {
    setStatus("Enter a valid email address.");
    return;
  }

  const endpoint = save ? "/.netlify/functions/subscribe" : "/.netlify/functions/unsubscribe";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Subscription request failed");
    }

    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify({ email, active: save, frequency: "daily" }));
    setStatus(data.message);
  } catch (error) {
    setStatus(`Error: ${error.message}`);
  }
}

async function sendTestEmail() {
  const email = emailInput.value.trim();
  if (!email || !email.includes("@")) {
    setStatus("Enter a valid email address first.");
    return;
  }

  try {
    const response = await fetch("/.netlify/functions/send-test-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send test email");
    }

    setStatus(data.message);
  } catch (error) {
    setStatus(`Error: ${error.message}`);
  }
}


async function checkEmailConnection() {
  try {
    const response = await fetch("/.netlify/functions/email-status");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Email status check failed");
    }

    if (data.connected) {
      connectionStatus.textContent = "Email provider connected";
      subscriptionCard.classList.add("connected");
      return;
    }

    const missing = Object.entries(data.checks)
      .filter(([, ok]) => !ok)
      .map(([name]) => name)
      .join(", ");

    connectionStatus.textContent = `Setup incomplete — missing: ${missing}`;
  } catch (_error) {
    connectionStatus.textContent = "Email functions unavailable (local/static mode)";
  }
}

function loadSubscription() {
  const saved = JSON.parse(localStorage.getItem(SUBSCRIPTION_KEY) || "null");
  if (saved?.email) {
    emailInput.value = saved.email;
  }
}

/* ── Explore: Random picture ─────────────────────────────────── */

function randomDate() {
  const start = new Date("1995-06-16");
  const end = new Date();
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split("T")[0];
}

async function fetchRandom() {
  const date = randomDate();
  dateInput.value = date;
  await fetchApod(date);
}

/* ── Explore: Browse by topic ────────────────────────────────── */

async function browseByTopic(topic) {
  setStatus(`Searching for ${topic} pictures...`);
  exploreGrid.innerHTML = "";

  const dates = [];
  for (let i = 0; i < 30; i++) {
    dates.push(randomDate());
  }
  dates.sort().reverse();

  const params = new URLSearchParams({ api_key: API_KEY, thumbs: "true" });
  const fetches = dates.map((d) =>
    fetch(`${API_URL}?${params.toString()}&date=${d}`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
  );

  try {
    const results = await Promise.all(fetches);
    const matched = results
      .filter((item) => item && extractTopic(item) === topic)
      .map((item) => ({ ...item, topic }));

    if (!matched.length) {
      exploreGrid.innerHTML = `<p class='meta'>No ${topic} pictures found in this batch. Try again!</p>`;
      setStatus("Try again for different results.");
      return;
    }

    matched.forEach((item) => renderCard(item, exploreGrid));
    setStatus(`Found ${matched.length} ${topic} picture(s).`);
  } catch (error) {
    setStatus(`Error: ${error.message}`);
  }
}

/* ── Explore: This Day Through the Years ─────────────────────── */

async function onThisDay() {
  const selected = dateInput.value || today;
  const month = selected.slice(5);
  setStatus(`Loading this day through the years...`);
  exploreGrid.innerHTML = "";

  const currentYear = new Date().getFullYear();
  const startYear = 1995;
  const dates = [];

  for (let y = currentYear; y >= startYear; y--) {
    const d = `${y}-${month}`;
    if (d <= today && d >= "1995-06-16") {
      dates.push(d);
    }
  }

  const params = new URLSearchParams({ api_key: API_KEY, thumbs: "true" });
  const fetches = dates.map((d) =>
    fetch(`${API_URL}?${params.toString()}&date=${d}`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
  );

  try {
    const results = await Promise.all(fetches);
    const items = results
      .filter((item) => item)
      .map((item) => ({ ...item, topic: extractTopic(item) }));

    if (!items.length) {
      exploreGrid.innerHTML = "<p class='meta'>No pictures found for this day.</p>";
      setStatus("No results.");
      return;
    }

    items.forEach((item) => renderCard(item, exploreGrid));
    setStatus(`${items.length} picture(s) on ${month.replace("-", "/")} through the years.`);
  } catch (error) {
    setStatus(`Error: ${error.message}`);
  }
}

/* ── WhatsApp share ──────────────────────────────────────────── */

function shareOnWhatsApp() {
  if (!currentApod) {
    setStatus("Load a picture first.");
    return;
  }
  const text = `${currentApod.title} (${currentApod.date})\n\n${currentApod.explanation.slice(0, 200)}...\n\n${currentApod.url}`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

/* ── Event listeners ─────────────────────────────────────────── */

searchBtn.addEventListener("click", () => fetchApod(dateInput.value));
loadGalleryBtn.addEventListener("click", loadGallery);
topicFilter.addEventListener("change", renderGallery);
randomBtn.addEventListener("click", fetchRandom);
onThisDayBtn.addEventListener("click", onThisDay);
whatsappBtn.addEventListener("click", shareOnWhatsApp);

topicButtons.addEventListener("click", (event) => {
  const btn = event.target.closest(".topic-btn");
  if (!btn) return;
  document.querySelectorAll(".topic-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  browseByTopic(btn.dataset.topic);
});

favoriteBtn.addEventListener("click", () => {
  if (!currentApod) {
    setStatus("Load a picture first.");
    return;
  }
  const favorites = getFavorites();
  if (isFavorite(currentApod.date)) {
    saveFavorites(favorites.filter((item) => item.date !== currentApod.date));
    setStatus("Removed from favourites.");
  } else {
    saveFavorites([...favorites, currentApod]);
    setStatus("Saved to favourites.");
  }
  updateFavoriteButton();
  renderFavourites();
});

/* ── Card export (Canvas → PNG download) ─────────────────────── */

function wrapText(ctx, text, x, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let y = 0;
  const lines = [];

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  const totalHeight = lines.length * lineHeight;
  for (const l of lines) {
    ctx.fillText(l, x, y);
    y += lineHeight;
  }
  return totalHeight;
}

async function loadImageAsBlob(url) {
  const proxyUrl = `/.netlify/functions/image-proxy?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  const blob = await response.blob();
  return createImageBitmap(blob);
}

async function exportCard() {
  if (!currentApod) {
    setStatus("Load a picture first, then export.");
    return;
  }

  setStatus("Generating card...");
  const dedication = dedicationInput.value.trim();

  const W = 1920;
  const H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const NAVY = "#0f1442";
  const GOLD = "#d4af37";
  const GOLD_SOFT = "rgba(212, 175, 55, 0.55)";

  /* background */
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, W, H);

  /* double border */
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, W - 48, H - 48);
  ctx.strokeStyle = GOLD_SOFT;
  ctx.lineWidth = 1;
  ctx.strokeRect(32, 32, W - 64, H - 64);

  /* corner accents */
  const cLen = 50;
  const cOff = 38;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  const corners = [
    [cOff, cOff, cOff + cLen, cOff, cOff, cOff + cLen],
    [W - cOff, cOff, W - cOff - cLen, cOff, W - cOff, cOff + cLen],
    [cOff, H - cOff, cOff + cLen, H - cOff, cOff, H - cOff - cLen],
    [W - cOff, H - cOff, W - cOff - cLen, H - cOff, W - cOff, H - cOff - cLen]
  ];
  for (const [x, y, x2, y2, x3, y3] of corners) {
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x, y);
    ctx.lineTo(x3, y3);
    ctx.stroke();
  }

  /* ornament star */
  ctx.fillStyle = GOLD;
  ctx.font = "28px serif";
  ctx.textAlign = "center";
  ctx.fillText("\u2726  \u2727  \u2726", W / 2, 80);

  /* label */
  ctx.fillStyle = GOLD_SOFT;
  ctx.font = "500 13px 'Cinzel', Georgia, serif";
  ctx.letterSpacing = "4px";
  ctx.fillText("NASA ASTRONOMY PICTURE OF THE DAY", W / 2, 108);
  ctx.letterSpacing = "0px";

  /* title */
  ctx.fillStyle = GOLD;
  ctx.font = "bold 32px 'Cinzel', Georgia, serif";
  ctx.textAlign = "center";
  const titleLines = [];
  {
    const words = currentApod.title.split(" ");
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > W - 300 && line) {
        titleLines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) titleLines.push(line);
  }
  let curY = 148;
  for (const l of titleLines) {
    ctx.fillText(l, W / 2, curY);
    curY += 40;
  }

  /* date */
  ctx.fillStyle = GOLD;
  ctx.font = "20px 'Cinzel', Georgia, serif";
  ctx.letterSpacing = "6px";
  ctx.fillText(currentApod.date, W / 2, curY + 10);
  ctx.letterSpacing = "0px";
  curY += 30;

  /* dedication */
  if (dedication) {
    ctx.fillStyle = "rgba(212, 175, 55, 0.8)";
    ctx.font = "italic 18px 'Cormorant Garamond', Georgia, serif";
    curY += 10;
    const saved = ctx.textAlign;
    ctx.textAlign = "center";
    const dedLines = [];
    {
      const words = dedication.split(" ");
      let line = "";
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width > 500 && line) {
          dedLines.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      if (line) dedLines.push(line);
    }
    for (const l of dedLines) {
      ctx.fillText(`"${l}"`, W / 2, curY);
      curY += 24;
    }
    ctx.textAlign = saved;
  }

  /* image */
  const imgTop = curY + 12;
  const maxImgH = H - imgTop - 120;
  const maxImgW = W - 200;

  if (currentApod.media_type === "image") {
    try {
      const bitmap = await loadImageAsBlob(currentApod.url);
      const scale = Math.min(maxImgW / bitmap.width, maxImgH / bitmap.height, 1);
      const iw = bitmap.width * scale;
      const ih = bitmap.height * scale;
      const ix = (W - iw) / 2;
      const iy = imgTop;

      /* gold border around image */
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 2;
      ctx.strokeRect(ix - 4, iy - 4, iw + 8, ih + 8);

      ctx.drawImage(bitmap, ix, iy, iw, ih);
      curY = iy + ih + 20;
    } catch {
      ctx.fillStyle = GOLD_SOFT;
      ctx.font = "16px 'Cormorant Garamond', Georgia, serif";
      ctx.fillText("[ Image could not be embedded ]", W / 2, imgTop + 40);
      curY = imgTop + 80;
    }
  } else {
    curY = imgTop;
  }

  /* explanation (truncated to fit) */
  const expMaxY = H - 60;
  if (curY < expMaxY - 30) {
    ctx.fillStyle = "rgba(212, 175, 55, 0.5)";
    ctx.font = "15px 'Cormorant Garamond', Georgia, serif";
    ctx.textAlign = "center";
    const expWords = currentApod.explanation.split(" ");
    let line = "";
    for (const w of expWords) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > W - 250 && line) {
        ctx.fillText(line, W / 2, curY);
        curY += 20;
        line = w;
        if (curY > expMaxY - 30) {
          ctx.fillText(line + "...", W / 2, curY);
          line = "";
          break;
        }
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, W / 2, curY);
  }

  /* footer ornament */
  ctx.fillStyle = GOLD;
  ctx.font = "20px serif";
  ctx.textAlign = "center";
  ctx.fillText("\u2726  \u2727  \u2726", W / 2, H - 52);

  ctx.fillStyle = GOLD_SOFT;
  ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
  ctx.letterSpacing = "3px";
  ctx.fillText("A Cosmic Memory", W / 2, H - 34);
  ctx.letterSpacing = "0px";

  /* download */
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nasa-card-${currentApod.date}.png`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Card downloaded!");
  }, "image/png");
}

printBtn.addEventListener("click", exportCard);

subscribeBtn.addEventListener("click", () => handleSubscription(true));
unsubscribeBtn.addEventListener("click", () => handleSubscription(false));
testEmailBtn.addEventListener("click", sendTestEmail);

for (const target of [galleryGrid, favouritesGrid, exploreGrid]) {
  target.addEventListener("click", (event) => {
    const button = event.target.closest(".open-btn");
    if (!button) {
      return;
    }
    const { date } = button.dataset;
    dateInput.value = date;
    fetchApod(date);
  });
}

dedicationInput.addEventListener("input", () => {
  if (!resultEl.classList.contains("hidden")) {
    renderDedication();
  }
});

loadSubscription();
checkEmailConnection();
renderFavourites();
loadGallery();
fetchApod(dateInput.value);
