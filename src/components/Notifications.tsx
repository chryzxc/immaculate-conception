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

import { IconBell } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { INotification } from "../database";
import { useFetchAll, useUpdate } from "../hooks/useFirebaseFetcher";
import { toStandardDateFormat } from "../utils";

const Notification = ({ data }: { data: INotification }) => {
  const { read, message, timestamp, type } = data;
  const navigate = useNavigate();
  const { mutate: updateNotification } = useUpdate("notification");

  const handleViewNotification = () => {
    if (!read) {
      updateNotification({ id: String(data.id), data: { read: true } });
    }

    const notificationRouteMapper: Record<INotification["type"], string> = {
      BaptismAppointment: ROUTES.baptism,
      ConfirmationAppointment: ROUTES.confirmation,
      ConfirmationRequestForm: ROUTES.confirmation,
      BaptismRequestForm: ROUTES.baptism,
      MassAppointment: ROUTES.mass,
      ChurchLiturgyAppointment: ROUTES.funeral,
      FuneralAppointment: ROUTES.funeral,
      FuneralRequestForm: ROUTES.funeral,
      HouseLiturgyAppointment: ROUTES.funeral,
      WeddingAnnouncement: ROUTES.wedding,
      WeddingAppointment: ROUTES.wedding,
      WeddingRequestForm: ROUTES.wedding,
    };

    const route = notificationRouteMapper[type];

    if (route) {
      navigate(route);
    }

    return;
  };

  return (
    <Indicator offset={30} disabled={read}>
      <div
        className="flex flex-row gap-4 items-center hover:bg-gray-100 p-2 cursor-pointer"
        onClick={handleViewNotification}
      >
        <Avatar size={50} />
        <div>
          {/* <Text size="sm" color={read ? "dimmed" : undefined}>
            Juan Pedro
          </Text> */}
          <Text color={read ? "dimmed" : undefined}>{message}</Text>
          <Text size="sm" color="dimmed">
            {toStandardDateFormat(timestamp)}
          </Text>
        </div>
      </div>
    </Indicator>
  );
};

const Notifications = () => {
  const { data: notifications = [] } = useFetchAll("notification");

  const filteredNotifications = notifications.filter(
    (notification) => !!notification.userId && !notification.fromAdmin
  );

  const unreadNotifications = filteredNotifications.filter(
    (notification) => !notification.read
  );

  return (
    <Popover width={400} position="bottom" withArrow shadow="md">
      <Popover.Target>
        <Indicator
          inline
          label={unreadNotifications.length}
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
          <ScrollArea.Autosize mah={500} mt="md">
            <Stack>
              {filteredNotifications.map((notification, idx) => (
                <Notification data={notification} key={idx} />
              ))}
            </Stack>
          </ScrollArea.Autosize>
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
};

export default Notifications;
