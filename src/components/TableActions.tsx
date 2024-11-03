import { Group, ActionIcon, Tooltip, Button, Stack, Text } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { RequestFormStatusEnum } from "../enums";
import { INotification } from "../database";
import { useCreate } from "../hooks/useFirebaseFetcher";
import { separatePascalCase } from "../utils";

export const TableApproveRejectButtons = ({
  status,
  loading,
  userId,
  type,
  onApprove,
  onReject,
}: {
  status: "approved" | "rejected" | "pending" | undefined;
  loading: boolean;
  onApprove: () => void;
  onReject: () => void;
  userId: string | undefined | null;
  type: INotification["type"];
}) => {
  const { mutate: createNotification } = useCreate("notification");

  const handleApprove = async () => {
    await createNotification({
      message: `${separatePascalCase(type)} has been approved`,
      timestamp: new Date().toDateString(),
      title: separatePascalCase(type),
      type,
      userId: userId || null,
      fromAdmin: true,
    });
    onApprove();
  };

  const handleReject = async () => {
    await createNotification({
      message: `${separatePascalCase(type)} has been rejected`,
      timestamp: new Date().toDateString(),
      title: separatePascalCase(type),
      type,
      userId: userId || null,
      fromAdmin: true,
    });
    onReject();
  };

  if (status !== "pending" && !!status) {
    return null;
  }

  return (
    <Group justify="center">
      <Tooltip label="Approve">
        <ActionIcon
          variant="filled"
          color="green"
          onClick={handleApprove}
          loading={loading}
        >
          <IconCheck />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Reject">
        <ActionIcon
          variant="filled"
          color="red"
          onClick={handleReject}
          loading={loading}
        >
          <IconX />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};

export const TableReadyButton = ({
  loading,
  status,
  userId,
  onSetAsReady,
  onSetAsCollected,
  type,
}: {
  loading: boolean;
  status: RequestFormStatusEnum | undefined;
  userId: string | undefined | null;
  onSetAsReady: () => void;
  onSetAsCollected: () => void;
  type: INotification["type"];
}) => {
  const { mutate: createNotification } = useCreate("notification");

  const handleSetAsReady = async () => {
    await createNotification({
      message: `Certificate is ready to be collected`,
      timestamp: new Date().toDateString(),
      title: separatePascalCase(type),
      type,
      userId: userId || null,
      fromAdmin: true,
    });
    onSetAsReady();
  };

  const handleSetAsCollected = async () => {
    await createNotification({
      message: `Certificate has been collected`,
      timestamp: new Date().toDateString(),
      title: separatePascalCase(type),
      type,
      userId: userId || null,
      fromAdmin: true,
    });
    onSetAsCollected();
  };

  if (status === "collected") {
    return (
      <Button variant="subtle" color="green">
        Collected
      </Button>
    );
  }

  if (status === "ready") {
    return (
      <Stack className="gap-1">
        <Text size="sm">Ready for collection</Text>
        <Button
          variant="outline"
          onClick={handleSetAsCollected}
          loading={loading}
        >
          Mark as collected
        </Button>
      </Stack>
    );
  }

  return (
    <Button onClick={handleSetAsReady} loading={loading}>
      Set as ready
    </Button>
  );
};
