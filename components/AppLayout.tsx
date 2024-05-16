import { PropsWithChildren } from "react";
import Meta from "./meta";
import { NavBar } from "./molecules/Navbar";
import styled from "@emotion/styled";

type Props = {
  ogImage?: string;
  ogTitle?: string;
  children: React.ReactNode;
};

const Box = styled.div`
  margin: 32px 0;
`;

export const AppLayout = ({
  ogImage,
  ogTitle,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <>
      <Meta ogImage={ogImage} ogTitle={ogTitle} />
      <div style={{ margin: "0 auto", width: "90vw", maxWidth: "1400px" }}>
        <NavBar />
        <Box>{children}</Box>
      </div>
    </>
  );
};
