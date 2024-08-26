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

import CustomDatatable from "../components/CustomDatable";
import { IAnnouncement } from "../database";
import PageContent from "../components/PageContent";
import TextEditor from "../components/TextEditor";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

interface IAnnouncementDrawer {
  opened: boolean;
  onClose: () => void;
  selectedAnnouncement: IAnnouncement | null;
}

const AnnouncementDrawer = ({
  onClose,
  opened,
  selectedAnnouncement,
}: IAnnouncementDrawer) => {
  const { mutate: addAnnouncement, isPending: isAdding } =
    useCreate("announcements");
  const { mutate: updateAnnouncement, isPending: isUpdating } =
    useUpdate("announcements");

  const [content, setContent] = useState<string>(
    selectedAnnouncement?.content || ""
  );

  const isLoading = isAdding || isUpdating;

  const getSubmitLabel = () => {
    if (selectedAnnouncement) {
      return isUpdating ? "Updating announcement..." : "Update announcement";
    } else {
      return isAdding ? "Adding announcement..." : "Add announcement";
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedAnnouncement) {
        if (!selectedAnnouncement.id) {
          throw new Error("Selected announcement has no id");
        }
        await updateAnnouncement({
          id: selectedAnnouncement.id,
          data: { content },
        });
        onClose();

        notifications.show({
          title: "Success",
          message: "Announcement updated",
          color: "green",
        });
      } else {
        if (!content) {
          throw new Error("Announcement cannot be empty");
        }
        await addAnnouncement({ content });
        onClose();
        notifications.show({
          title: "Success",
          message: "Announcement added",
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

  // useEffect(() => {
  //   setContent(selectedAnnouncement?.content || "");
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [selectedAnnouncement]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Text fw="bold">
          {selectedAnnouncement ? "Edit announcement" : "Add announcement"}
        </Text>
      }
      position="right"
    >
      <Stack>
        <TextEditor
          content={selectedAnnouncement?.content || content}
          onChange={setContent}
        />
        <Button type="submit" loading={isLoading} onClick={handleSubmit}>
          {getSubmitLabel()}
        </Button>
      </Stack>
    </Drawer>
  );
};

const AnnouncementPage = () => {
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<IAnnouncement | null>(null);
  const [opened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const { data: announcements = [], isLoading } = useFetchAll("announcements");
  const { mutate: deleteMutation } = useDelete("announcements");

  const editAnnouncement = (announcement: IAnnouncement) => {
    setSelectedAnnouncement(announcement);
    openDrawer();
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await deleteMutation(id);
      notifications.show({
        title: "Success",
        message: "Announcement deleted",
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
        fetching={isLoading}
        columns={[
          { accessor: "content" },
          { accessor: "created" },
          {
            accessor: "",
            title: "Actions",
            textAlign: "center",
            render: (announcement) => {
              const rowAnnouncement = announcement as IAnnouncement;
              return (
                <Group justify="center">
                  <Tooltip label="Edit announcement">
                    <ActionIcon
                      onClick={() => editAnnouncement(rowAnnouncement)}
                    >
                      <IconPencil />
                    </ActionIcon>
                  </Tooltip>
                  {rowAnnouncement.id && (
                    <Tooltip label="Delete announcement">
                      <ActionIcon
                        onClick={() =>
                          deleteAnnouncement(String(rowAnnouncement.id))
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
        records={announcements}
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
      <AnnouncementDrawer
        onClose={() => {
          setSelectedAnnouncement(null);
          closeDrawer();
        }}
        opened={opened}
        selectedAnnouncement={selectedAnnouncement}
      />
    </PageContent>
  );
};

export default AnnouncementPage;
