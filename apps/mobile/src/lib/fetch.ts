const BASE_URL = "http://localhost:3000/api";

export async function api(path: string, method = "GET", body?: any) {
  const res = await fetch(BASE_URL + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) throw new Error("Request failed");
  return res.json();
}