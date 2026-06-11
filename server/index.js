import express from "express";
import compression from "compression";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";

const PORT = process.env.PORT || 8080;
const app = express();

app.use(compression());

// Set robust caching headers for static assets
const distPath = path.resolve(process.cwd(), "dist");
app.use((req, res, next) => {
  // For assets under /assets, set long cache
  if (req.path.startsWith("/assets/")) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  } else if (req.path.endsWith(".pdf")) {
    // PDFs should be cacheable but may be updated -- moderate TTL
    res.setHeader("Cache-Control", "public, max-age=86400");
  } else {
    res.setHeader("Cache-Control", "public, max-age=3600");
  }
  next();
});

// Serve static files from dist with Accept-Ranges supported by Node
app.use(express.static(distPath, { etag: true }));

// Healthcheck
app.get("/healthz", (req, res) => res.send("ok"));

// PDF proxy with Range support — useful when resources are hosted on remote servers
// Usage: /pdf-proxy?url=<encoded remote url>
app.get("/pdf-proxy", async (req, res) => {
  const url = req.query.url;
  if (!url || typeof url !== "string")
    return res.status(400).send("missing url");

  try {
    const range = req.headers.range;
    const headers = {};
    if (range) headers["range"] = range;

    const upstream = await fetch(url, {
      method: "GET",
      headers,
      redirect: "follow",
    });

    // mirror relevant headers
    upstream.headers.forEach((v, k) => {
      // avoid exposing hop-by-hop headers
      if (
        [
          "transfer-encoding",
          "connection",
          "keep-alive",
          "proxy-authenticate",
          "proxy-authorization",
          "te",
          "trailers",
          "upgrade",
        ].includes(k.toLowerCase())
      )
        return;
      res.setHeader(k, v);
    });

    // ensure the browser knows ranges are supported when upstream does
    res.setHeader(
      "Accept-Ranges",
      upstream.headers.get("accept-ranges") || "bytes"
    );
    // gentle caching for proxied PDFs
    res.setHeader("Cache-Control", "public, max-age=86400");

    res.status(upstream.status);
    const body = upstream.body;
    if (body) {
      body.pipe(res);
    } else {
      const buf = await upstream.arrayBuffer();
      res.send(Buffer.from(buf));
    }
  } catch (err) {
    console.error("pdf-proxy error", err);
    res.status(502).send("proxy error");
  }
});

// Fallback to index.html for SPA routing
app.get("*", (req, res) => {
  const index = path.join(distPath, "index.html");
  if (fs.existsSync(index)) {
    res.sendFile(index);
  } else {
    res.status(404).send("not found");
  }
});

app.listen(PORT, () => {
  console.log(`Static server running at http://localhost:${PORT}`);
  console.log("PDF proxy available at /pdf-proxy?url=<url> for remote PDFs");
});
