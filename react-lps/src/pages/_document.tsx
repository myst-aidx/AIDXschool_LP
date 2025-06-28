import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0A0E27" />
        <meta name="description" content="AIDXschool起業塾 - AI×DXで起業を成功に導く" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}