import { Badge } from "@mantine/core";
import { AppointmentStatusEnum } from "../enums";

const StatusBadge = ({ status }: { status?: AppointmentStatusEnum | null }) => {
  const colorMapping: Record<AppointmentStatusEnum, string> = {
    approved: "green",
    pending: "orange",
    rejected: "red",
  };

  if (!status) return null;

  return <Badge color={colorMapping[status]}>{String(status)}</Badge>;
};

export default StatusBadge;
