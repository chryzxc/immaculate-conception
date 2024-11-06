import { Text } from "@mantine/core";
import { useFetchAll, useUpdate } from "../hooks/useFirebaseFetcher";

import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import CustomDatatable from "../components/CustomDatable";
import PageContent from "../components/PageContent";
import StatusBadge from "../components/StatusBadge";
import {
  TableApproveRejectButtons,
  TableReadyButton,
} from "../components/TableActions";
import { IChurchLiturgy, IFuneralRequestForm, IMass } from "../database";
import { RequestFormStatusEnum, StatusEnum } from "../enums";
import { toStandardDateFormat } from "../utils";
import { Priest } from "./MassPage";

const ChurchLiturgySection = () => {
  const { data: masses = [], isLoading } = useFetchAll(
    "churchLiturgyAppointment"
  );

  const { mutate: updateMass, isPending: isUpdating } = useUpdate(
    "churchLiturgyAppointment"
  );

  const handleApprove = async (massId: string) => {
    try {
      if (!massId) return;
      await updateMass({
        id: massId,
        data: { status: StatusEnum.APPROVED },
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

  const handleReject = async (massId: string) => {
    try {
      if (!massId) return;
      await updateMass({
        id: massId,
        data: { status: StatusEnum.REJECTED },
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

  const assignPriest = async (massId: string, priestId: string) => {
    try {
      await updateMass({
        id: massId,
        data: { priestId },
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
      records={masses}
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
        {
          accessor: "priestId",
          title: "Priest",
          textAlign: "center",
          render: (mass) => {
            const { priestId, id } = mass as IChurchLiturgy;
            return (
              <Priest
                priestId={priestId}
                onAssignPriest={(priestId) =>
                  assignPriest(String(id), priestId)
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
      ]}
    />
  );
};

const HouseLiturgySection = () => {
  const { data: masses = [], isLoading } = useFetchAll(
    "houseLiturgyAppointment"
  );

  const { mutate: updateMass, isPending: isUpdating } = useUpdate(
    "houseLiturgyAppointment"
  );

  const handleApprove = async (massId: string) => {
    try {
      if (!massId) return;
      await updateMass({
        id: massId,
        data: { status: StatusEnum.APPROVED },
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

  const handleReject = async (massId: string) => {
    try {
      if (!massId) return;
      await updateMass({
        id: massId,
        data: { status: StatusEnum.REJECTED },
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

  const assignPriest = async (massId: string, priestId: string) => {
    try {
      await updateMass({
        id: massId,
        data: { priestId },
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
      records={masses}
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
        {
          accessor: "priestId",
          title: "Priest",
          textAlign: "center",
          render: (mass) => {
            const { priestId, id } = mass as IMass;
            return (
              <Priest
                priestId={priestId}
                onAssignPriest={(priestId) =>
                  assignPriest(String(id), priestId)
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
    status: RequestFormStatusEnum
  ) => {
    try {
      if (!id) return;
      await updateFuneralRequstForm({
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
                onSetAsCollected={() =>
                  updateRequestFormStatus(
                    String(funeral.id),
                    RequestFormStatusEnum.COLLECTED
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
  return (
    <PageContent>
      <ChurchLiturgySection />
      <HouseLiturgySection />
      <FuneralRequestFormSection />
    </PageContent>
  );
};

export default FuneralPage;
