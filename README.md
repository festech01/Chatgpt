# SkillScope 2.0 — Learn something good today

A friendly learning app for phones. Type a skill, see a three-step learning path, and find YouTube videos or websites that match each step.

## What you can do
- Search for any skill, such as Canva, Excel, Python or digital marketing.
- Get a simple guide: basics, practice, then a small project.
- Watch real YouTube lessons (when API access is set up).
- Save lessons and tick off learning steps. Progress stays on this browser.
- Open on Android, and use **Add to Home screen**.

This version uses topic-based learning suggestions, **not an AI that reviews every video**. Links shown inside the app come from YouTube or Brave search when keys are added.

## Put your app online
1. Open https://vercel.com/new and import GitHub repo **festech01/Chatgpt**.
2. Set Framework to **Other**, Output directory to **public**, no build command. Click Deploy.
3. Get a key from Google Cloud after enabling **YouTube Data API v3**.
4. In Vercel: **Project > Settings > Environment Variables**, create **YOUTUBE_API_KEY**, paste your key and redeploy.
5. Optional web search: Add **BRAVE_SEARCH_API_KEY** from Brave Search API and redeploy.
6. Open your Vercel website link in Android Chrome, tap **⋮**, choose **Install app** or **Add to Home screen**.

GitHub holds the source code; Vercel serves the site and API. **Never put your real API keys into GitHub code.**

If the keys are not connected yet, the app still creates learning paths and offers YouTube or Google search links.

Costs can apply for public hosting or API usage, depending on your plan and usage. Add rate limits, caching, and privacy information before a large public launch.
