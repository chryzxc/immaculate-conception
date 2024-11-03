import "@mantine/tiptap/styles.css";

import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import {
  useCreate,
  useDelete,
  useFetchAll,
  useUpdate,
} from "../hooks/useFirebaseFetcher";
import { DatePickerInput } from "@mantine/dates";
import CustomDatatable from "../components/CustomDatable";
import {
  IWeddingAnnouncement,
  IWeddingAppointment,
  IWeddingRequestForm,
} from "../database";
import PageContent from "../components/PageContent";
import TextEditor from "../components/TextEditor";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { toStandardDateFormat } from "../utils";
import dayjs from "dayjs";
import StatusBadge from "../components/StatusBadge";
import { RequestFormStatusEnum, StatusEnum } from "../enums";
import {
  TableApproveRejectButtons,
  TableReadyButton,
} from "../components/TableActions";

interface IWeddingAnnouncementDrawer {
  opened: boolean;
  onClose: () => void;
  selectedWeddingAnnouncement: IWeddingAnnouncement | null;
}

export const isNotExpired = (expirationDate: string | Date) =>
  expirationDate > new Date().toISOString();

const ApproveRejectButtons = ({
  wedding,
}: {
  wedding: IWeddingAppointment;
}) => {
  const { mutate: updateWedding, isPending: isUpdating } =
    useUpdate("weddingAppointment");

  const handleApprove = async () => {
    try {
      if (!wedding.id) return;
      await updateWedding({
        id: wedding.id,
        data: { status: StatusEnum.APPROVED },
      });
      notifications.show({
        title: "Success",
        message: "Wedding appointment has been approved",
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

  const handleReject = async () => {
    try {
      if (!wedding.id) return;
      await updateWedding({
        id: wedding.id,
        data: { status: StatusEnum.REJECTED },
      });
      notifications.show({
        title: "Success",
        message: "Wedding appointment has been rejected",
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
    <TableApproveRejectButtons
      type="WeddingAppointment"
      userId={wedding.userId}
      status={wedding.status}
      loading={isUpdating}
      onApprove={handleApprove}
      onReject={handleReject}
    />
  );
};

const WeddingAnnouncementDrawer = ({
  onClose,
  opened,
  selectedWeddingAnnouncement,
}: IWeddingAnnouncementDrawer) => {
  const { mutate: addWeddingAnnouncement, isPending: isAdding } = useCreate(
    "weddingAnnouncements"
  );
  const { mutate: updateWeddingAnnouncement, isPending: isUpdating } =
    useUpdate("weddingAnnouncements");

  const [content, setContent] = useState<string>(
    selectedWeddingAnnouncement?.content || ""
  );
  const [expirationDate, setExpirationDate] = useState<Date | null>(
    selectedWeddingAnnouncement
      ? new Date(selectedWeddingAnnouncement.expiration)
      : null
  );

  const isLoading = isAdding || isUpdating;

  const getSubmitLabel = () => {
    if (selectedWeddingAnnouncement) {
      return isUpdating ? "Updating announcement..." : "Update announcement";
    } else {
      return isAdding ? "Adding announcement..." : "Add announcement";
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedWeddingAnnouncement) {
        if (!selectedWeddingAnnouncement.id) {
          throw new Error("Selected announcement has no id");
        }
        await updateWeddingAnnouncement({
          id: selectedWeddingAnnouncement.id,
          data: { content, expiration: expirationDate?.toISOString() },
        });
        onClose();

        notifications.show({
          title: "Success",
          message: "WeddingAnnouncement updated",
          color: "green",
        });
      } else {
        if (!content || !expirationDate) {
          throw new Error("WeddingAnnouncement cannot be empty");
        }
        await addWeddingAnnouncement({
          content,
          expiration: expirationDate.toISOString(),
        });
        onClose();
        notifications.show({
          title: "Success",
          message: "WeddingAnnouncement added",
          color: "green",
        });
      }
    } catch (e) {
      notifications.show({
        title: "Failed to add announcement",
        message: String(e),
        color: "red",
      });
    }
  };

  useEffect(() => {
    if (selectedWeddingAnnouncement) {
      setExpirationDate(new Date(selectedWeddingAnnouncement.expiration));
    } else {
      setExpirationDate(null);
    }
  }, [selectedWeddingAnnouncement]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Text fw="bold">
          {selectedWeddingAnnouncement
            ? "Edit wedding announcement"
            : "Add wedding announcement"}
        </Text>
      }
      position="right"
    >
      <Stack>
        <DatePickerInput
          minDate={dayjs().toDate()}
          label="Expiration date"
          placeholder="Pick date"
          value={expirationDate}
          onChange={setExpirationDate}
        />
        <TextEditor
          label="Content"
          content={selectedWeddingAnnouncement?.content || content}
          onChange={setContent}
        />
        <Button type="submit" loading={isLoading} onClick={handleSubmit}>
          {getSubmitLabel()}
        </Button>
      </Stack>
    </Drawer>
  );
};

const WeddingPage = () => {
  const [selectedWeddingAnnouncement, setSelectedWeddingAnnouncement] =
    useState<IWeddingAnnouncement | null>(null);
  const [opened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const { data: announcements = [], isLoading } = useFetchAll(
    "weddingAnnouncements"
  );
  const { mutate: deleteMutation } = useDelete("weddingAnnouncements");

  const { data: weddingAppointments = [], isLoading: isLoadingAppointments } =
    useFetchAll("weddingAppointment");

  const { data: weddingRequestForms = [], isLoading: isLoadingRequestForm } =
    useFetchAll("weddingRequestForm");

  const { mutate: updateWeddingRequstForm, isPending: isUpdatingRequestForm } =
    useUpdate("weddingRequestForm");

  const updateRequestFormStatus = async (
    id: string,
    status: RequestFormStatusEnum
  ) => {
    try {
      if (!id) return;
      await updateWeddingRequstForm({
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

  const editWeddingAnnouncement = (announcement: IWeddingAnnouncement) => {
    setSelectedWeddingAnnouncement(announcement);
    openDrawer();
  };

  const deleteWeddingAnnouncement = async (id: string) => {
    try {
      await deleteMutation(id);
      notifications.show({
        title: "Success",
        message: "WeddingAnnouncement deleted",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        title: "Failed to delete announcement",
        message: String(e),
        color: "red",
      });
    }
  };

  return (
    <PageContent>
      <CustomDatatable
        title="Wedding Announcements"
        fetching={isLoading}
        columns={[
          {
            accessor: "content",
            render: (announcement) => {
              const announcementRow = announcement as IWeddingAnnouncement;
              return <TextEditor readonly content={announcementRow.content} />;
            },
          },
          {
            accessor: "expiration",
            width: 250,
            render: (announcement) => {
              const announcementRow = announcement as IWeddingAnnouncement;
              return (
                <Text>{toStandardDateFormat(announcementRow.expiration)}</Text>
              );
            },
          },
          {
            accessor: "created",
            width: 250,
            render: (announcement) => {
              const announcementRow = announcement as IWeddingAnnouncement;
              return (
                <Text>{toStandardDateFormat(announcementRow.created)}</Text>
              );
            },
          },
          {
            accessor: "",
            width: 120,
            title: "Actions",
            textAlign: "center",
            render: (announcement) => {
              const rowWeddingAnnouncement =
                announcement as IWeddingAnnouncement;
              return (
                <Group justify="center">
                  <Tooltip label="Edit announcement">
                    <ActionIcon
                      onClick={() =>
                        editWeddingAnnouncement(rowWeddingAnnouncement)
                      }
                    >
                      <IconPencil />
                    </ActionIcon>
                  </Tooltip>
                  {rowWeddingAnnouncement.id && (
                    <Tooltip label="Delete announcement">
                      <ActionIcon
                        onClick={() =>
                          deleteWeddingAnnouncement(
                            String(rowWeddingAnnouncement.id)
                          )
                        }
                        color="red"
                      >
                        <IconTrash />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              );
            },
          },
        ]}
        records={announcements.filter((announcement) =>
          isNotExpired(announcement.expiration)
        )}
        withTableBorder
        withColumnBorders
        onDeleteRecords={() => {}}
        actionComponent={
          <Group>
            <Button leftSection={<IconPlus />} onClick={openDrawer}>
              Add announcement
            </Button>
          </Group>
        }
      />

      <CustomDatatable
        title="Wedding Appointments"
        fetching={isLoadingAppointments}
        records={weddingAppointments}
        columns={[
          { accessor: "bride" },
          { accessor: "brideAge", title: "Bride Age" },
          { accessor: "groom" },
          { accessor: "groomAge", title: "Groom Age" },
          { accessor: "contactNumber", title: "Contact Number" },

          { accessor: "confirmedBy", title: "Confirmed By" },

          {
            accessor: "dateWedding",
            title: "Date of Wedding",
            render: (wedding) => {
              const { dateWedding, timeWedding } =
                wedding as IWeddingAppointment;
              return (
                <Text>{`${toStandardDateFormat(dateWedding, true)} ${timeWedding}`}</Text>
              );
            },
          },
          {
            accessor: "dateConfirmation",
            title: "Confirmation Date",
            render: (wedding) => {
              const { dateConfirmation, timeConfirmation } =
                wedding as IWeddingAppointment;
              return (
                <Text>{`${toStandardDateFormat(dateConfirmation, true)} ${timeConfirmation}`}</Text>
              );
            },
          },

          {
            accessor: "dateInterview",
            title: "Interview Date",
            render: (wedding) => {
              const { dateInterview, timeInterview } =
                wedding as IWeddingAppointment;
              return (
                <Text>{`${toStandardDateFormat(dateInterview, true)} ${timeInterview}`}</Text>
              );
            },
          },
          {
            accessor: "dateCounseling",
            title: "Counseling Date",
            render: (wedding) => {
              const { dateCounseling } = wedding as IWeddingAppointment;
              return <Text>{toStandardDateFormat(dateCounseling, true)}</Text>;
            },
          },

          { accessor: "venue" },

          {
            accessor: "status",
            width: 120,
            render: (wedding) => {
              const { status } = wedding as IWeddingAppointment;
              return <StatusBadge status={status} />;
            },
          },
          {
            accessor: "",
            title: "Actions",
            width: 150,
            textAlign: "center",

            render: (wedding) => (
              <ApproveRejectButtons
                wedding={wedding as unknown as IWeddingAppointment}
              />
            ),
          },
        ]}
      />

      <CustomDatatable
        title="Wedding Request Forms"
        fetching={isLoadingRequestForm}
        records={weddingRequestForms}
        columns={[
          { accessor: "bridesName", title: "Bride's Name" },
          { accessor: "groomsName", title: "Groom's Name" },
          {
            accessor: "contactNumber",
            title: "Contact Number",
          },
          {
            accessor: "dateofWedding",
            title: "Date of Wedding",
            render: (wedding) => {
              const { dateOfWedding } = wedding as IWeddingRequestForm;
              return <Text>{dayjs(dateOfWedding).format("dddd")}</Text>;
            },
          },
          { accessor: "purpose", title: "Purpose" },
          {
            accessor: "",
            title: "Actions",

            textAlign: "center",

            render: (data) => {
              const wedding = data as IWeddingRequestForm;
              return (
                <TableReadyButton
                  type="WeddingRequestForm"
                  userId={wedding.userId}
                  loading={isUpdatingRequestForm}
                  status={wedding.status}
                  onSetAsCollected={() =>
                    updateRequestFormStatus(
                      String(wedding.id),
                      RequestFormStatusEnum.COLLECTED
                    )
                  }
                  onSetAsReady={() =>
                    updateRequestFormStatus(
                      String(wedding.id),
                      RequestFormStatusEnum.READY
                    )
                  }
                />
              );
            },
          },
        ]}
      />
      <WeddingAnnouncementDrawer
        onClose={() => {
          setSelectedWeddingAnnouncement(null);
          closeDrawer();
        }}
        opened={opened}
        selectedWeddingAnnouncement={selectedWeddingAnnouncement}
      />
    </PageContent>
  );
};

export default WeddingPage;
