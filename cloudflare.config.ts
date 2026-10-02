import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  accountId: "48f5cc18f1a716e781d39f1d6777ddc9",
  worker: defineWorker({
    name: "account-planner",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-10-01",
    compatibilityFlags: ["nodejs_compat"],
    assets: { notFoundHandling: "none" },
    // Only the Access-gated custom domain; workers.dev is disabled so the
    // Access policy cannot be bypassed via the default route.
    workersDev: false,
    // domains: attached via dashboard/API (token lacks Workers Custom Domains perm)
    env: {
      ASSETS: bindings.assets(),
      DB: bindings.d1({ name: "account-planner-db" }),
      // Cloudflare Access JWT verification (public identifiers, not secrets).
      ACCESS_TEAM_DOMAIN: bindings.text("ihogben.cloudflareaccess.com"),
      ACCESS_APP_AUD: bindings.text("6b48cd4b1f6fb1cd219061dacda058672abdebdc26544c0e87f73191646a45ae"),
    },
  }),
});
