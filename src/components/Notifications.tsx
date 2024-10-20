import {
  ActionIcon,
  Avatar,
  Box,
  Indicator,
  Popover,
  rem,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";

import { toStandardDateFormat } from "../utils";
import { IconBell } from "@tabler/icons-react";

const Notification = () => {
  const isRead = true;
  return (
    <Indicator offset={30} disabled={isRead}>
      <div className="flex flex-row gap-4 items-center">
        <Avatar size={50} />
        <div>
          <Text size="sm" color={isRead ? "dimmed" : undefined}>
            Juan Pedro
          </Text>
          <Text color={isRead ? "dimmed" : undefined}>
            Marriage appointment
          </Text>
          <Text size="xs" color="dimmed">
            {toStandardDateFormat(new Date())}
          </Text>
        </div>
      </div>
    </Indicator>
  );
};

const Notifications = () => {
  return (
    <Popover width={400} position="bottom" withArrow shadow="md">
      <Popover.Target>
        <Indicator
          inline
          label="42"
          size={26}
          color="red"
          mr="md"
          offset={6}
          radius={100}
        >
          <ActionIcon
            size={42}
            radius={100}
            variant="default"
            aria-label="ActionIcon with size as a number"
          >
            <IconBell style={{ width: rem(24), height: rem(24) }} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>
      <Popover.Dropdown>
        <Box h="100%">
          <Text fw={700}>Notifications</Text>
          <ScrollArea mah={500} mt="md">
            <Stack h="100vh">
              {Array.from({ length: 25 }).map(() => (
                <Notification />
              ))}
            </Stack>
          </ScrollArea>
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
};

export default Notifications;
