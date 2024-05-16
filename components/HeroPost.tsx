import React from "react";
import { useRouter } from "next/router";

import PostType from "../types/post";
import { Card, DateTime } from "gymnopedies";

type Props = {
  title: string;
  coverImage: PostType["coverImage"];
  date: string;
  excerpt: string;
  slug: string;
};

export const HeroPost: React.FC<Props> = ({
  title,
  coverImage: { url, provider, providerUrl },
  date,
  excerpt,
  slug,
}) => {
  const router = useRouter();
  return (
    <Card
      title={title}
      image={{ src: url }}
      description={excerpt}
      imageCaption={
        <>
          Photo by{" "}
          <a target="_blank" href={providerUrl} rel="noreferrer">
            {provider}
          </a>
        </>
      }
      onClick={() => router.push(`/posts/${slug}`)}
    >
      <DateTime dateString={date} />
    </Card>
  );
};
