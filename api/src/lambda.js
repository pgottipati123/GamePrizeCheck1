import serverless from 'serverless-http';
import { loadConfig } from './config.js';
import { createApp } from './app.js';

// AWS Lambda entry point (deployed with the Serverless Framework, see
// serverless.yml). Environment variables come from the Lambda configuration.
const app = createApp(loadConfig());

export const handler = serverless(app);
