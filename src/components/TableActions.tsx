import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { CONFIRMATION_MESSAGE } from "../constants/string";
import { INotification, IRequestFormRelease } from "../database";
import { RequestFormStatusEnum } from "../enums";
import { useCreate } from "../hooks/useFirebaseFetcher";
import useUserStore from "../store/user";
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

  const { user } = useUserStore();

  const handleApprove = async () => {
    modals.openConfirmModal({
      title: "Are you sure you want to approve this?",
      children: <Text size="sm">{CONFIRMATION_MESSAGE}</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: async () => {
        await createNotification({
          message: `${separatePascalCase(type)} has been approved`,
          timestamp: new Date().toDateString(),
          title: separatePascalCase(type),
          type,
          userId: userId || null,
          fromAdmin: true,
        });
        onApprove();
      },
    });
  };

  const handleReject = async () => {
    modals.openConfirmModal({
      title: "Are you sure you want to reject this?",
      children: <Text size="sm">{CONFIRMATION_MESSAGE}</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: async () => {
        await createNotification({
          message: `${separatePascalCase(type)} has been rejected`,
          timestamp: new Date().toDateString(),
          title: separatePascalCase(type),
          type,
          userId: userId || null,
          fromAdmin: true,
        });
        onReject();
      },
    });
  };

  if ((status !== "pending" && !!status) || !user?.isSuperAdmin) {
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

export const TableConfirmRejectRequestButtons = ({
  status,
  loading,
  onApprove,
  onReject,
}: {
  status: "approved" | "rejected" | "pending" | undefined;
  loading: boolean;
  onApprove: () => void;
  onReject: () => void;
}) => {
  const handleApprove = async () => {
    modals.openConfirmModal({
      title: "Are you sure you want to confirm this?",
      children: <Text size="sm">{CONFIRMATION_MESSAGE}</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: async () => {
        onApprove();
      },
    });
  };

  const handleReject = async () => {
    modals.openConfirmModal({
      title: "Are you sure you want to reject this?",
      children: <Text size="sm">{CONFIRMATION_MESSAGE}</Text>,
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: async () => {
        onReject();
      },
    });
  };

  if (status !== "pending" && !!status) {
    return null;
  }

  return (
    <Group justify="center">
      <Tooltip label="Confirm">
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
  onSetAsCollected: (data: IRequestFormRelease) => void;
  type: INotification["type"];
}) => {
  const { mutate: createNotification } = useCreate("notification");
  const [openModal, setOpenModal] = useState(false);
  const { user } = useUserStore();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      releasedTo: "",
      releasedDate: new Date().toDateString(),
    },

    validate: {
      releasedTo: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });

  const handleSetAsReady = async () => {
    await createNotification({
      message: `Certificate is ready to be released`,
      timestamp: new Date().toDateString(),
      title: separatePascalCase(type),
      type,
      userId: userId || null,
      fromAdmin: true,
    });
    onSetAsReady();
  };

  const handleSubmit = async (values: typeof form.values) => {
    await createNotification({
      message: `Certificate has been released to ${values.releasedTo}`,
      timestamp: new Date().toDateString(),
      title: separatePascalCase(type),
      type,
      userId: userId || null,
      fromAdmin: true,
    });
    setOpenModal(false);
    onSetAsCollected(values);
  };

  if (!user?.isSuperAdmin) return null;

  if (status === "released") {
    return (
      <Button variant="subtle" color="green">
        Released
      </Button>
    );
  }

  if (status === "ready") {
    return (
      <>
        <Stack className="gap-1">
          <Text size="sm">Ready to release</Text>
          <Button
            variant="outline"
            onClick={() => setOpenModal(true)}
            loading={loading}
          >
            Set as released
          </Button>
        </Stack>
        <Modal
          opened={openModal}
          onClose={() => setOpenModal(false)}
          title="Ready to release"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="Released to"
                placeholder="Enter name of the person who will receive this certificate"
                withAsterisk
                key={form.key("releasedTo")}
                {...form.getInputProps("releasedTo")}
              />
              <Button type="submit">Release certificate</Button>
            </Stack>
          </form>
        </Modal>
      </>
    );
  }

  return (
    <Button onClick={handleSetAsReady} loading={loading}>
      Set as ready
    </Button>
  );
};
