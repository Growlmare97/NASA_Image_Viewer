const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    },
    body: JSON.stringify(body)
  };
}

export function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getHeaders() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable");
  }

  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=representation"
  };
}

export async function upsertSubscriber(email) {
  const headers = getHeaders();
  const response = await fetch(`${SUPABASE_URL}/rest/v1/subscribers?on_conflict=email`, {
    method: "POST",
    headers,
    body: JSON.stringify([{ email, active: true }])
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function deactivateSubscriber(email) {
  const headers = getHeaders();
  const response = await fetch(`${SUPABASE_URL}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ active: false })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function getActiveSubscribers() {
  const headers = getHeaders();
  const response = await fetch(`${SUPABASE_URL}/rest/v1/subscribers?select=email&active=eq.true`, {
    method: "GET",
    headers
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}
