const API_BASE = (
  process.env.REACT_APP_API_URL ||
  "http://localhost:3001/api"
).replace(/\/+$/, "");

async function readJson(response) {
  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message ||
        data?.detail ||
        "Yêu cầu không thành công.";

    throw new Error(message);
  }

  return data;
}

async function request(path, options = {}) {
  const response = await fetch(
    `${API_BASE}${path}`,
    {
      credentials: "include",
      ...options,
      headers: {
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...(options.headers || {}),
      },
    },
  );

  return readJson(response);
}

export function getAccountOverview() {
  return request("/account/overview");
}

export function getProfile() {
  return request("/account/profile");
}

export function updateProfile(payload) {
  return request("/account/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function changePassword(payload) {
  return request("/account/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getMyOrders({
  page = 1,
  limit = 10,
  status = "",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status) {
    params.set("status", status);
  }

  return request(
    `/account/orders?${params.toString()}`,
  );
}

export function getMyOrderDetail(orderId) {
  return request(`/account/orders/${orderId}`);
}

export function cancelMyOrder(
  orderId,
  reason = "",
) {
  return request(
    `/account/orders/${orderId}/cancel`,
    {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    },
  );
}


export function submitPurchasedReview(
  orderId,
  productId,
  payload,
) {
  return request(
    `/account/orders/${orderId}/items/${productId}/review`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
