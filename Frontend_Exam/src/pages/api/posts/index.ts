import type { NextApiRequest, NextApiResponse } from "next";

const GOREST_BASE = "https://gorest.co.in/public/v2";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = process.env.GOREST_TOKEN; // server-side only
  const userId = process.env.GOREST_USER_ID; // required for create

  try {
    if (req.method === "GET") {
      const r = await fetch(`${GOREST_BASE}/posts`);
      const data = await r.json();
      return res.status(r.status).json(data);
    }

    if (req.method === "POST") {
      if (!token) {
        return res.status(501).json({ error: "Missing GOREST_TOKEN on server" });
      }
      const { title, body, userId: bodyUserId } = req.body || {};
      let useUserId = bodyUserId ?? (userId ? Number(userId) : undefined);

      // If userId is not provided anywhere, create a random user first
      if (!useUserId) {
        const rand = Math.random().toString(36).slice(2, 8);
        const newUserPayload = {
          name: `User ${rand}`,
          gender: Math.random() < 0.5 ? "male" : "female",
          email: `user_${rand}@example.com`,
          status: "active",
        };
        const createUser = await fetch(`${GOREST_BASE}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newUserPayload),
        });
        const userResp = await createUser.json();
        if (!createUser.ok) {
          return res.status(createUser.status).json(userResp);
        }
        useUserId = userResp.id;
      }

      const r = await fetch(`${GOREST_BASE}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: Number(useUserId), title, body }),
      });
      const data = await r.json();
      return res.status(r.status).json(data);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end("Method Not Allowed");
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
}
