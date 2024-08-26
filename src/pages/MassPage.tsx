import { ActionIcon, Badge, Group, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useFetchAll, useFetchById } from "../hooks/useFirebaseFetcher";

import CustomDatatable from "../components/CustomDatable";
import { IMass } from "../database";
import { MassAppointmentStatusEnum } from "../enums";
import PageContent from "../components/PageContent";
import dayjs from "dayjs";

const StatusBadge = ({
  status,
}: {
  status?: MassAppointmentStatusEnum | null;
}) => {
  const colorMapping: Record<MassAppointmentStatusEnum, string> = {
    approved: "green",
    pending: "orange",
    rejected: "red",
  };

  if (!status) return null;

  return <Badge color={colorMapping[status]}>{String(status)}</Badge>;
};

const Priest = ({ priestId }: { priestId?: string | null }) => {
  const { data: priest } = useFetchById("priests", priestId);
  return <Text>{priest?.name}</Text>;
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
            render: ({ date }) => <Text>{dayjs(date).format("dddd")}</Text>,
          },
          {
            accessor: "priestId",
            title: "Priest",
            render: ({ priestId }) => <Priest priestId={priestId} />,
          },
          {
            accessor: "status",
            render: ({ status }: IMass) => <StatusBadge status={status} />,
          },
          {
            accessor: "",
            title: "Actions",

            textAlign: "center",

            render: ({ status }: IMass) => (
              <Group justify="center">
                <Tooltip label="Approve">
                  <ActionIcon variant="filled" color="green">
                    <IconCheck />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Reject">
                  <ActionIcon variant="filled" color="red">
                    <IconX />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ),
          },
        ]}
      />
    </PageContent>
  );
};

export default MassPage;
