import type { NextApiRequest, NextApiResponse } from "next";

const GOREST_BASE = "https://gorest.co.in/public/v2";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const token = process.env.GOREST_TOKEN;

  if (!id || Array.isArray(id)) return res.status(400).json({ error: "Invalid id" });

  try {
    if (req.method === "GET") {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const r = await fetch(`${GOREST_BASE}/posts/${id}`, { headers });
      const data = await r.json();
      return res.status(r.status).json(data);
    }

    if (req.method === "PUT") {
      if (!token) return res.status(501).json({ error: "Missing GOREST_TOKEN on server" });
      const r = await fetch(`${GOREST_BASE}/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(req.body || {}),
      });
      const data = await r.json();
      return res.status(r.status).json(data);
    }

    if (req.method === "DELETE") {
      if (!token) return res.status(501).json({ error: "Missing GOREST_TOKEN on server" });
      const r = await fetch(`${GOREST_BASE}/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.status === 204) return res.status(204).end();
      const data = await r.json();
      return res.status(r.status).json(data);
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end("Method Not Allowed");
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
}
