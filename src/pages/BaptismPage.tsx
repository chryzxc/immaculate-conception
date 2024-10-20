import { ActionIcon, Group, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useFetchAll, useUpdate } from "../hooks/useFirebaseFetcher";

import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import CustomDatatable from "../components/CustomDatable";
import PageContent from "../components/PageContent";
import StatusBadge from "../components/StatusBadge";
import { IBaptism } from "../database";
import { AppointmentStatusEnum } from "../enums";

const ApproveRejectButtons = ({ baptism }: { baptism: IBaptism }) => {
  const { mutate: updateBaptism, isPending: isUpdating } =
    useUpdate("baptismAppointment");

  const handleApprove = async () => {
    try {
      if (!baptism.id) return;
      await updateBaptism({
        id: baptism.id,
        data: { status: AppointmentStatusEnum.APPROVED },
      });
      notifications.show({
        title: "Success",
        message: "Baptism appointment has been approved",
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
      if (!baptism.id) return;
      await updateBaptism({
        id: baptism.id,
        data: { status: AppointmentStatusEnum.REJECTED },
      });
      notifications.show({
        title: "Success",
        message: "Baptism appointment has been rejected",
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

  if (baptism.status !== AppointmentStatusEnum.PENDING) {
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

const BaptismPage = () => {
  const { data: baptismes = [], isLoading } = useFetchAll("baptismAppointment");

  return (
    <PageContent>
      <CustomDatatable
        title="Baptism Appointments"
        fetching={isLoading}
        records={baptismes}
        columns={[
          { accessor: "child_sName", title: "Child's Name" },
          { accessor: "mother_sName", title: "Mother's Name" },
          { accessor: "father_sName", title: "Father's Name" },
          { accessor: "birthdate", title: "Date of birth" },
          { accessor: "birthPlace", title: "Birth place" },
          {
            accessor: "parentsContactNumber",
            title: "Contact Number",
          },
          {
            accessor: "baptismDate",
            title: "Date of baptism",
            render: (baptism) => {
              const { baptismDate } = baptism as IBaptism;
              return <Text>{dayjs(baptismDate).format("dddd")}</Text>;
            },
          },
          { accessor: "baptismSponsors", title: "Sponsors" },

          {
            accessor: "status",
            render: (baptism) => {
              const { status } = baptism as IBaptism;
              return <StatusBadge status={status} />;
            },
          },
          {
            accessor: "",
            title: "Actions",

            textAlign: "center",

            render: (baptism) => (
              <ApproveRejectButtons baptism={baptism as unknown as IBaptism} />
            ),
          },
        ]}
      />
    </PageContent>
  );
};

export default BaptismPage;
