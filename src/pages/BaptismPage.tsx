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
  IBaptism,
  IBaptismRequestForm,
  IRequestFormRelease,
} from "../database";
import { RequestFormStatusEnum, StatusEnum } from "../enums";
import { toStandardDateFormat } from "../utils";

enum TabEnum {
  Appointment = "appointment",
  RequestForm = "request-form",
}

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

  return (
    <TableApproveRejectButtons
      type="BaptismAppointment"
      userId={baptism.userId}
      status={baptism.status}
      loading={isUpdating}
      onApprove={handleApprove}
      onReject={handleReject}
    />
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
    status: RequestFormStatusEnum,
    otherData?: IRequestFormRelease
  ) => {
    try {
      if (!id) return;
      await updateBaptismRequstForm({
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
            title="Baptism Appointments"
            fetching={isLoading}
            records={baptismes}
            columns={[
              { accessor: "child_sName", title: "Child's Name" },
              { accessor: "mother_sName", title: "Mother's Name" },
              { accessor: "father_sName", title: "Father's Name" },

              {
                accessor: "birthdate",
                title: "Date of birth",

                render: (baptism) => {
                  const { birthdate } = baptism as IBaptism;
                  return <Text>{toStandardDateFormat(birthdate, true)}</Text>;
                },
              },
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
                  <ApproveRejectButtons
                    baptism={baptism as unknown as IBaptism}
                  />
                ),
              },
            ]}
          />
        </Tabs.Panel>

        <Tabs.Panel value={TabEnum.RequestForm}>
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
                accessor: "releasedTo",
                title: "Released To",
                render: (baptism) => {
                  const { releasedDate, releasedTo } =
                    baptism as IBaptismRequestForm;
                  if (!releasedDate || !releasedTo) return null;

                  return (
                    <Text>{`${releasedTo} (${toStandardDateFormat(releasedDate)})`}</Text>
                  );
                },
              },
              {
                accessor: "",
                title: "Actions",

                textAlign: "center",

                render: (data) => {
                  const baptism = data as IBaptismRequestForm;

                  return (
                    <TableReadyButton
                      drawerContent={
                        <Stack>
                          <LabeledContent label="Name" value={baptism.name} />
                          <LabeledContent
                            label="Mother's Name"
                            value={baptism.mother}
                          />
                          <LabeledContent
                            label="Father's Name"
                            value={baptism.father}
                          />
                          <LabeledContent
                            label="Contact Number"
                            value={baptism.contactNumber}
                          />
                          <LabeledContent
                            label="Date of Baptism"
                            value={String(
                              dayjs(baptism.dateOfBaptism).format("dddd")
                            )}
                          />
                          <LabeledContent
                            label="Purpose"
                            value={baptism.purpose}
                          />
                        </Stack>
                      }
                      type="BaptismRequestForm"
                      userId={baptism.userId}
                      loading={isUpdatingRequestForm}
                      status={baptism.status}
                      onSetAsCollected={(data) =>
                        updateRequestFormStatus(
                          String(baptism.id),
                          RequestFormStatusEnum.RELEASED,
                          data
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
        </Tabs.Panel>
      </Tabs>
    </PageContent>
  );
};

export default BaptismPage;
