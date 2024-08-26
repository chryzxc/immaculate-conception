import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import {
  useCreate,
  useDelete,
  useFetchAll,
  useUpdate,
} from "../hooks/useFirebaseFetcher";
import { useEffect, useState } from "react";

import CustomDatatable from "../components/CustomDatable";
import { IPriest } from "../database";
import PageContent from "../components/PageContent";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";

interface IPriestDrawer {
  opened: boolean;
  onClose: () => void;
  selectedPriest: IPriest | null;
}

const schema = z.object({
  name: z.string().min(2, { message: "Name should have at least 2 letters" }),
});

const PriestDrawer = ({ onClose, opened, selectedPriest }: IPriestDrawer) => {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: selectedPriest?.name || "",
    },
    validate: zodResolver(schema),
  });

  const { mutate: addPriest, isPending: isAdding } = useCreate("priests");
  const { mutate: updatePriest, isPending: isUpdating } = useUpdate("priests");

  const isLoading = isAdding || isUpdating;

  const getSubmitLabel = () => {
    if (selectedPriest) {
      return isUpdating ? "Updating priest..." : "Update priest";
    } else {
      return isAdding ? "Adding priest..." : "Add priest";
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedPriest) {
        if (!selectedPriest.id) {
          throw new Error("Selected priest has no id");
        }
        await updatePriest({ id: selectedPriest.id, data: form.getValues() });
        onClose();

        notifications.show({
          title: "Success",
          message: "Priest updated",
          color: "green",
        });
      } else {
        await addPriest(form.getValues());
        onClose();
        notifications.show({
          title: "Success",
          message: "Priest added",
          color: "green",
        });
      }
    } catch (e) {
      notifications.show({
        title: "Failed to add priest",
        message: String(e),
        color: "red",
      });
    }
  };

  useEffect(() => {
    form.setValues({ name: selectedPriest?.name || "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPriest]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Text fw="bold">{selectedPriest ? "Edit priest" : "Add priest"}</Text>
      }
      position="right"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Name"
            placeholder="Enter priest name"
            withAsterisk
            key={form.key("name")}
            {...form.getInputProps("name")}
          />

          <Button type="submit" loading={isLoading}>
            {getSubmitLabel()}
          </Button>
        </Stack>
      </form>
    </Drawer>
  );
};

const PriestPage = () => {
  const [selectedPriest, setSelectedPriest] = useState<IPriest | null>(null);
  const [opened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const { data: priests = [], isLoading } = useFetchAll("priests");
  const { mutate: deleteMutation } = useDelete("priests");

  const editPriest = (priest: IPriest) => {
    setSelectedPriest(priest);
    openDrawer();
  };

  const deletePriest = async (id: string) => {
    try {
      await deleteMutation(id);
      notifications.show({
        title: "Success",
        message: "Priest deleted",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        title: "Failed to delete priest",
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
          { accessor: "name" },
          {
            accessor: "",
            title: "Actions",
            textAlign: "center",
            render: (priest: IPriest) => (
              <Group justify="center">
                <Tooltip label="Edit priest">
                  <ActionIcon onClick={() => editPriest(priest)}>
                    <IconPencil />
                  </ActionIcon>
                </Tooltip>
                {priest.id && (
                  <Tooltip label="Delete priest">
                    <ActionIcon
                      onClick={() => deletePriest(priest.id)}
                      color="red"
                    >
                      <IconTrash />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            ),
          },
        ]}
        records={priests}
        withTableBorder
        withColumnBorders
        onDeleteRecords={() => {}}
        actionComponent={
          <Group>
            <Button leftSection={<IconPlus />} onClick={openDrawer}>
              Add priest
            </Button>
          </Group>
        }
      />
      <PriestDrawer
        onClose={() => {
          setSelectedPriest(null);
          closeDrawer();
        }}
        opened={opened}
        selectedPriest={selectedPriest}
      />
    </PageContent>
  );
};

export default PriestPage;
