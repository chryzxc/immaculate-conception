import { ActionIcon, Group, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useFetchAll, useUpdate } from "../hooks/useFirebaseFetcher";

import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import CustomDatatable from "../components/CustomDatable";
import PageContent from "../components/PageContent";
import StatusBadge from "../components/StatusBadge";
import { IConfirmations } from "../database";
import { AppointmentStatusEnum } from "../enums";

const ApproveRejectButtons = ({
  confirmation,
}: {
  confirmation: IConfirmations;
}) => {
  const { mutate: updateConfirmation, isPending: isUpdating } = useUpdate(
    "confirmationAppointment"
  );

  const handleApprove = async () => {
    try {
      if (!confirmation.id) return;
      await updateConfirmation({
        id: confirmation.id,
        data: { status: AppointmentStatusEnum.APPROVED },
      });
      notifications.show({
        title: "Success",
        message: "Confirmation appointment has been approved",
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
      if (!confirmation.id) return;
      await updateConfirmation({
        id: confirmation.id,
        data: { status: AppointmentStatusEnum.REJECTED },
      });
      notifications.show({
        title: "Success",
        message: "Confirmation appointment has been rejected",
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

  if (confirmation.status !== AppointmentStatusEnum.PENDING) {
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

const ConfirmationPage = () => {
  const { data: confirmationes = [], isLoading } = useFetchAll(
    "confirmationAppointment"
  );

  return (
    <PageContent>
      <CustomDatatable
        title="Confirmation Appointments"
        fetching={isLoading}
        records={confirmationes}
        columns={[
          { accessor: "name", title: "Name" },
          { accessor: "motherName", title: "Mother's Name" },
          { accessor: "fatherName", title: "Father's Name" },
          { accessor: "church", title: "Church" },
          { accessor: "birthPlace", title: "Birth place" },
          {
            accessor: "guardianNumber",
            title: "Contact Number",
          },
          {
            accessor: "baptismDate",
            title: "Date of Baptism",
            render: (confirmation) => {
              const { baptismDate } = confirmation as IConfirmations;
              return <Text>{dayjs(baptismDate).format("dddd")}</Text>;
            },
          },
          { accessor: "sponsorName", title: "Sponsor" },

          {
            accessor: "status",
            render: (confirmation) => {
              const { status } = confirmation as IConfirmations;
              return <StatusBadge status={status} />;
            },
          },
          {
            accessor: "",
            title: "Actions",

            textAlign: "center",

            render: (confirmation) => (
              <ApproveRejectButtons
                confirmation={confirmation as unknown as IConfirmations}
              />
            ),
          },
        ]}
      />
    </PageContent>
  );
};

export default ConfirmationPage;
