import React from "react";

import Post from "../types/post";

import { PostPreview } from "./PostPreview";
import styled from "@emotion/styled";

type Props = {
  posts: Post[];
};

export const MoreStories: React.FC<Props> = ({ posts }) => {
  return (
    <section>
      <Flex>
        <Box>
          {posts.map((post) => (
            <PostPreview
              key={post.slug}
              title={post.title}
              coverImage={post.coverImage}
              date={post.date}
              slug={post.slug}
              excerpt={post.excerpt}
            />
          ))}
        </Box>
      </Flex>
    </section>
  );
};

const Flex = styled.div`
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
  display: flex;
`;

const Box = styled.div`
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
  display: grid;
  grid-gap: 12px;
  grid-template-columns: 1fr;
  margin: auto;

  @media screen and (min-width: 64em) {
    grid-template-columns: 1fr 1fr;
  }

  @media screen and (min-width: 52em) {
    grid-template-columns: 1fr;
  }

  @media screen and (min-width: 40em) {
    grid-template-columns: 1fr;
  }
`;
