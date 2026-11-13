import 'dotenv/config';
import { loadConfig } from './config.js';
import { createApp } from './app.js';

const config = loadConfig();
const app = createApp(config);

if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
  console.warn('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set: data endpoints will fail.');
}
if (!config.adminApiKey) {
  console.warn('ADMIN_API_KEY is not set: PATCH /api/listings/:id is disabled.');
}

app.listen(config.port, () => {
  console.log(`GamePriceCheck API listening on http://localhost:${config.port}`);
});
