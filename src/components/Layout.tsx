import { AppShell, Burger, Group, Image, Text } from "@mantine/core";
import { Outlet, useNavigate } from "react-router-dom";

import { useDisclosure } from "@mantine/hooks";
import { useEffect } from "react";
import logoImg from "../assets/logo.png";
import { ROUTES } from "../constants/routes";
import useUserStore from "../store/user";
import Notifications from "./Notifications";
import SideNavigation from "./SideNavigation";

const Layout = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure();

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.login);
    }
  }, [user, navigate]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header styles={{ header: { backgroundColor: "primary" } }}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Image src={logoImg} alt="Logo" style={{ height: 55, width: 55 }} />
            <Text fw={"bold"} color="secondary" className="hidden md:block">
              Guiuan Immaculate Conception Parish Church
            </Text>
          </Group>

          <Group>
            <Text>{`${user?.isSuperAdmin ? user.name : `Father ${user?.name}`}`}</Text>
            <Notifications />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <SideNavigation />
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default Layout;
