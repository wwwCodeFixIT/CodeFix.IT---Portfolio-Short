type Env = {
  AI_TOOLS_ENABLED?: string;
  AI_RATE_LIMIT_CONFIRMED?: string;
  OPENAI_API_KEY?: string;
  SITE_DOCTOR_ENABLED?: string;
  SITE_DOCTOR_RATE_LIMIT_CONFIRMED?: string;
  PAGESPEED_API_KEY?: string;
};

// Configuration only: no provider request, credential value or account detail.
export function onRequestGet({ env, request }: { env: Env; request: Request }): Response {
  const production = new URL(request.url).origin === 'https://codefix.it';
  return Response.json({
    ai: production && env.AI_TOOLS_ENABLED === 'true' &&
      env.AI_RATE_LIMIT_CONFIRMED === 'true' && Boolean(env.OPENAI_API_KEY),
    doctor: production && env.SITE_DOCTOR_ENABLED === 'true' &&
      env.SITE_DOCTOR_RATE_LIMIT_CONFIRMED === 'true' && Boolean(env.PAGESPEED_API_KEY),
  }, { headers: {
    'Cache-Control': 'no-store, private, max-age=0',
    'X-Content-Type-Options': 'nosniff',
  } });
}
