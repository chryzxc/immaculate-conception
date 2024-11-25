import { Stack, Tabs, Text } from "@mantine/core";
import { useFetchAll, useUpdate } from "../hooks/useFirebaseFetcher";

import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import CustomDatatable from "../components/CustomDatable";
import PageContent from "../components/PageContent";
import StatusBadge from "../components/StatusBadge";
import {
  LabeledContent,
  TableApproveRejectButtons,
  TableReadyButton,
} from "../components/TableActions";
import {
  IConfirmationAppointments,
  IConfirmationRequestForm,
  IRequestFormRelease,
} from "../database";
import { RequestFormStatusEnum, StatusEnum } from "../enums";

enum TabEnum {
  Appointment = "appointment",
  RequestForm = "request-form",
}

const ApproveRejectButtons = ({
  confirmation,
}: {
  confirmation: IConfirmationAppointments;
}) => {
  const { mutate: updateConfirmation, isPending: isUpdating } = useUpdate(
    "confirmationAppointment"
  );

  const handleApprove = async () => {
    try {
      if (!confirmation.id) return;
      await updateConfirmation({
        id: confirmation.id,
        data: { status: StatusEnum.APPROVED },
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
        data: { status: StatusEnum.REJECTED },
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

  return (
    <TableApproveRejectButtons
      type="ConfirmationAppointment"
      userId={confirmation.userId}
      status={confirmation.status}
      loading={isUpdating}
      onApprove={handleApprove}
      onReject={handleReject}
    />
  );
};

const ConfirmationPage = () => {
  const {
    data: confirmationAppointments = [],
    isLoading: isLoadingAppointments,
  } = useFetchAll("confirmationAppointment");

  const {
    data: confirmationRequestForms = [],
    isLoading: isLoadingRequestForm,
  } = useFetchAll("confirmationRequestForm");

  const {
    mutate: updateConfirmationRequstForm,
    isPending: isUpdatingRequestForm,
  } = useUpdate("confirmationRequestForm");

  const updateRequestFormStatus = async (
    id: string,
    status: RequestFormStatusEnum,
    otherData?: IRequestFormRelease
  ) => {
    try {
      if (!id) return;
      await updateConfirmationRequstForm({
        id,
        data: { status, ...otherData },
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
      <Tabs defaultValue={TabEnum.Appointment}>
        <Tabs.List>
          <Tabs.Tab value={TabEnum.Appointment}>Appointment</Tabs.Tab>
          <Tabs.Tab value={TabEnum.RequestForm}>Request Form</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value={TabEnum.Appointment}>
          <CustomDatatable
            title="Confirmation Appointments"
            fetching={isLoadingAppointments}
            records={confirmationAppointments}
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
                  const { baptismDate } =
                    confirmation as IConfirmationAppointments;
                  return <Text>{dayjs(baptismDate).format("dddd")}</Text>;
                },
              },
              { accessor: "sponsorName", title: "Sponsor" },

              {
                accessor: "status",
                width: 120,
                render: (confirmation) => {
                  const { status } = confirmation as IConfirmationAppointments;
                  return <StatusBadge status={status} />;
                },
              },
              {
                accessor: "",
                title: "Actions",
                width: 120,
                textAlign: "center",

                render: (confirmation) => (
                  <ApproveRejectButtons
                    confirmation={
                      confirmation as unknown as IConfirmationAppointments
                    }
                  />
                ),
              },
            ]}
          />
        </Tabs.Panel>

        <Tabs.Panel value={TabEnum.RequestForm}>
          <CustomDatatable
            title="Confirmation Request Forms"
            fetching={isLoadingRequestForm}
            records={confirmationRequestForms}
            columns={[
              { accessor: "name", title: "Name" },
              { accessor: "mother", title: "Mother's Name" },
              { accessor: "father", title: "Father's Name" },

              {
                accessor: "contactNumber",
                title: "Contact Number",
              },
              {
                accessor: "dateOfConfirmation",
                title: "Date of Confirmation",
                render: (confirmation) => {
                  const { dateOfConfirmation } =
                    confirmation as IConfirmationRequestForm;
                  return (
                    <Text>{dayjs(dateOfConfirmation).format("dddd")}</Text>
                  );
                },
              },
              { accessor: "purpose", title: "Purpose" },
              {
                accessor: "releasedTo",
                title: "Released To",
                render: (baptism) => {
                  const { releasedDate, releasedTo } =
                    baptism as IConfirmationRequestForm;
                  if (!releasedDate || !releasedTo) return null;

                  return (
                    <Text>{`${releasedTo} (${dayjs(releasedDate).format("dddd")})`}</Text>
                  );
                },
              },
              {
                accessor: "",
                title: "Actions",

                textAlign: "center",

                render: (data) => {
                  const confirmation = data as IConfirmationRequestForm;
                  return (
                    <TableReadyButton
                      drawerContent={
                        <Stack>
                          <LabeledContent
                            label="Name"
                            value={confirmation.name}
                          />
                          <LabeledContent
                            label="Mother's Name"
                            value={confirmation.mother}
                          />
                          <LabeledContent
                            label="Father's Name"
                            value={confirmation.father}
                          />
                          <LabeledContent
                            label="Contact Number"
                            value={confirmation.contactNumber}
                          />
                          <LabeledContent
                            label="Date of Confirmation"
                            value={dayjs(
                              confirmation.dateOfConfirmation
                            ).format("dddd")}
                          />
                          <LabeledContent
                            label="Purpose"
                            value={confirmation.purpose}
                          />
                          <LabeledContent
                            label="Released To"
                            value={
                              confirmation.releasedTo &&
                              confirmation.releasedDate
                                ? `${confirmation.releasedTo} (${dayjs(confirmation.releasedDate).format("dddd")})`
                                : null
                            }
                          />
                        </Stack>
                      }
                      type="ConfirmationRequestForm"
                      loading={isUpdatingRequestForm}
                      status={confirmation.status}
                      userId={confirmation.userId}
                      onSetAsCollected={(data) =>
                        updateRequestFormStatus(
                          String(confirmation.id),
                          RequestFormStatusEnum.RELEASED,
                          data
                        )
                      }
                      onSetAsReady={() =>
                        updateRequestFormStatus(
                          String(confirmation.id),
                          RequestFormStatusEnum.READY
                        )
                      }
                    />
                  );
                },
              },
            ]}
          />
        </Tabs.Panel>
      </Tabs>
    </PageContent>
  );
};

export default ConfirmationPage;
