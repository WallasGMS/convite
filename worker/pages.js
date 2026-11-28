// Becomes _worker.js of the Cloudflare Pages site (tools/deploy_pages.py): API + short links, then the static files.
import { handle } from './api.js';

export default {
  async fetch(req, env) {
    return (await handle(req, env, new URL(req.url).origin + '/')) || env.ASSETS.fetch(req);
  },
};
