import { IPriestAppointment } from "../database";
import { PriestConfirmationStatusEnum } from "../enums";
import useUserStore, { IUser } from "../store/user";
import { useSearchByKey } from "./useFirebaseFetcher";

export const filterListByPriestUserId = (
  data: unknown[],
  user: IUser | null,
  priestId: string
) => {
  const filteredMasses = user?.isSuperAdmin
    ? data
    : data.filter((element) => {
        const rowData = element as IPriestAppointment;
        if (!!rowData && typeof rowData === "object" && "priestId" in rowData) {
          return (
            rowData.priestId === priestId &&
            rowData.priestConfirmationStatus !==
              PriestConfirmationStatusEnum.REJECTED
          );
        }
        return false;
      });

  return filteredMasses;
};

const useFilterList = (data: unknown[]) => {
  const { user } = useUserStore();
  const { data: priest } = useSearchByKey(
    "priests",
    "authId",
    String(user?.id)
  );
  return filterListByPriestUserId(data, user, String(priest?.[0]?.id));
};

export default useFilterList;
