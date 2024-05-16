import styled from "@emotion/styled";
import React from "react";

export function NavBar() {
  return (
    <Container>
      <Text>shoota works</Text>
      <Box>
        <Link href="/">Home</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/profile">Profile</Link>
      </Box>
    </Container>
  );
}

const Container = styled.div`
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
  padding-left: 8px;
  padding-right: 8px;
  align-items: baseline;
  display: flex;
`;

const Text = styled.div`
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
  font-size: 20px;
  padding: 8px;
  font-weight: bold;

  @media screen and (min-width: 40em) {
    font-size: 32px;
  }

  @media screen and (min-width: 52em) {
    font-size: 32px;
  }
`;

const Box = styled.div`
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
  margin-left: auto;
`;

const Link = styled.a`
  font-size: 16px;
`;
