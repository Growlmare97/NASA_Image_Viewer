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

function buildEmailHtml(apod) {
  const media = apod.media_type === "image"
    ? `<img src="${apod.url}" alt="${apod.title}" style="max-width:100%;border-radius:8px;margin:16px 0;" />`
    : `<p style="margin:16px 0;"><a href="${apod.url}" style="color:#4da3ff;">Watch today's video</a></p>`;

  return `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;background:#0b1120;color:#e8ecf4;padding:0;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#0b3d91,#1a1a40);padding:24px 28px;text-align:center;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/120px-NASA_logo.svg.png" alt="NASA" width="60" style="margin-bottom:8px;" />
        <h1 style="margin:0;font-size:20px;color:#fff;letter-spacing:0.03em;">Astronomy Picture of the Day</h1>
        <p style="margin:4px 0 0;font-size:13px;color:#8a94a8;">${apod.date}</p>
      </div>
      <div style="padding:24px 28px;">
        <h2 style="margin:0 0 4px;font-size:18px;color:#fff;">${apod.title}</h2>
        ${media}
        <p style="font-size:14px;line-height:1.7;color:#c8cdd6;">${apod.explanation}</p>
      </div>
      <div style="padding:16px 28px;background:rgba(0,0,0,0.3);text-align:center;font-size:12px;color:#8a94a8;">
        Sent by NASA Memory Viewer &bull; <a href="https://apod.nasa.gov/" style="color:#4da3ff;text-decoration:none;">apod.nasa.gov</a>
      </div>
    </div>
  `;
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
      subject: `NASA APOD Test — ${apod.title}`,
      html: buildEmailHtml(apod)
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
