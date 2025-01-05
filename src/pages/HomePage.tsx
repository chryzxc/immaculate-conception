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
import { ROUTES } from "../constants/routes";
import { useFetchAll } from "../hooks/useFirebaseFetcher";
import { useNavigate } from "react-router-dom";
import { toStandardDateFormat } from "../utils";
import { isNotExpired } from "./WeddingPage";

const SectionContainer = ({
  children,
  title,
}: {
  title?: string;
  children: React.ReactNode;
}) => {
  return (
    <Stack px="lg" py="xl" w="100%">
      <Box w="100%">
        <Box mb="md">
          <Text size="xl" fw="bold" color="white">
            {title}
          </Text>
        </Box>
        {children}
      </Box>
    </Stack>
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
        ))}
      </Stack>
    </SectionContainer>
  );
};

const WeddingAnnouncements = () => {
  const { data: weddingAnnouncements = [] } = useFetchAll(
    "weddingAnnouncements"
  );
  const notExpiredAnnouncements = weddingAnnouncements.filter((announcement) =>
    isNotExpired(announcement.expiration)
  );

  if (!notExpiredAnnouncements.length) return null;

  return (
    <SectionContainer title="Marriage Notice">
      <Stack>
        {notExpiredAnnouncements.map((weddingAnnouncement, index) => (
          <Card key={index} w="100%">
            <Text className="text-gray-400">
              Date posted:{" "}
              {toStandardDateFormat(weddingAnnouncement.dateTimeStamp)}
            </Text>
            <TextEditor readonly content={weddingAnnouncement.content} />
          </Card>
        ))}
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
          <Button onClick={() => navigate(ROUTES.login)}>Login</Button>
        </Group>
      </AppShell.Header>

      <AppShell.Main h="100vh">
        <div className={classes.wrapper}>
          <ScrollArea h={`90vh`}>
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
                  <WeddingAnnouncements />
                  <Announcements />
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
