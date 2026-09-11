import { parseAppEnv } from './platform/config/runtime.js';
import { createApiApp } from './app/create-app.js';

const env = parseAppEnv();
const app = await createApiApp(env);
await app.listen(env.API_PORT, '127.0.0.1');
console.log(`API ${env.API_MODE} http://localhost:${env.API_PORT}`);
