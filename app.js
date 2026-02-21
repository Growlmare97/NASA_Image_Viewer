const API_URL = "https://api.nasa.gov/planetary/apod";
const API_KEY = "DEMO_KEY";

const dateInput = document.getElementById("date-input");
const searchBtn = document.getElementById("search-btn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const titleEl = document.getElementById("apod-title");
const dateEl = document.getElementById("apod-date");
const mediaWrapper = document.getElementById("media-wrapper");
const explanationEl = document.getElementById("apod-explanation");

const today = new Date().toISOString().split("T")[0];
dateInput.max = today;
dateInput.value = today;

function setStatus(message) {
  statusEl.textContent = message;
}

function resetResult() {
  mediaWrapper.innerHTML = "";
  resultEl.classList.add("hidden");
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

async function fetchApod(date) {
  resetResult();
  setStatus("Loading NASA photo... 🚀");

  const params = new URLSearchParams({ api_key: API_KEY, date });
  const url = `${API_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || "Could not load data from NASA API.");
    }

    titleEl.textContent = data.title;
    dateEl.textContent = data.date;
    explanationEl.textContent = data.explanation;
    renderMedia(data);

    resultEl.classList.remove("hidden");
    setStatus("Done.");
  } catch (error) {
    setStatus(`Error: ${error.message}`);
  }
}

searchBtn.addEventListener("click", () => {
  if (!dateInput.value) {
    setStatus("Please pick a date.");
    return;
  }

  fetchApod(dateInput.value);
});

fetchApod(dateInput.value);
