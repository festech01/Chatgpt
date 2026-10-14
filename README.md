# SkillScope 3.0 — Learning should feel easy

A mobile-friendly learning guide with saved plans, bookmarks, progress, detailed lesson steps, a personal goal field, an AI study buddy and search for YouTube lessons or educational websites.

## Start
Deploy this GitHub repo on Vercel (https://vercel.com/new). Choose the repository, select **Other** framework, output directory **public**, then Deploy. Vercel will publish new changes pushed to the main branch. On Android Chrome, use **Install app** or **Add to Home screen**.

## Add live features
In Vercel project Settings → Environment Variables, set:
- `YOUTUBE_API_KEY`: Google Cloud key with YouTube Data API v3 enabled. Shows YouTube search results.
- `BRAVE_SEARCH_API_KEY`: optional Brave Search API key. Shows websites.
- `OPENAI_API_KEY`: OpenAI API key. Enables AI chat and the **Make my plan smarter** button.
- `OPENAI_MODEL`: optional model name; default is `gpt-4.1-mini`.

Keep keys in Vercel, **never** in browser code, commits, or README. Redeploy after adding environment variables. External API use may incur charges.

## Saved progress
Tap **Save this learning plan** to put the current plan into **Saved**. Save individual video or website links from the results. Progress, plans, and chat messages are saved locally on that particular browser using localStorage. **It is not cloud memory or cross-device sync.** Export your backup file from the Saved tab to keep your work and restore it on another browser. Don't rely on a browser storage backup as the only copy.

## About the AI
The starter learning paths work without an AI key. Detailed explanations come from the lesson guide; AI chat and smarter plans require a connected paid API. AI plans and answers can make mistakes, and **no video is guaranteed reviewed or verified**. Search results may come from outside websites.

## Ads and monetization
A clearly marked advertisement placeholder is included. **No actual ads are active and no income is being generated**. Apply to an ad network such as Google AdSense, meet its publisher requirements, receive approval, then configure live ad units. AdSense publishers must be adults (under-18 creators need a parent/guardian to own the publisher account). Add suitable cookie/consent notices and final contact details to the privacy page. Never make ads look like lessons. Do not click your own ads or ask others to click.

## Before a larger public launch
- Add account-based login and server-backed data if you need synced memory.
- Add server-side per-user rate limiting, spending caps, and abuse monitoring to protect AI and search APIs.
- Review provider terms and consent/cookie obligations in the countries you serve.
- Test the app on your phone and monitor Vercel deployment and function logs.

This is an early app, not a full production learning management system.

## If the AI chat does not answer
1. Open the live website, create/open a learning path, then tap **Check AI connection** in the chat box.
2. If it says "AI is not connected", open **Vercel → Project → Settings → Environment Variables**.
3. Add an environment variable named exactly `OPENAI_API_KEY` and enter your API key from the OpenAI API platform (not a ChatGPT login or subscription). Select **Production** and save.
4. Redeploy the Vercel project from the **Deployments** tab. Environment variable changes do not affect older deployments.
5. Open the updated app, press **Check AI connection**, then send a test question.
6. If it says configured but the chat still fails, check **Vercel → Logs** for the tutor function. Bad keys, missing permissions, and API credit or usage limits can prevent replies.

The website cannot make real AI responses without a working provider key and any required API billing. Never place the key in GitHub or the browser code; keep it in Vercel Environment Variables.
