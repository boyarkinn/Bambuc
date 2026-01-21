export const config = {
  port: Number(process.env.COCOON_SERVICE_PORT ?? 5050),
  cocoonBaseUrl: (process.env.COCOON_CLIENT_URL ?? 'http://127.0.0.1:8081').replace(/\/$/, ''),
  timeoutMs: Number(process.env.COCOON_TIMEOUT_MS ?? 120000),
}
