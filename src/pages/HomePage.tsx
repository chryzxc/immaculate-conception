import {
  AppShell,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Group,
  Image,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";

import TextEditor from "../components/TextEditor";
import classes from "../styles/Home.module.css";
import logoImg from "../assets/logo.png";
import { routes } from "../constants/routes";
import { useFetchAll } from "../hooks/useFirebaseFetcher";
import { useNavigate } from "react-router-dom";

const SectionContainer = ({
  children,
  title,
}: {
  title?: string;
  children: React.ReactNode;
}) => {
  return (
    <Box w="100%">
      <Box mb="md">
        <Text size="xl" fw="bold" color="white">
          {title}
        </Text>
      </Box>
      {children}
    </Box>
  );
};

const Announcements = () => {
  const { data: announcements = [] } = useFetchAll("announcements");
  return (
    <SectionContainer title="Announcements">
      <Stack>
        {announcements.map((announcement, index) => (
          <Card key={index} w="100%">
            <TextEditor readonly content={announcement.content} />
          </Card>
          //   <Blockquote
          //     cite="-Mathew 1:23"
          //     mt="lg"
          //     color="white"
          //     styles={{ root: { color: "white" } }}
          //   >
          //     Behold a virgin shall conceive and bear a son and his name shall
          //     be called Emmanuel' (which means, God is with us)
          //   </Blockquote>
        ))}{" "}
      </Stack>
    </SectionContainer>
  );
};

export default function HomePage() {
  const navigate = useNavigate();

  const headerHeight = 60;

  return (
    <AppShell header={{ height: headerHeight }}>
      <AppShell.Header styles={{ header: { backgroundColor: "primary" } }}>
        <Group h="100%" px="md" justify="space-between">
          {/* <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" /> */}
          <div className="flex flex-row justify-center items-center gap-4">
            <Image src={logoImg} alt="Logo" style={{ height: 55, width: 55 }} />
            <Text
              fw={"bold"}
              color="secondary"
              className="hidden md:flex"
              size="lg"
            >
              Guiuan Immaculate Conception Parish Church
            </Text>
          </div>
          <Button onClick={() => navigate(routes.login)}>Login</Button>
        </Group>
      </AppShell.Header>

      <AppShell.Main h="100vh">
        <div className={classes.wrapper}>
          <ScrollArea h={`85vh`}>
            <Container fluid>
              <Flex direction={{ base: "column", md: "row" }} gap={40}>
                <Box
                  style={{
                    width: "100%",
                    paddingTop: 0,
                    flexBasis: "45%",

                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Stack
                    justify="center"
                    align="center"
                    p="md"
                    className="lg:fixed top-0 left-12 bottom-0"
                  >
                    <Image
                      src={logoImg}
                      alt="Logo"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.5)",
                        borderRadius: 1000,
                        backgroundSize: "contain",
                        maxHeight: 370,
                        maxWidth: 370,
                      }}
                    />
                    <Box className="flex flex-col gap-4">
                      <Text
                        color="white"
                        size="42px"
                        fw="bold"
                        className="text-center"
                      >
                        Guiuan
                      </Text>
                      <Text
                        color="white"
                        size="30px"
                        fw={600}
                        className="text-center"
                      >
                        Immaculate Conception Parish Church
                      </Text>
                    </Box>
                  </Stack>
                </Box>

                <Flex
                  direction="column"
                  gap={16}
                  style={{
                    width: "100%",
                    paddingTop: "8px",
                    flexBasis: "55%",
                    height: "100%",
                  }}
                  align={{ xl: "flex-end" }}
                >
                  <Stack px="lg" py="xl" w="100%">
                    <Announcements />
                  </Stack>
                </Flex>
              </Flex>
              {/* <SimpleGrid cols={{ base: 1, sm: 2 }}>
        
          <Box>
         
          </Box>
        </SimpleGrid> */}
            </Container>
          </ScrollArea>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
