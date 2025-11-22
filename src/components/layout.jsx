import React from 'react';
import Head from 'next/head';

const Layout = ({ children, title = 'QuizTime' }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="QuizTime - Test your knowledge and win Quiz Zens!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex flex-col relative">
        <div className="flex-grow">
          {children}
        </div>
      </div>
    </>
  );
};

export default Layout;
