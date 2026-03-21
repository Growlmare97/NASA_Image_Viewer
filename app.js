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

searchBtn.addEventListener("click", () => {
  const date = dateInput.value;
  if (!date) {
    setStatus("Please select a date.");
    return;
  }
  if (date < "1995-06-16") {
    setStatus("APOD only goes back to June 16, 1995.");
    return;
  }
  if (date > today) {
    setStatus("Cannot search future dates.");
    return;
  }
  fetchApod(date);
});
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

async function loadImageAsBlob(url) {
  const proxyUrl = `/.netlify/functions/image-proxy?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  const blob = await response.blob();
  return createImageBitmap(blob);
}

function canvasWrapLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function exportCard() {
  if (!currentApod) {
    setStatus("Load a picture first, then export.");
    return;
  }

  const imageUrl = currentApod.media_type === "image"
    ? currentApod.url
    : (currentApod.thumbnail_url || null);

  if (!imageUrl) {
    setStatus("Cannot export: this APOD is a video with no thumbnail.");
    return;
  }

  setStatus("Generating card...");
  const dedication = dedicationInput.value.trim();

  const W = 1200;
  const H = 1600;
  const PAD = 48;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const BG = "#0b1120";
  const BLUE = "#0b3d91";
  const WHITE = "#ffffff";
  const LIGHT = "rgba(255,255,255,0.7)";
  const DIM = "rgba(255,255,255,0.45)";
  const RED = "#e03c31";

  /* background */
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  /* top blue accent bar */
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, BLUE);
  grad.addColorStop(1, "#1a2a6c");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 6);

  /* red bottom accent */
  ctx.fillStyle = RED;
  ctx.fillRect(0, H - 4, W, 4);

  /* "NASA" label top-left */
  ctx.fillStyle = WHITE;
  ctx.font = "bold 14px 'Inter', Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.letterSpacing = "6px";
  ctx.fillText("NASA", PAD, 40);
  ctx.letterSpacing = "0px";

  /* "Astronomy Picture of the Day" top-right */
  ctx.fillStyle = DIM;
  ctx.font = "12px 'Inter', Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.letterSpacing = "2px";
  ctx.fillText("ASTRONOMY PICTURE OF THE DAY", W - PAD, 40);
  ctx.letterSpacing = "0px";

  /* thin separator */
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, 56);
  ctx.lineTo(W - PAD, 56);
  ctx.stroke();

  /* load and draw the image */
  let curY = 72;
  try {
    const bitmap = await loadImageAsBlob(imageUrl);
    const imgW = W - PAD * 2;
    const scale = imgW / bitmap.width;
    const imgH = Math.min(bitmap.height * scale, H * 0.55);
    const actualScale = Math.min(imgW / bitmap.width, imgH / bitmap.height);
    const iw = bitmap.width * actualScale;
    const ih = bitmap.height * actualScale;
    const ix = (W - iw) / 2;

    ctx.drawImage(bitmap, ix, curY, iw, ih);
    curY += ih + 28;
  } catch {
    ctx.fillStyle = DIM;
    ctx.font = "16px 'Inter', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("[ Image could not be loaded ]", W / 2, curY + 60);
    curY += 120;
  }

  /* title */
  ctx.fillStyle = WHITE;
  ctx.font = "bold 34px 'Inter', Arial, sans-serif";
  ctx.textAlign = "left";
  const titleLines = canvasWrapLines(ctx, currentApod.title, W - PAD * 2);
  for (const l of titleLines) {
    ctx.fillText(l, PAD, curY);
    curY += 42;
  }

  /* date + topic */
  curY += 4;
  ctx.fillStyle = DIM;
  ctx.font = "14px 'Inter', Arial, sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText(`${currentApod.date}   \u2022   ${currentApod.topic}`, PAD, curY);
  ctx.letterSpacing = "0px";
  curY += 28;

  /* blue accent line under date */
  ctx.fillStyle = BLUE;
  ctx.fillRect(PAD, curY, 60, 3);
  curY += 20;

  /* dedication */
  if (dedication) {
    ctx.fillStyle = "rgba(77, 163, 255, 0.85)";
    ctx.font = "italic 16px 'Inter', Arial, sans-serif";
    const dedLines = canvasWrapLines(ctx, `"${dedication}"`, W - PAD * 2 - 20);
    for (const l of dedLines) {
      ctx.fillText(l, PAD + 16, curY);
      curY += 22;
    }
    /* left accent bar for dedication */
    ctx.fillStyle = "rgba(77, 163, 255, 0.3)";
    ctx.fillRect(PAD, curY - dedLines.length * 22 - 4, 3, dedLines.length * 22 + 8);
    curY += 14;
  }

  /* explanation */
  const expMaxY = H - 50;
  ctx.fillStyle = LIGHT;
  ctx.font = "15px 'Inter', Arial, sans-serif";
  ctx.textAlign = "left";
  const expLines = canvasWrapLines(ctx, currentApod.explanation, W - PAD * 2);
  for (const l of expLines) {
    if (curY > expMaxY) {
      ctx.fillText("...", PAD, curY);
      break;
    }
    ctx.fillText(l, PAD, curY);
    curY += 22;
  }

  /* footer */
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = "11px 'Inter', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("apod.nasa.gov", W / 2, H - 16);

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
