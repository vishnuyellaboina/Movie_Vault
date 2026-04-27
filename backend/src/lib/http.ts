const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_RETRIES = 2;

function shouldRetry(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("econnreset") ||
    message.includes("etimedout") ||
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("fetch failed")
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJson<T>(
  url: string,
  options: {
    timeoutMs?: number;
    retries?: number;
  } = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "MovieVault-Backend/1.0",
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;

      if (attempt === retries || !shouldRetry(error)) {
        break;
      }

      await sleep(250 * (attempt + 1));
    }
  }

  if (lastError instanceof Error) {
    throw new Error(`Upstream fetch failed after retrying: ${lastError.message}`);
  }

  throw new Error("Upstream fetch failed for an unknown reason");
}
