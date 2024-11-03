import { Badge } from "@mantine/core";
import { StatusEnum } from "../enums";

const StatusBadge = ({ status }: { status?: StatusEnum | null }) => {
  const colorMapping: Record<StatusEnum, string> = {
    approved: "green",
    pending: "orange",
    rejected: "red",
  };

  if (!status)
    return <Badge color={colorMapping.pending}>{StatusEnum.PENDING}</Badge>;

  return <Badge color={colorMapping[status]}>{String(status)}</Badge>;
};

export default StatusBadge;
