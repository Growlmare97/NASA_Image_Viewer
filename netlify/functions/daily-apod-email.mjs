import { getActiveSubscribers, json } from "./_helpers.mjs";

const NASA_URL = "https://api.nasa.gov/planetary/apod";

async function fetchApod() {
  const apiKey = process.env.NASA_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NASA_API_KEY environment variable");
  }

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

  if (!resendKey || !from) {
    throw new Error("Missing RESEND_API_KEY or EMAIL_FROM environment variable");
  }

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
      <h2>NASA APOD for ${apod.date}</h2>
      <h3>${apod.title}</h3>
      ${apod.media_type === "image" ? `<img src="${apod.url}" alt="${apod.title}" style="max-width:100%;border-radius:8px;"/>` : `<p><a href="${apod.url}">Watch today's video</a></p>`}
      <p>${apod.explanation}</p>
      <p style="color:#555; font-size: 12px;">Sent by your NASA Memory Viewer subscription.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `NASA APOD • ${apod.date} • ${apod.title}`,
      html
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${errorText}`);
  }
}

export const config = {
  schedule: "0 13 * * *"
};

export default async () => {
  try {
    const apod = await fetchApod();
    const subscribers = await getActiveSubscribers();

    for (const subscriber of subscribers) {
      await sendEmail(subscriber.email, apod);
    }

    return json(200, {
      ok: true,
      sent: subscribers.length,
      date: apod.date
    });
  } catch (error) {
    return json(500, { error: error.message });
  }
};
