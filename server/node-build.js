import express from "express";
import { createServer } from "./index.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function serveStatic(app) {
  const staticDir = join(__dirname, "../spa");
  const assetsDir = join(staticDir, "assets");
  const indexPath = join(staticDir, "index.html");

  let indexTemplate;
  try {
    indexTemplate = readFileSync(indexPath, "utf-8");
  } catch (err) {
    console.warn("Could not read index.html, SPA mode disabled");
    return;
  }

  // Serve hashed assets with long cache headers
  app.use(
    "/assets",
    express.static(assetsDir, {
      immutable: true,
      maxAge: "1y",
    })
  );

  // Serve other static files (e.g., robots.txt, icons)
  app.use(express.static(staticDir));

  // SPA fallback for non-API routes
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    if (req.method !== "GET") return next();
    res.type("html").send(indexTemplate);
  });
}

const app = createServer();
serveStatic(app);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
