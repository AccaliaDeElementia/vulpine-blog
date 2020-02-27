import * as core from "express-serve-static-core";

import * as commonmark from "commonmark";

import { Router } from "express";

// Init router and path
const router = Router();

const parser = new commonmark.Parser({ smart: false });
const renderer = new commonmark.HtmlRenderer({ safe: false })
router.get("/", (_: core.Request, res: core.Response) => {
  res.render("index", { title: "Express", body: renderer.render(parser.parse("Hello *World!*")) });
})

// Export the base-router
export default router;
