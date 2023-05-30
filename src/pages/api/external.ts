import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const query = req.query;
  const method = z.string().safeParse(query.method);
  if (!method.success) {
    res.status(400).json("method is required");
    return;
  }
  const body = z.string().safeParse(query.body);
  if (!body.success) {
    res.status(400).json("body is required");
    return;
  }
  const url =
    "https://cors-anywhere.herokuapp.com/php-server-try.000webhostapp.com/";
  const response = await fetch(url, {
    method: method.data,
    body: body.data,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  res.status(200).json({ data: await response.text() });
}

 