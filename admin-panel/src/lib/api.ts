import { setBaseUrl } from "@workspace/api-client-react";

// Generated API paths already include /api/ prefix (e.g. /api/admin/me).
// setBaseUrl is left empty so the browser resolves them relative to the
// current origin — the Replit shared proxy routes /api/* to the API server.
setBaseUrl("");
