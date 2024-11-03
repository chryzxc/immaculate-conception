import dayjs from "dayjs";

export const toStandardDateFormat = (
  date?: string | Date,
  withoutTime: boolean = false
) => {
  if (!date) return "";
  return dayjs(date).format(`MMMM DD, YYYY ${withoutTime ? "" : "h:mm A"}`);
};
export function separatePascalCase(text: string): string {
  return text.replace(/([a-z])([A-Z])/g, "$1 $2");
}
