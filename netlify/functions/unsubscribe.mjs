import { deactivateSubscriber, isValidEmail, json, normalizeEmail } from "./_helpers.mjs";

export default async (request) => {
  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const { email } = await request.json();
    const normalized = normalizeEmail(email);

    if (!isValidEmail(normalized)) {
      return json(400, { error: "Invalid email" });
    }

    await deactivateSubscriber(normalized);

    return json(200, { ok: true, message: `Unsubscribed ${normalized}.` });
  } catch (error) {
    return json(500, { error: `Failed to unsubscribe: ${error.message}` });
  }
};
