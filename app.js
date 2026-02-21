const API_URL = "https://api.nasa.gov/planetary/apod";
const API_KEY = "MKUgyKuvV4B5CjxAZsNIDVHZIcZacZP1c84QS4kF";

const dateInput = document.getElementById("date-input");
const dedicationInput = document.getElementById("dedication-input");
const searchBtn = document.getElementById("search-btn");
const printBtn = document.getElementById("print-btn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const titleEl = document.getElementById("apod-title");
const dateEl = document.getElementById("apod-date");
const dedicationOutput = document.getElementById("dedication-output");
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
  dedicationOutput.textContent = "";
  dedicationOutput.classList.add("hidden");
  resultEl.classList.add("hidden");
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
    renderDedication();
    renderMedia(data);

    resultEl.classList.remove("hidden");
    setStatus("Done. You can print/save as PDF.");
  } catch (error) {
    setStatus(`Error: ${error.message}`);
  }
}

function handleSearch() {
  if (!dateInput.value) {
    setStatus("Please pick a date.");
    return;
  }

  fetchApod(dateInput.value);
}

searchBtn.addEventListener("click", handleSearch);

printBtn.addEventListener("click", () => {
  if (resultEl.classList.contains("hidden")) {
    setStatus("Load a picture first, then print/save as PDF.");
    return;
  }

  renderDedication();
  setStatus("Opening print dialog...");
  window.print();
});

dedicationInput.addEventListener("input", () => {
  if (!resultEl.classList.contains("hidden")) {
    renderDedication();
  }
});

fetchApod(dateInput.value);
