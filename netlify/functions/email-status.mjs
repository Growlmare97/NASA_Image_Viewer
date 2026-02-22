import { json } from "./_helpers.mjs";

export default async () => {
  const hasNasa = Boolean(process.env.NASA_API_KEY);
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasEmailFrom = Boolean(process.env.EMAIL_FROM);
  const hasSupabaseUrl = Boolean(process.env.SUPABASE_URL);
  const hasSupabaseKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  const connected = hasNasa && hasResend && hasEmailFrom && hasSupabaseUrl && hasSupabaseKey;

  return json(200, {
    connected,
    checks: {
      NASA_API_KEY: hasNasa,
      RESEND_API_KEY: hasResend,
      EMAIL_FROM: hasEmailFrom,
      SUPABASE_URL: hasSupabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: hasSupabaseKey
    }
  });
};
