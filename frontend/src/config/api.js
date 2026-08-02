const runtimeConfig =
  typeof window !== "undefined"
    ? window.__GEARXIN_CONFIG__ || {}
    : {};

function cleanBaseUrl(value, fallback) {
  const normalized = String(value || fallback || "").trim();
  return normalized.replace(/\/+$/, "");
}

export const API_BASE_URL = cleanBaseUrl(
  runtimeConfig.API_URL || process.env.REACT_APP_API_URL,
  "/api",
);

export const STORE_BASE_URL = cleanBaseUrl(
  runtimeConfig.STORE_URL || process.env.REACT_APP_STORE_URL,
  typeof window !== "undefined" ? window.location.origin : "",
);

const DEFAULT_TIMEOUT = Number(
  runtimeConfig.REQUEST_TIMEOUT_MS ||
    process.env.REACT_APP_REQUEST_TIMEOUT_MS ||
    20000,
);

export function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function getErrorMessage(data, fallback) {
  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  return data?.message || data?.error || fallback;
}

export async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    Number.isFinite(DEFAULT_TIMEOUT)
      ? DEFAULT_TIMEOUT
      : 20000,
  );

  const externalSignal = options.signal;

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener(
        "abort",
        () => controller.abort(),
        { once: true },
      );
    }
  }

  const hasBody = options.body !== undefined;
  const headers = {
    Accept: "application/json",
    ...(hasBody && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(
      `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
      {
        ...options,
        credentials: "include",
        headers,
        signal: controller.signal,
      },
    );

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json().catch(() => ({}))
      : await response.text().catch(() => "");

    if (!response.ok) {
      const error = new Error(
        getErrorMessage(
          data,
          `Yêu cầu thất bại (${response.status}).`,
        ),
      );

      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "Không thể kết nối tới máy chủ hoặc yêu cầu đã hết thời gian.",
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function resolveImageUrl(value) {
  const url = String(value || "").trim();

  if (!url) {
    return "";
  }

  if (/^(https?:|data:|blob:)/i.test(url)) {
    return url;
  }

  try {
    const apiUrl = new URL(
      API_BASE_URL,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost",
    );

    return new URL(url, apiUrl.origin).toString();
  } catch {
    return url;
  }
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function normalizePagination(source, fallbackLength = 0) {
  const pagination = source?.pagination || {};

  return {
    page: Number(pagination.page || source?.page || 1),
    limit: Number(pagination.limit || source?.limit || 10),
    total: Number(
      pagination.total || source?.total || fallbackLength,
    ),
    totalPages: Math.max(
      Number(
        pagination.totalPages ||
          source?.totalPages ||
          source?.total_pages ||
          1,
      ),
      1,
    ),
  };
}
