import { Container, Stack, Text } from "@mantine/core";

import React from "react";

type TPageContentProps = {
  title?: string;
  children: React.ReactNode;
};

const PageContent = ({ children, title }: TPageContentProps) => {
  return (
    <Container fluid w={"100%"}>
      {title && (
        <Text mb="md" fw={700} size="lg">
          {title}
        </Text>
      )}
      <Stack gap={20}>{children}</Stack>
    </Container>
  );
};

export default PageContent;
