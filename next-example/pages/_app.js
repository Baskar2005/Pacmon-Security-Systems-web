import '../styles.css'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function MyApp({ Component, pageProps }) {
  return (
    <SpeedInsights apiKey={process.env.NEXT_PUBLIC_SPEED_INSIGHTS_API_KEY}>
      <Component {...pageProps} />
    </SpeedInsights>
  )
}
