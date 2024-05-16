import React from "react";
import Head from "next/head";

import { AppLayout } from "../components/AppLayout";
import { SITE_NAME } from "../lib/constants";
import Hero from "../components/organisms/Hero";

const Index: React.FC = () => {
  return (
    <AppLayout>
      <Head>
        <title>{`${SITE_NAME} | Home`}</title>
      </Head>
      <Hero />
    </AppLayout>
  );
};

export default Index;

// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticProps = async () => {
  return {
    props: {},
  };
};
