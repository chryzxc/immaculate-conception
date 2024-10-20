import { ActionIcon, Group, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import {
  useFetchAll,
  useFetchById,
  useUpdate,
} from "../hooks/useFirebaseFetcher";

import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import CustomDatatable from "../components/CustomDatable";
import PageContent from "../components/PageContent";
import StatusBadge from "../components/StatusBadge";
import { IMass } from "../database";
import { AppointmentStatusEnum } from "../enums";

const Priest = ({ priestId }: { priestId?: string | null }) => {
  const { data: priest } = useFetchById("priests", priestId);
  return <Text>{priest?.name}</Text>;
};

const ApproveRejectButtons = ({ mass }: { mass: IMass }) => {
  const { mutate: updateMass, isPending: isUpdating } =
    useUpdate("massAppointments");

  const handleApprove = async () => {
    try {
      if (!mass.id) return;
      await updateMass({
        id: mass.id,
        data: { status: AppointmentStatusEnum.APPROVED },
      });
      notifications.show({
        title: "Success",
        message: "Mass appointment has been approved",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        title: "Failed to update",
        message: String(e),
        color: "red",
      });
    }
  };

  const handleReject = async () => {
    try {
      if (!mass.id) return;
      await updateMass({
        id: mass.id,
        data: { status: AppointmentStatusEnum.REJECTED },
      });
      notifications.show({
        title: "Success",
        message: "Mass appointment has been rejected",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        title: "Failed to update",
        message: String(e),
        color: "red",
      });
    }
  };

  if (mass.status !== AppointmentStatusEnum.PENDING) {
    return null;
  }

  return (
    <Group justify="center">
      <Tooltip label="Approve">
        <ActionIcon
          variant="filled"
          color="green"
          onClick={handleApprove}
          loading={isUpdating}
        >
          <IconCheck />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Reject">
        <ActionIcon
          variant="filled"
          color="red"
          onClick={handleReject}
          loading={isUpdating}
        >
          <IconX />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};

const MassPage = () => {
  const { data: masses = [], isLoading } = useFetchAll("massAppointments");

  return (
    <PageContent>
      <CustomDatatable
        title="Mass Appointments"
        fetching={isLoading}
        records={masses}
        columns={[
          { accessor: "name" },
          { accessor: "description" },
          { accessor: "date" },
          { accessor: "time" },
          { accessor: "place" },
          {
            accessor: "date",
            title: "Day",
            render: (mass) => {
              const { date } = mass as IMass;
              return <Text>{dayjs(date).format("dddd")}</Text>;
            },
          },
          {
            accessor: "priestId",
            title: "Priest",
            render: (mass) => {
              const { priestId } = mass as IMass;
              return <Priest priestId={priestId} />;
            },
          },
          {
            accessor: "status",
            render: (mass) => {
              const { status } = mass as IMass;
              return <StatusBadge status={status} />;
            },
          },
          {
            accessor: "",
            title: "Actions",

            textAlign: "center",

            render: (mass) => (
              <ApproveRejectButtons mass={mass as unknown as IMass} />
            ),
          },
        ]}
      />
    </PageContent>
  );
};

export default MassPage;
