import { json, normalizeEmail, isValidEmail } from "./_helpers.mjs";

const NASA_URL = "https://api.nasa.gov/planetary/apod";

async function fetchApod() {
  const apiKey = process.env.NASA_API_KEY;
  const response = await fetch(`${NASA_URL}?api_key=${apiKey}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg || "Failed to fetch APOD");
  }
  return data;
}

async function sendEmail(to, apod) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `NASA APOD Test • ${apod.date}`,
      html: `<h2>${apod.title}</h2><p>${apod.explanation}</p>${apod.media_type === "image" ? `<img src="${apod.url}" style="max-width:100%"/>` : `<a href="${apod.url}">Video link</a>`}`
    })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export default async (request) => {
  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const { email } = await request.json();
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return json(400, { error: "Invalid email" });
  }

  try {
    const apod = await fetchApod();
    await sendEmail(normalized, apod);
    return json(200, { ok: true, message: `Test email sent to ${normalized}` });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
