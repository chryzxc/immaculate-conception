import dayjs from "dayjs";

export const toStandardDateFormat = (date?: string | Date) => {
  if (!date) return "";
  return dayjs(date).format("MMMM DD, YYYY h:mm a");
};
