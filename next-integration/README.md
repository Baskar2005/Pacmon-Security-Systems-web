Speed Insights — Next.js integration examples

This file shows minimal examples for integrating `@vercel/speed-insights/next` into a Next.js app.

Install (already done):

```
npm install @vercel/speed-insights
```

App Router (Next 13+) — place in `app/layout.js`:

```jsx
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SpeedInsights apiKey={process.env.SPEED_INSIGHTS_API_KEY}>
          {children}
        </SpeedInsights>
      </body>
    </html>
  );
}
```

Pages Router (Next 12 / 13 pages dir not used) — place in `pages/_app.js`:

```jsx
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function MyApp({ Component, pageProps }) {
  return (
    <SpeedInsights apiKey={process.env.SPEED_INSIGHTS_API_KEY}>
      <Component {...pageProps} />
    </SpeedInsights>
  );
}
```

Notes:
- Provide `SPEED_INSIGHTS_API_KEY` as an environment variable on the server or in Vercel project settings.
- If you need to render SpeedInsights only on the client, use dynamic import with `ssr: false`.
- The component accepts props documented by the package — consult the package README for advanced usage.
