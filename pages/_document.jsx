import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/assets/images/QuizTime.png" />
        <link rel="preload" href="/assets/fonts/KnightWarrior.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/fonts/CaviarDreams_Bold.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <style>{`
          @font-face {
            font-family: 'KnightWarrior';
            src: url('/assets/fonts/KnightWarrior.otf') format('opentype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          
          @font-face {
            font-family: 'CaviarDreams_Bold';
            src: url('/assets/fonts/CaviarDreams_Bold.ttf') format('truetype');
            font-weight: bold;
            font-style: normal;
            font-display: swap;
          }
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
