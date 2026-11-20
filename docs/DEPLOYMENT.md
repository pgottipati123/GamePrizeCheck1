# Deploying GamePriceCheck (Prototype 3)

Target architecture:

```
Browser -> AWS Amplify (React client) -> API Gateway + AWS Lambda (Express API) -> Supabase
```

The API is deployed on its own (Serverless Framework v3, `api/serverless.yml`) and the client is hosted separately on AWS Amplify (`amplify.yml`). The steps below are written for an **AWS Academy Learner Lab**; they also work on a personal AWS account (see the notes).

## 0. Prerequisites

- Node.js 22+, npm, and the AWS CLI (optional, for `aws sts get-caller-identity`)
- The Supabase database set up with `db/01_schema.sql` then `db/02_seed.sql`
- `api/.env` filled in (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_KEY`); it is git-ignored

## 1. Start the Learner Lab and load its credentials

1. In AWS Academy, open the Learner Lab and click **Start Lab**. Wait until the dot next to "AWS" is green.
2. Click **AWS Details**, then **AWS CLI: Show**. Copy the three lines.
3. On your computer, paste them into `~/.aws/credentials` under `[default]` (replace any old Learner Lab values):

   ```ini
   [default]
   aws_access_key_id=...
   aws_secret_access_key=...
   aws_session_token=...
   ```

4. Check: `aws sts get-caller-identity` should print your account. Learner Lab credentials expire when the session ends (about 4 hours); repeat steps 1–3 in each new session before deploying.

Never commit these values or paste them into the repository.

## 2. Deploy the API to AWS Lambda (Serverless Framework)

```bash
cd api
npm install
npx serverless@3 deploy --region us-east-1
```

- `serverless.yml` reads `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_KEY` and `CORS_ORIGIN` from `api/.env` (or your shell) and stores them as the Lambda function's environment variables. `.env` files are excluded from the upload.
- Learner Lab cannot create IAM roles, so the function uses the existing **LabRole** (`arn:aws:iam::<account-id>:role/LabRole`). On a personal account, either export `LAMBDA_ROLE_ARN=<role ARN>` or delete the `iam.role` line.
- Learner Lab only allows `us-east-1` and `us-west-2`.
- A warning `Invalid configuration encountered at 'provider.runtime'` is expected (Serverless v3 predates `nodejs22.x`) and can be ignored.

When it finishes, copy the endpoint it prints, for example:

```
endpoint: ANY - https://abc123xyz.execute-api.us-east-1.amazonaws.com
```

Test it (replace the URL):

```bash
curl https://abc123xyz.execute-api.us-east-1.amazonaws.com/api/health
BASE_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com ADMIN_API_KEY=<your admin key> bash ../tests/smoke.sh
```

## 3. Host the client on AWS Amplify

Push the branch with `amplify.yml` to GitHub first. Then, in the AWS console (same region):

1. Open **AWS Amplify** → **Create new app** → **GitHub**. Authorize GitHub and choose `pgottipati123/GamePrizeCheck1` and the branch to deploy (e.g. `main` after merging).
2. Tick **My app is a monorepo** and enter `client` as the app root. Amplify detects `amplify.yml`.
3. Under **Advanced settings → Environment variables**, add:
   - `VITE_API_BASE_URL` = the API endpoint from step 2 (no trailing slash, without `/api`)
4. Service role: in Learner Lab, choose the existing **LabRole** if asked (Amplify cannot create a new role there).
5. Click **Save and deploy** and wait for Provision → Build → Deploy to finish.
6. **Rewrites and redirects** → **Manage redirects** → add this rule so page refreshes on routes like `/favorites` work:
   - Source address: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
   - Target address: `/index.html`
   - Type: `200 (Rewrite)`
7. Copy the app URL, e.g. `https://main.d1a2b3c4.amplifyapp.com`.

**If the GitHub connection is blocked in Learner Lab**, use manual deployment instead: on your computer run
`cd client && VITE_API_BASE_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com npm run build`, zip the **contents** of `client/dist` (not the folder itself), then in Amplify choose **Create new app → Deploy without Git** and upload the zip. Add the same rewrite rule (step 6).

## 4. Allow the Amplify site to call the API (CORS)

Add the Amplify URL to `CORS_ORIGIN` in `api/.env` (comma-separated, no trailing slash), then redeploy the API:

```
CORS_ORIGIN=https://main.d1a2b3c4.amplifyapp.com,http://localhost:5173
```

```bash
cd api && npx serverless@3 deploy --region us-east-1
```

## 5. Verify and record the URL

1. Open the Amplify URL. Check Home, Search / Browse, Filter / Sort, a Product page (price comparison, Save to Favorites, Price-change alerts, Go to retailer confirmation), Favorites / Watchlist and About / Help.
2. Refresh the browser on `/favorites` to confirm the rewrite rule.
3. Put the live URL in the "Live Deployed Application" section of the root `README.md`.

## Removing the deployment

```bash
cd api && npx serverless@3 remove --region us-east-1
```

Then delete the app in the Amplify console.
