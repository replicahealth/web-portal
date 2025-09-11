# Web Portal

React + Vite portal for dataset access with Auth0 authentication.

## Getting Started

### 1. Install dependencies

```bash
```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in your values:

<pre class="overflow-visible!" data-start="442" data-end="612"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>VITE_API_BASE</span><span>=http://localhost:</span><span>8080</span><span>
</span><span>VITE_AUTH0_DOMAIN</span><span>=your-tenant.us.auth0.com
</span><span>VITE_AUTH0_CLIENT_ID</span><span>=your-client-id
</span><span>VITE_AUTH0_AUDIENCE</span><span>=https://your-api-identifier
</span></span></code></div></div></pre>

### 3. Run the dev server

<pre class="overflow-visible!" data-start="640" data-end="663"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>npm run dev
</span></span></code></div></div></pre>

This will start the app on [http://localhost:5173](http://localhost:5173).


### 4. Build for production

<pre class="overflow-visible!" data-start="768" data-end="809"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>npm run build
npm run preview</span></span></code></div></div></pre>


## Project structure

* `src/lib/api.ts` → helper to call backend (`requestDownloadUrl`)
* `src/auth/` → Auth0 provider and role hooks
* `src/pages/` → app pages (e.g. `Home.tsx`, `Datasets.tsx`)
