import {
  Button,
  Container,
  Image,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";

import classes from "../styles/PageNotFound.module.css";
import image from "../assets/404.svg";
import { ROUTES } from "../constants/routes";
import { useNavigate } from "react-router-dom";

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <Container className={classes.root}>
      <SimpleGrid spacing={{ base: 40, sm: 80 }} cols={{ base: 1, sm: 2 }}>
        <Image src={image} className={classes.mobileImage} />
        <div>
          <Title className={classes.title}>Something is not right...</Title>
          <Text c="dimmed" size="lg">
            Page you are trying to open does not exist. You may have mistyped
            the address, or the page has been moved to another URL. If you think
            this is an error contact support.
          </Text>
          <Button
            size="md"
            mt="xl"
            className={classes.control}
            onClick={() => navigate(ROUTES.dashboard)}
          >
            Get back to dashboard
          </Button>
        </div>
        <Image src={image} className={classes.desktopImage} />
      </SimpleGrid>
    </Container>
  );
}
