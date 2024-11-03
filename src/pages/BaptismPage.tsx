import { ActionIcon, Group, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useFetchAll, useUpdate } from "../hooks/useFirebaseFetcher";

import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import CustomDatatable from "../components/CustomDatable";
import PageContent from "../components/PageContent";
import StatusBadge from "../components/StatusBadge";
import { IBaptism, IBaptismRequestForm } from "../database";
import { RequestFormStatusEnum, StatusEnum } from "../enums";
import { TableReadyButton } from "../components/TableActions";
import { toStandardDateFormat } from "../utils";

const ApproveRejectButtons = ({ baptism }: { baptism: IBaptism }) => {
  const { mutate: updateBaptism, isPending: isUpdating } =
    useUpdate("baptismAppointment");

  const handleApprove = async () => {
    try {
      if (!baptism.id) return;
      await updateBaptism({
        id: baptism.id,
        data: { status: StatusEnum.APPROVED },
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
        data: { status: StatusEnum.REJECTED },
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

  if (baptism.status !== StatusEnum.PENDING && !!baptism.status) {
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

  const { data: baptismRequestForms = [], isLoading: isLoadingRequestForm } =
    useFetchAll("baptismRequestForm");

  const { mutate: updateBaptismRequstForm, isPending: isUpdatingRequestForm } =
    useUpdate("baptismRequestForm");

  const updateRequestFormStatus = async (
    id: string,
    status: RequestFormStatusEnum
  ) => {
    try {
      if (!id) return;
      await updateBaptismRequstForm({
        id,
        data: { status },
      });
      notifications.show({
        title: "Success",
        message: "Request form updated",
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
              return <Text>{toStandardDateFormat(baptismDate, true)}</Text>;
            },
          },
          { accessor: "baptismSponsors", title: "Sponsors" },

          {
            accessor: "status",
            width: 120,
            render: (baptism) => {
              const { status } = baptism as IBaptism;
              return <StatusBadge status={status} />;
            },
          },
          {
            accessor: "",
            title: "Actions",
            width: 120,
            textAlign: "center",

            render: (baptism) => (
              <ApproveRejectButtons baptism={baptism as unknown as IBaptism} />
            ),
          },
        ]}
      />
      <CustomDatatable
        title="Baptism Request Forms"
        fetching={isLoadingRequestForm}
        records={baptismRequestForms}
        columns={[
          { accessor: "name", title: "Name" },
          { accessor: "mother", title: "Mother's Name" },
          { accessor: "father", title: "Father's Name" },

          {
            accessor: "contactNumber",
            title: "Contact Number",
          },
          {
            accessor: "dateofBaptism",
            title: "Date of Baptism",
            render: (baptism) => {
              const { dateOfBaptism } = baptism as IBaptismRequestForm;
              return <Text>{dayjs(dateOfBaptism).format("dddd")}</Text>;
            },
          },
          { accessor: "purpose", title: "Purpose" },
          {
            accessor: "",
            title: "Actions",

            textAlign: "center",

            render: (data) => {
              const baptism = data as IBaptismRequestForm;
              return (
                <TableReadyButton
                  type="BaptismRequestForm"
                  userId={baptism.userId}
                  loading={isUpdatingRequestForm}
                  status={baptism.status}
                  onSetAsCollected={() =>
                    updateRequestFormStatus(
                      String(baptism.id),
                      RequestFormStatusEnum.COLLECTED
                    )
                  }
                  onSetAsReady={() =>
                    updateRequestFormStatus(
                      String(baptism.id),
                      RequestFormStatusEnum.READY
                    )
                  }
                />
              );
            },
          },
        ]}
      />
    </PageContent>
  );
};

export default BaptismPage;
