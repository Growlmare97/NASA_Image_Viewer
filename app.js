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
    setStatus("Loaded. You can save to favourites, browse the gallery, or export as PDF.");
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

function handleSubscription(save = true) {
  const email = emailInput.value.trim();
  if (!email || !email.includes("@")) {
    setStatus("Enter a valid email address.");
    return;
  }

  if (save) {
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify({ email, active: true, frequency: "daily" }));
    setStatus(`Subscribed ${email}. Next step: connect EmailJS/Resend to send daily APOD emails automatically.`);
  } else {
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify({ email, active: false, frequency: "daily" }));
    setStatus(`Unsubscribed ${email}.`);
  }
}

function loadSubscription() {
  const saved = JSON.parse(localStorage.getItem(SUBSCRIPTION_KEY) || "null");
  if (saved?.email) {
    emailInput.value = saved.email;
  }
}

searchBtn.addEventListener("click", () => fetchApod(dateInput.value));
loadGalleryBtn.addEventListener("click", loadGallery);
topicFilter.addEventListener("change", renderGallery);

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

printBtn.addEventListener("click", () => {
  if (resultEl.classList.contains("hidden")) {
    setStatus("Load a picture first, then export as PDF.");
    return;
  }
  renderDedication();
  window.print();
});

subscribeBtn.addEventListener("click", () => handleSubscription(true));
unsubscribeBtn.addEventListener("click", () => handleSubscription(false));

for (const target of [galleryGrid, favouritesGrid]) {
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
renderFavourites();
loadGallery();
fetchApod(dateInput.value);
