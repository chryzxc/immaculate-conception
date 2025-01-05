import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  useFetchAll,
  useFetchById,
  useUpdate,
} from "../hooks/useFirebaseFetcher";

import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconEdit } from "@tabler/icons-react";
import { useState } from "react";
import CustomDatatable from "../components/CustomDatable";
import PageContent from "../components/PageContent";
import StatusBadge from "../components/StatusBadge";
import {
  TableApproveRejectButtons,
  TableConfirmRejectRequestButtons,
} from "../components/TableActions";
import { IMass } from "../database";
import { PriestConfirmationStatusEnum, StatusEnum } from "../enums";
import useFilterList from "../hooks/useUserFilterList";
import useUserStore from "../store/user";
import { DataTableColumn } from "mantine-datatable";

interface IAssignPriestParams {
  priestId: string;
  sendConfirmationRequest: boolean;
}

export const PriestModal = ({
  opened,
  close,
  onConfirm,
  defaultValue,
}: {
  defaultValue?: string;
  opened: boolean;
  close: () => void;
  onConfirm: (data: {
    priestId: string;
    sendConfirmationRequest: boolean;
  }) => void;
}) => {
  const { data: priests = [] } = useFetchAll("priests");
  const [selectedPriestId, setSelectedPriestId] = useState<string | null>(null);
  const [sendConfirmationRequest, setSendConfirmationRequest] =
    useState<boolean>(false);

  const handleConfirm = () => {
    if (!selectedPriestId) return;
    onConfirm({ priestId: selectedPriestId, sendConfirmationRequest });
  };

  return (
    <Modal opened={opened} onClose={close} title="Assign a priest">
      <Stack>
        <Select
          defaultValue={defaultValue}
          label="Priest"
          placeholder="Select a priest"
          onChange={setSelectedPriestId}
          data={priests.map((priest) => ({
            value: priest.id || "",
            label: priest.name,
          }))}
        />
        <Checkbox
          checked={sendConfirmationRequest}
          onChange={(event) =>
            setSendConfirmationRequest(event.currentTarget.checked)
          }
          label="Send Priest Confirmation"
          description="When checked, the priest will receive a confirmation request before accepting the assigned mass. If left unchecked, the priest will be automatically assigned without confirmation."
        />
        <Button onClick={handleConfirm}>Confirm</Button>
      </Stack>
    </Modal>
  );
};

export const Priest = ({
  priestId,
  priestConfirmationStatus,
  onAssignPriest,
}: {
  priestId?: string | null;
  priestConfirmationStatus?: PriestConfirmationStatusEnum;
  onAssignPriest: (data: IAssignPriestParams) => void;
}) => {
  const { user } = useUserStore();
  const [opened, { open, close }] = useDisclosure(false);
  const { data: priest } = useFetchById("priests", priestId);

  const handleConfirm = (data: IAssignPriestParams) => {
    onAssignPriest(data);
    close();
  };

  if ((!priest || !priestId) && user?.isSuperAdmin)
    return (
      <>
        <PriestModal close={close} opened={opened} onConfirm={handleConfirm} />
        <Button color="primary" onClick={open} variant="light">
          Assign priest
        </Button>
      </>
    );

  const getPriestLabel = () => {
    if (!priestConfirmationStatus) return priest?.name;

    const priestLabelMapper: Record<PriestConfirmationStatusEnum, string> = {
      approved: priest?.name || "",
      pending: `Waiting for ${priest?.name} to confirm`,
      rejected: `Rejected by ${priest?.name}`,
    };
    return priestLabelMapper[priestConfirmationStatus];
  };

  const getColor = () => {
    if (!priestConfirmationStatus) return undefined;
    const colorStatus: Record<
      PriestConfirmationStatusEnum,
      string | undefined
    > = {
      approved: undefined,
      pending: "orange",
      rejected: "red",
    };
    return colorStatus[priestConfirmationStatus];
  };

  return (
    <>
      <PriestModal close={close} opened={opened} onConfirm={handleConfirm} />
      <Group justify="center">
        <Text color={getColor()}>{getPriestLabel()}</Text>
        <Tooltip label="Edit">
          <ActionIcon variant="filled" aria-label="Edit" onClick={open}>
            <IconEdit style={{ width: "70%", height: "70%" }} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </>
  );
};

const EucharisticLiturgySection = () => {
  const { user } = useUserStore();
  const { data: masses = [], isLoading } = useFetchAll("massAppointments");
  const filteredMasses = useFilterList(masses);

  const { mutate: updateMass, isPending: isUpdating } =
    useUpdate("massAppointments");

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
      title="Eucharistic Liturgy Appointments"
      fetching={isLoading}
      records={filteredMasses}
      columns={[
        { accessor: "name" },
        { accessor: "massIntentions", title: "Mass Intentions" },
        { accessor: "date" },
        { accessor: "time" },
        ...(user?.isSuperAdmin
          ? ([
              {
                accessor: "priestId",
                title: "Priest",
                textAlign: "center",
                render: (mass) => {
                  const { priestId, id, priestConfirmationStatus } =
                    mass as IMass;
                  return (
                    <Priest
                      priestConfirmationStatus={priestConfirmationStatus}
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

const MassPage = () => {
  return (
    <PageContent>
      <EucharisticLiturgySection />
    </PageContent>
  );
};

export default MassPage;
