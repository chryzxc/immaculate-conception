import {
  Blockquote,
  Box,
  Button,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import classes from "../styles/Login.module.css";
import { routes } from "../constants/routes";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../store/user";

export default function LoginPage() {
  const { setUser, user } = useUserStore();
  const navigate = useNavigate();

  const handleLogin = () => {
    setUser({ id: "", name: "" });
  };

  useEffect(() => {
    if (user) {
      navigate(routes.dashboard);
    }
  }, [user, navigate]);

  return (
    <div className={classes.wrapper}>
      <Group style={{ height: "100%" }}>
        <Paper className={classes.form} radius={0} p={30}>
          <Title
            order={2}
            className={classes.title}
            ta="center"
            mt="md"
            mb={50}
          >
            Admin
          </Title>

          <TextInput
            label="Email address"
            placeholder="hello@gmail.com"
            size="md"
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            mt="md"
            size="md"
          />
          {/* <Checkbox label="Keep me logged in" mt="xl" size="md" /> */}
          <Button fullWidth mt="xl" size="md" onClick={handleLogin}>
            Login
          </Button>

          {/* <Text ta="center" mt="md">
            Don&apos;t have an account?{" "}
            <Anchor<"a">
              href="#"
              fw={700}
              onClick={(event) => event.preventDefault()}
            >
              Register
            </Anchor>
          </Text> */}
        </Paper>
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <Box mb="md">
            <Text size="45px" fw="bold" color="white">
              Guiuan
            </Text>
            <Text
              size="24px"
              color="white"
              fw={600}
              style={{ letterSpacing: 1.4 }}
            >
              Immaculate Conception Parish Church
            </Text>

            <Blockquote
              cite="-Mathew 1:23"
              mt="lg"
              color="white"
              styles={{ root: { color: "white" } }}
            >
              Behold a virgin shall conceive and bear a son and his name shall
              be called Emmanuel' (which means, God is with us)
            </Blockquote>
          </Box>
        </div>
      </Group>
    </div>
  );
}
