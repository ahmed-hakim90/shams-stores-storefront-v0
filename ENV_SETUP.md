# Environment Configuration Guide

This document explains how to set up environment variables for Shams Stores development and deployment.

## Quick Start

1. **Copy the template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in development values:**
   Edit `.env.local` and update the values with your local/development credentials.

3. **Verify setup:**
   ```bash
   npm run dev
   ```

## Environment Files

- **`.env.example`** — Template with all available variables. Commit this to git.
- **`.env.local`** — Local development overrides. **Never commit** (already in `.gitignore`).
- **`.env.production.local`** — Production secrets (created during deployment).

## Configuration by Environment

### Development (Local)

Use `.env.local` with mock/test API keys:

```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SHAMS_API_URL=http://localhost:3001/api
```

**Mock Data:** While API endpoints are configured, the app currently uses mock data from `lib/commerce/data.ts`. This is automatically used when API calls fail or in development mode.

### Staging

Create `.env.staging` for staging deployment:

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging.shams-stores.com
NEXT_PUBLIC_SHAMS_API_URL=https://api-staging.shams-stores.com
```

### Production

Vercel automatically uses `.env.production.local` (set via dashboard):

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://shams-stores.com
NEXT_PUBLIC_SHAMS_API_URL=https://api.shams-stores.com
```

## Configuration Sections

### SHAMS API & WooCommerce

**When to update:**
- After Shams API is deployed and ready
- When integrating real WooCommerce backend
- When switching API environments (dev → staging → prod)

**Key variables:**
- `NEXT_PUBLIC_SHAMS_API_URL` — API endpoint (can be public)
- `WOOCOMMERCE_API_KEY` — WooCommerce authentication (server-side only)
- `WOOCOMMERCE_API_SECRET` — WooCommerce secret (server-side only)
- `SHAMS_API_KEY` — Shams API key (server-side only)
- `SHAMS_API_SECRET` — Shams API secret (server-side only)

**Server-side variables** (prefixed without `NEXT_PUBLIC_`) are only available on the server and cannot be exposed to the browser.

### Payment & Installment

**When to update:**
- When setting up payment processing
- When configuring installment providers (Telr, Fawry, etc.)
- For different payment providers per environment

**Key variables:**
- `NEXT_PUBLIC_INSTALLMENT_PROVIDER` — Which installment service to use
- `INSTALLMENT_API_KEY` — Provider API key
- `INSTALLMENT_MERCHANT_ID` — Merchant account ID

### Analytics & Monitoring

**When to update:**
- After creating Google Analytics property
- After setting up Facebook Pixel
- For each environment (dev, staging, prod)

**Key variables:**
- `NEXT_PUBLIC_GA_ID` — Google Analytics ID
- `NEXT_PUBLIC_FB_PIXEL_ID` — Facebook Pixel ID

### Feature Flags

**When to update:**
- To enable/disable features per environment
- During gradual rollouts
- For testing in production

**Available flags:**
```bash
NEXT_PUBLIC_FEATURE_INSTALLMENTS=true   # Enable installment payments
NEXT_PUBLIC_FEATURE_COMPARE=true        # Enable compare functionality
NEXT_PUBLIC_FEATURE_WISHLIST=true       # Enable wishlist
NEXT_PUBLIC_FEATURE_BUNDLES=true        # Enable bundle products
NEXT_PUBLIC_FEATURE_REVIEWS=true        # Enable product reviews
```

## Variable Naming Convention

- **`NEXT_PUBLIC_*`** — Available in browser (client-side safe, non-secret)
- **`NEXT_*`** (without PUBLIC) — Server-side only (secrets, API keys)
- Plain names — Generic Node.js variables

**Security Rule:** Never expose API keys, secrets, or tokens with `NEXT_PUBLIC_`. They will appear in client-side code.

## Vercel Deployment

### Setting Environment Variables

1. **Via Vercel Dashboard:**
   - Go to Project Settings → Environment Variables
   - Add variables for each environment (Preview, Production)
   - Redeploy to apply changes

2. **Via Vercel CLI:**
   ```bash
   vercel env add VARIABLE_NAME
   ```

3. **Via `vercel.json`** (for non-secret variables):
   ```json
   {
     "env": {
       "NEXT_PUBLIC_APP_NAME": "Shams Stores"
     }
   }
   ```

### Secrets in Vercel

For sensitive variables (API keys, tokens):
- Add them via Vercel Dashboard
- Use "Encrypted" option for extra security
- They won't be exposed in git or build logs

## Troubleshooting

### "Variable is undefined"

- Check variable is defined in `.env.local`
- Ensure variable name matches code (case-sensitive)
- For `NEXT_PUBLIC_*` variables, restart dev server after changes
- For server-side variables, verify they're NOT prefixed with `NEXT_PUBLIC_`

### "CORS error" when calling API

- Check `NEXT_PUBLIC_SHAMS_API_URL` points to correct endpoint
- Verify API server has CORS enabled for localhost in development
- Check browser console for actual error message

### "API key not working"

- Verify credentials are correct in `.env.local`
- Check API key is active (not expired or revoked)
- Verify key has correct permissions/scopes
- For development, use test/sandbox API keys

### "Build fails with missing variable"

- All `NEXT_PUBLIC_*` variables must be present at build time
- Optional variables should have default values in code
- Use nullish coalescing: `process.env.VAR_NAME ?? 'default'`

## Examples

### Using Variables in Components

**Client-side (browser):**
```tsx
const apiUrl = process.env.NEXT_PUBLIC_SHAMS_API_URL
const featureEnabled = process.env.NEXT_PUBLIC_FEATURE_REVIEWS === 'true'
```

**Server-side (API routes/server functions):**
```tsx
const apiKey = process.env.SHAMS_API_KEY  // Not exposed to browser
```

### Conditional Rendering Based on Env

```tsx
{process.env.NEXT_PUBLIC_FEATURE_COMPARE === 'true' && (
  <CompareButton />
)}
```

## Next Steps

1. ✅ Create `.env.local` with development values
2. 📝 Document actual API endpoints when Shams API is ready
3. 🔑 Set up Vercel environment variables for deployment
4. 🚀 Test in staging before production deployment
5. 🔍 Verify all features work with real API

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Security Best Practices](https://nextjs.org/docs/basic-features/environment-variables#exposing-variables-to-the-browser)
