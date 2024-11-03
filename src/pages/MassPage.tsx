import { Button, Modal, Select, Stack, Text } from "@mantine/core";
import {
  useFetchAll,
  useFetchById,
  useUpdate,
} from "../hooks/useFirebaseFetcher";

import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import { useState } from "react";
import CustomDatatable from "../components/CustomDatable";
import PageContent from "../components/PageContent";
import StatusBadge from "../components/StatusBadge";
import { TableApproveRejectButtons } from "../components/TableActions";
import { IMass } from "../database";
import { StatusEnum } from "../enums";

export const PriestModal = ({
  opened,
  close,
  onConfirm,
}: {
  opened: boolean;
  close: () => void;
  onConfirm: (selectedPriestId: string) => void;
}) => {
  const { data: priests = [] } = useFetchAll("priests");
  const [selectedPriestId, setSelectedPriestId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!selectedPriestId) return;
    onConfirm(selectedPriestId);
  };

  return (
    <Modal opened={opened} onClose={close} title="Assign a priest">
      <Stack>
        <Select
          label="Priest"
          placeholder="Select a priest"
          onChange={setSelectedPriestId}
          data={priests.map((priest) => ({
            value: priest.id || "",
            label: priest.name,
          }))}
        />
        <Button onClick={handleConfirm}>Confirm</Button>
      </Stack>
    </Modal>
  );
};

export const Priest = ({
  priestId,
  onAssignPriest,
}: {
  priestId?: string | null;
  onAssignPriest: (priestId: string) => void;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const { data: priest } = useFetchById("priests", priestId);

  if (!priestId)
    return (
      <>
        <PriestModal close={close} opened={opened} onConfirm={onAssignPriest} />
        <Button color="primary" onClick={open} variant="light">
          Assign priest
        </Button>
      </>
    );

  return <Text>{priest?.name}</Text>;
};

const EucharisticLiturgySection = () => {
  const { data: masses = [], isLoading } = useFetchAll("massAppointments");

  const { mutate: updateMass, isPending: isUpdating } =
    useUpdate("massAppointments");

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
      title="Eucharistic Liturgy Appointments"
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
                type="MassAppointment"
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

const MassPage = () => {
  return (
    <PageContent>
      <EucharisticLiturgySection />
    </PageContent>
  );
};

export default MassPage;
