import { useState } from "react";
import {
  Blockquote,
  Box,
  Button,
  Group,
  Paper,
  PasswordInput,
  rem,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { signInWithEmailAndPassword } from "firebase/auth";

import classes from "../styles/Login.module.css";
import { ROUTES } from "../constants/routes";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../store/user";
import { auth } from "../database/config";
import { searchByKey } from "../hooks/useFirebaseFetcher";
import { IPriest } from "../database";
import { getHotkeyHandler } from "@mantine/hooks";
import { IconAt, IconLock } from "@tabler/icons-react";

const ICON_SIZE = { width: rem(16), height: rem(16) };

export default function LoginPage() {
  const { setUser, user } = useUserStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const loggedInUser = userCredential.user;
      const priestResults = (await searchByKey(
        "priests",
        "authId",
        loggedInUser.uid
      )) as IPriest[];

      setUser({
        id: loggedInUser.uid,
        name: priestResults?.[0]?.name || "Admin",
        isSuperAdmin: !priestResults.length,
      });
      navigate(ROUTES.dashboard);
    } catch (error) {
      const err = error as { message: string };
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate(ROUTES.dashboard);
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
            id="email"
            type="email"
            label="Email address"
            placeholder="Enter your email"
            size="md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={getHotkeyHandler([["Enter", handleLogin]])}
            leftSection={<IconAt style={ICON_SIZE} />}
          />
          <PasswordInput
            id="password"
            label="Password"
            placeholder="Enter your password"
            mt="md"
            size="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={getHotkeyHandler([["Enter", handleLogin]])}
            leftSection={<IconLock style={ICON_SIZE} />}
          />

          {error && (
            <Text color="red" mt="sm">
              {error}
            </Text>
          )}

          <div className="flex flex-col gap-2 mt-6">
            <Button
              fullWidth
              size="md"
              onClick={handleLogin}
              loading={isLoading}
            >
              Login
            </Button>
            <Button
              fullWidth
              size="md"
              variant="outline"
              onClick={() => navigate(ROUTES.home)}
            >
              Go to Home
            </Button>
          </div>
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
