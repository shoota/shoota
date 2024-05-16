import React from "react";
import Head from "next/head";

import { ContainerBox } from "../components/ContainerBox";
import { MoreStories } from "../components/MoreStories";
import { HeroPost } from "../components/HeroPost";
import { AppLayout } from "../components/AppLayout";
import { getAllPosts } from "../lib/api";
import Post from "../types/post";

type Props = {
  allPosts: Post[];
};

function Index({ allPosts }: Props) {
  const heroPost = allPosts[0];
  const morePosts = allPosts.slice(1);
  return (
    <AppLayout>
      <Head>
        <title>Blog</title>
      </Head>
      <ContainerBox>
        {heroPost && (
          <HeroPost
            title={heroPost.title}
            coverImage={heroPost.coverImage}
            date={heroPost.date}
            slug={heroPost.slug}
            excerpt={heroPost.excerpt}
          />
        )}
        {morePosts.length > 0 && <MoreStories posts={morePosts} />}
      </ContainerBox>
    </AppLayout>
  );
}

export default Index;

export const getStaticProps = async () => {
  // TODO author prop is unnessesary
  const allPosts = getAllPosts([
    "title",
    "date",
    "slug",
    "coverImage",
    "excerpt",
  ]);

  return {
    props: { allPosts },
  };
};
