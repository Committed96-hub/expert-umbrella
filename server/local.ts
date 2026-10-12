import { createServer } from "node:http";
import { handleRequest } from "./handler";
createServer(async (req, res) => {
  try {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 16000) {
        res.writeHead(413);
        res.end('{"error":"Запрос слишком большой"}');
        return;
      }
      chunks.push(chunk);
    }
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers))
      if (value)
        headers.set(key, Array.isArray(value) ? value.join(",") : value);
    const body = Buffer.concat(chunks);
    const response = await handleRequest(
      new Request(`http://${req.headers.host}${req.url}`, {
        method: req.method,
        headers,
        ...(body.length ? { body: body.toString() } : {}),
      }),
    );
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(await response.text());
  } catch {
    res.writeHead(500);
    res.end('{"error":"Ошибка локального API"}');
  }
}).listen(Number(process.env.API_PORT || 8787), "0.0.0.0", () =>
  console.log("Novik API: http://localhost:" + (process.env.API_PORT || 8787)),
);
