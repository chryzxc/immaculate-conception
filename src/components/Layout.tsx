import { AppShell, Burger, Container, Group, Image, Text } from "@mantine/core";
import { Outlet, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";

import SideNavigation from "./SideNavigation";
import logoImg from "../assets/logo.png";
import { routes } from "../constants/routes";
import { useDisclosure } from "@mantine/hooks";
import useUserStore from "../store/user";

const Layout = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure();

  const rootFontSize = 16; // root font size in pixels
  const remValue = 300 / rootFontSize; // converts px to rem
  const width = `calc(100vw - ${remValue}rem)`;

  useEffect(() => {
    if (!user) {
      navigate(routes.login);
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
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Image src={logoImg} alt="Logo" style={{ height: 55, width: 55 }} />
          <Text fw={"bold"} color="secondary">
            Guiuan Immaculate Conception Parish Church
          </Text>
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
