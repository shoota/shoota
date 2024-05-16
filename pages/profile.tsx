import React from "react";
import Head from "next/head";

import { SITE_NAME } from "../lib/constants";
import { AppLayout } from "../components/AppLayout";

type Props = {
  name: string;
  picture: string;
};

const Profile: React.FC<Props> = ({ name, picture }) => {
  return (
    <AppLayout>
      <Head>
        <title>{`${SITE_NAME} | Profile`}</title>
      </Head>
      {/* eslint-disable-next-line */}
      <img style={{ width: "20vh" }} src={picture} />
      <h3>{name}</h3>
      <p>
        1984年、青森県うまれ。
        学生時代はカメラと遺伝生物学をこよなく愛していましたが、なぜかカメラメーカーのエンジニアとして社会にでました。
        東日本大震災をきっかけに地元での暮らしを願うようになり、青森へ転職＆移住、現在はフルリモートワーカーとして自宅でエンジニアをしています。
        ３人の息子と1人の嫁さんと暮らしている。もういちどいぬを飼いたい。
      </p>
    </AppLayout>
  );
};

export default Profile;

export const getStaticProps = async () => {
  // TODO get static markdown via graymatter
  return {
    props: {
      name: "shoota kumano",
      picture: "/assets/img/avt.jpg",
    },
  };
};
