import { Tabs, Text } from "@mantine/core";
import { useFetchAll, useUpdate } from "../hooks/useFirebaseFetcher";

import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import CustomDatatable from "../components/CustomDatable";
import PageContent from "../components/PageContent";
import StatusBadge from "../components/StatusBadge";
import {
  TableApproveRejectButtons,
  TableConfirmRejectRequestButtons,
  TableReadyButton,
} from "../components/TableActions";
import {
  IChurchLiturgy,
  IFuneralRequestForm,
  IMass,
  IRequestFormRelease,
} from "../database";
import {
  PriestConfirmationStatusEnum,
  RequestFormStatusEnum,
  StatusEnum,
} from "../enums";
import { toStandardDateFormat } from "../utils";
import { Priest } from "./MassPage";
import useUserStore from "../store/user";
import useFilterList from "../hooks/useUserFilterList";
import { DataTableColumn } from "mantine-datatable";

enum TabEnum {
  ChurchLiturgy = "church-liturgy-appointment",
  HouseLiturgy = " house-liturgy-appointment",
  FuneralRequestForm = "funeral-request-form",
}

const ChurchLiturgySection = () => {
  const { user } = useUserStore();
  const { data: masses = [], isLoading } = useFetchAll(
    "churchLiturgyAppointment"
  );

  const { mutate: updateMass, isPending: isUpdating } = useUpdate(
    "churchLiturgyAppointment"
  );

  const filteredMasses = useFilterList(masses);

  const handleApprove = async (massId: string, isConfirmation?: boolean) => {
    try {
      if (!massId) return;
      await updateMass({
        id: massId,
        data: isConfirmation
          ? { priestConfirmationStatus: PriestConfirmationStatusEnum.APPROVED }
          : { status: StatusEnum.APPROVED },
      });
      notifications.show({
        title: "Success",
        message: "Appointment has been approved",
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

  const handleReject = async (massId: string, isConfirmation?: boolean) => {
    try {
      if (!massId) return;
      await updateMass({
        id: massId,
        data: isConfirmation
          ? { priestConfirmationStatus: PriestConfirmationStatusEnum.REJECTED }
          : { status: StatusEnum.REJECTED },
      });
      notifications.show({
        title: "Success",
        message: "Appointment has been rejected",
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

  const assignPriest = async (
    massId: string,
    priestId: string,
    sendRequest: boolean
  ) => {
    try {
      await updateMass({
        id: massId,
        data: {
          priestId,
          priestConfirmationStatus: sendRequest
            ? PriestConfirmationStatusEnum.PENDING
            : PriestConfirmationStatusEnum.APPROVED,
        },
      });
      notifications.show({
        title: "Success",
        message: "Priest has been assigned",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        title: "Failed to assign priest",
        message: String(e),
        color: "red",
      });
    }
  };

  return (
    <CustomDatatable
      title="Church Liturgy Appointments"
      fetching={isLoading}
      records={filteredMasses}
      columns={[
        { accessor: "appointment" },
        { accessor: "fullName" },
        { accessor: "place" },
        { accessor: "time" },
        {
          accessor: "date",
          title: "Day",
          render: (mass) => {
            const { date } = mass as IChurchLiturgy;
            return <Text>{dayjs(date).format("dddd")}</Text>;
          },
        },
        ...(user?.isSuperAdmin
          ? ([
              {
                accessor: "priestId",
                title: "Priest",
                textAlign: "center",
                render: (mass) => {
                  const { priestId, id } = mass as IChurchLiturgy;
                  return (
                    <Priest
                      priestId={priestId}
                      onAssignPriest={({ priestId, sendConfirmationRequest }) =>
                        assignPriest(
                          String(id),
                          priestId,
                          sendConfirmationRequest
                        )
                      }
                    />
                  );
                },
              },
              {
                accessor: "status",
                textAlign: "center",
                render: (mass) => {
                  const { status } = mass as IChurchLiturgy;
                  return <StatusBadge status={status} />;
                },
              },
              {
                accessor: "",
                title: "Actions",

                textAlign: "center",

                render: (data) => {
                  const mass = data as IChurchLiturgy;
                  return (
                    <TableApproveRejectButtons
                      type="ChurchLiturgyAppointment"
                      userId={mass.userId}
                      loading={isUpdating}
                      status={mass.status}
                      onApprove={() => handleApprove(String(mass.id))}
                      onReject={() => handleReject(String(mass.id))}
                    />
                  );
                },
              },
            ] as DataTableColumn<unknown>[])
          : ([
              {
                accessor: "",
                title: "Actions",
                textAlign: "center",
                render: (data) => {
                  const mass = data as IMass;
                  return (
                    <TableConfirmRejectRequestButtons
                      loading={isUpdating}
                      status={mass.priestConfirmationStatus}
                      onApprove={() => handleApprove(String(mass.id), true)}
                      onReject={() => handleReject(String(mass.id), true)}
                    />
                  );
                },
              },
            ] as DataTableColumn<unknown>[])),
      ]}
    />
  );
};

const HouseLiturgySection = () => {
  const { user } = useUserStore();
  const { data: masses = [], isLoading } = useFetchAll(
    "houseLiturgyAppointment"
  );

  const { mutate: updateMass, isPending: isUpdating } = useUpdate(
    "houseLiturgyAppointment"
  );

  const filteredMasses = useFilterList(masses);

  const handleApprove = async (massId: string, isConfirmation?: boolean) => {
    try {
      if (!massId) return;
      await updateMass({
        id: massId,
        data: isConfirmation
          ? { priestConfirmationStatus: PriestConfirmationStatusEnum.APPROVED }
          : { status: StatusEnum.APPROVED },
      });
      notifications.show({
        title: "Success",
        message: "Appointment has been approved",
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

  const handleReject = async (massId: string, isConfirmation?: boolean) => {
    try {
      if (!massId) return;
      await updateMass({
        id: massId,
        data: isConfirmation
          ? { priestConfirmationStatus: PriestConfirmationStatusEnum.REJECTED }
          : { status: StatusEnum.REJECTED },
      });
      notifications.show({
        title: "Success",
        message: "Appointment has been rejected",
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

  const assignPriest = async (
    massId: string,
    priestId: string,
    sendRequest: boolean
  ) => {
    try {
      await updateMass({
        id: massId,
        data: {
          priestId,
          priestConfirmationStatus: sendRequest
            ? PriestConfirmationStatusEnum.PENDING
            : PriestConfirmationStatusEnum.APPROVED,
        },
      });
      notifications.show({
        title: "Success",
        message: "Priest has been assigned",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        title: "Failed to assign priest",
        message: String(e),
        color: "red",
      });
    }
  };

  return (
    <CustomDatatable
      title="House Liturgy Appointments"
      fetching={isLoading}
      records={filteredMasses}
      columns={[
        { accessor: "appointment" },
        { accessor: "fullName" },
        { accessor: "place" },
        { accessor: "time" },
        {
          accessor: "date",
          title: "Day",
          render: (mass) => {
            const { date } = mass as IMass;
            return <Text>{dayjs(date).format("dddd")}</Text>;
          },
        },
        ...(user?.isSuperAdmin
          ? ([
              {
                accessor: "priestId",
                title: "Priest",
                textAlign: "center",
                render: (mass) => {
                  const { priestId, id } = mass as IMass;

                  return (
                    <Priest
                      priestId={priestId}
                      onAssignPriest={({ priestId, sendConfirmationRequest }) =>
                        assignPriest(
                          String(id),
                          priestId,
                          sendConfirmationRequest
                        )
                      }
                    />
                  );
                },
              },
              {
                accessor: "status",
                textAlign: "center",
                render: (mass) => {
                  const { status } = mass as IMass;
                  return <StatusBadge status={status} />;
                },
              },
              {
                accessor: "",
                title: "Actions",

                textAlign: "center",

                render: (data) => {
                  const mass = data as IMass;
                  return (
                    <TableApproveRejectButtons
                      type="HouseLiturgyAppointment"
                      userId={mass.userId}
                      loading={isUpdating}
                      status={mass.status}
                      onApprove={() => handleApprove(String(mass.id))}
                      onReject={() => handleReject(String(mass.id))}
                    />
                  );
                },
              },
            ] as DataTableColumn<unknown>[])
          : ([
              {
                accessor: "",
                title: "Actions",
                textAlign: "center",
                render: (data) => {
                  const mass = data as IMass;
                  return (
                    <TableConfirmRejectRequestButtons
                      loading={isUpdating}
                      status={mass.priestConfirmationStatus}
                      onApprove={() => handleApprove(String(mass.id), true)}
                      onReject={() => handleReject(String(mass.id), true)}
                    />
                  );
                },
              },
            ] as DataTableColumn<unknown>[])),
      ]}
    />
  );
};

const FuneralRequestFormSection = () => {
  const { data: funeralRequestForms = [], isLoading: isLoadingRequestForm } =
    useFetchAll("funeralRequestForm");

  const { mutate: updateFuneralRequstForm, isPending: isUpdatingRequestForm } =
    useUpdate("funeralRequestForm");

  const updateRequestFormStatus = async (
    id: string,
    status: RequestFormStatusEnum,
    otherData?: IRequestFormRelease
  ) => {
    try {
      if (!id) return;
      await updateFuneralRequstForm({
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
    <CustomDatatable
      title="Funeral Request Forms"
      fetching={isLoadingRequestForm}
      records={funeralRequestForms}
      columns={[
        { accessor: "nameOfTheDeceased", title: "Name of Deceased" },
        { accessor: "nameOfInformant", title: "Name of Informant" },
        { accessor: "phoneNumberOfInformant", title: "Informant Contact" },
        { accessor: "address", width: 200 },

        {
          accessor: "dateOfBirth",
          title: "Date of Birth",
          render: (funeral) => {
            const { dateOfBirth } = funeral as IFuneralRequestForm;
            return <Text>{toStandardDateFormat(dateOfBirth, true)}</Text>;
          },
        },
        { accessor: "causeOfDeath", title: "Cause of Death" },

        {
          accessor: "dateOfBurial",
          title: "Date of Burial",
          render: (funeral) => {
            const { dateOfBurial } = funeral as IFuneralRequestForm;
            return <Text>{toStandardDateFormat(dateOfBurial, true)}</Text>;
          },
        },
        {
          accessor: "dateOfDeath",
          title: "Date of Death",
          render: (funeral) => {
            const { dateOfDeath } = funeral as IFuneralRequestForm;
            return <Text>{toStandardDateFormat(dateOfDeath, true)}</Text>;
          },
        },
        {
          accessor: "releasedTo",
          title: "Released To",
          render: (baptism) => {
            const { releasedDate, releasedTo } = baptism as IFuneralRequestForm;
            if (!releasedDate || !releasedTo) return null;

            return (
              <Text>{`${releasedTo} (${dayjs(releasedDate).format("dddd")})`}</Text>
            );
          },
        },
        {
          accessor: "",
          title: "Actions",
          width: 120,
          textAlign: "center",

          render: (data) => {
            const funeral = data as IFuneralRequestForm;
            return (
              <TableReadyButton
                type="FuneralRequestForm"
                userId={funeral.userId}
                loading={isUpdatingRequestForm}
                status={funeral.status}
                onSetAsCollected={(data) =>
                  updateRequestFormStatus(
                    String(funeral.id),
                    RequestFormStatusEnum.RELEASED,
                    data
                  )
                }
                onSetAsReady={() =>
                  updateRequestFormStatus(
                    String(funeral.id),
                    RequestFormStatusEnum.READY
                  )
                }
              />
            );
          },
        },
      ]}
    />
  );
};

const FuneralPage = () => {
  const { user } = useUserStore();

  return (
    <PageContent>
      <Tabs defaultValue={TabEnum.ChurchLiturgy}>
        <Tabs.List>
          <Tabs.Tab value={TabEnum.ChurchLiturgy}>Church Liturgy</Tabs.Tab>
          <Tabs.Tab value={TabEnum.HouseLiturgy}>House Liturgy</Tabs.Tab>
          {user?.isSuperAdmin && (
            <Tabs.Tab value={TabEnum.FuneralRequestForm}>
              Funeral Request Forms
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value={TabEnum.ChurchLiturgy}>
          <ChurchLiturgySection />
        </Tabs.Panel>

        <Tabs.Panel value={TabEnum.HouseLiturgy}>
          <HouseLiturgySection />
        </Tabs.Panel>

        {user?.isSuperAdmin && (
          <Tabs.Panel value={TabEnum.FuneralRequestForm}>
            <FuneralRequestFormSection />
          </Tabs.Panel>
        )}
      </Tabs>
    </PageContent>
  );
};

export default FuneralPage;
