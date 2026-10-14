# SkillScope 4.0 — Find what to learn, one step at a time

SkillScope is a mobile-friendly learning guide with real YouTube/web searching (once API keys are added), saved learning plans, a study-buddy chat, original learning guides and an ad-ready website.

## Deploy on Vercel
1. Connect https://github.com/festech01/Chatgpt to https://vercel.com/new.
2. Select Framework **Other** and output directory **public**. The repo's build command runs automatically (`node scripts/build.mjs`).
3. Deploy and open the Vercel URL. If the build fails, read the Vercel build log. Open on Android Chrome and choose **Install app** or **Add to Home screen**.

## Set up live video search
In Vercel → project **Settings → Environment Variables**, set:
- `YOUTUBE_API_KEY` — Google Cloud YouTube Data API v3 key for live video results.
- `BRAVE_SEARCH_API_KEY` — optional Brave Search API key for websites.

Keep all private keys on the server, never in GitHub. Redeploy after setting variables.

## Connect the AI study buddy
- `OPENAI_API_KEY` — OpenAI API platform secret key; API use is billed separately from a ChatGPT subscription.
- `OPENAI_MODEL` — optional model choice, default `gpt-4.1-mini`.

**AI isn't turned on just by having a chat box.** The server must also have the daily limit storage below connected. Tap **Check AI connection** in the app to see the status.

## Make five free AI uses per day work (REQUIRED)
To avoid an unprotected API bill, AI replies are *paused* until server-side limits are configured.

1. Create an Upstash Redis database at https://console.upstash.com/.
2. In the database connection panel copy its REST URL and REST token.
3. In Vercel's **Environment Variables**, set:
   - `UPSTASH_REDIS_REST_URL` — database REST endpoint.
   - `UPSTASH_REDIS_REST_TOKEN` — private REST token.
   - `LIMIT_COOKIE_SECRET` — a random secret of **at least 32 characters**. Keep this secret private and stable across deployments.
   - `MAX_DAILY_AI_CALLS` — optional site-wide total AI call cap. Default **200** per UTC day to help protect your spending.
4. Redeploy and open **Check AI connection** again.

The app gives **5 successful AI chat replies or smarter-plan generations per browser per UTC day**. Both the chat and Make my plan smarter button use one allowance. A secure signed cookie identifies a browser, and Upstash stores counters. Failed AI calls are refunded where possible. The counter resets at **00:00 UTC** (01:00 in Nigeria).

**Important:** No login means this is a *browser/device* limit, not a true per-person limit. Someone can clear cookies or use another browser to start a new allowance. The site-wide cap adds cost protection, but **this is not a hard payment cap**. Add user login, stronger anti-abuse checks, and spending controls before advertising widely. The API key, Redis token and cookie secret must never be shared publicly.

## How to connect AdSense (AD CODE PREPARED, ADS NOT LIVE)
No publisher ID is included in this public repo. No ads are live until Google accepts the publisher and site.

1. Make sure your site works and contains original useful material. The **Learning guides** page has original content to help readers, but approval is not guaranteed.
2. The AdSense account owner must be **18+**. For a creator under 18, a parent or guardian may apply using their own account and receive payments.
3. The adult publisher applies at https://adsense.google.com/start/ and adds the exact SkillScope website URL.
4. Copy the AdSense publisher ID. It looks like `ca-pub-1234567890123456` (that is an **example only**, not a real account).
5. In Vercel Environment Variables set `ADSENSE_CLIENT_ID` to your real publisher ID and set `ADSENSE_ENABLED` to `true` for **Production**. Redeploy. The build adds Google's script to the website and writes a matching `/ads.txt` file.
6. In AdSense, complete site ownership verification and request a review. Once the site is **Ready**, configure Auto ads on the AdSense dashboard. Google controls whether and when ads display.
7. **Before turning ads on**, complete your privacy policy, add operator contact details, and configure appropriate consent tools (including a Google-approved CMP when required in regions like the EEA/UK). Review the site on phones so advertisements never look like lesson buttons.

To turn the ad snippet off: change `ADSENSE_ENABLED` to `false` and redeploy. The build won't include AdSense code on an ad-free deployment.

**Never click your own ads or ask people to click them.** Ads are not guaranteed income. Earnings depend on real traffic, location, and ad demand.

## Saved lessons and privacy
- Plans, saved video links, chat history and step progress stay in *that browser's local storage* (not cloud syncing).
- Export a backup in **Saved** to keep a copy; clearing browser data can remove your learning history.
- The secure cookie stores a random browser identifier for usage limits, not your name.
- The AI receives your topic, goal and question through the server. Never submit passwords or highly sensitive personal information.
- The site has a privacy page that must be adapted to actual operations before full public launch.

## Before you scale
Add verified login, server-backed sync, user-facing support details, stronger abuse controls, a review of external provider terms, and a way to audit running costs. Monitor OpenAI dashboard usage and Vercel/Upstash logs. This remains an early app rather than a complete production learning platform.
