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
import { useForm, zodResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { z } from "zod";
import CustomDatatable from "../components/CustomDatable";
import PageContent from "../components/PageContent";
import { IPriest } from "../database";
import { auth } from "../database/config";
import {
  useCreate,
  useDelete,
  useFetchAll,
  useUpdate,
} from "../hooks/useFirebaseFetcher";
import { toStandardDateFormat } from "../utils";

interface IPriestDrawer {
  opened: boolean;
  onClose: () => void;
  selectedPriest: IPriest | null;
}

const schema = z.object({
  name: z.string().min(2, { message: "Name should have at least 2 letters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password should be at least 6 characters" })
    .optional(),
});

const PriestDrawer = ({ onClose, opened, selectedPriest }: IPriestDrawer) => {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: selectedPriest?.name || "",
      email: selectedPriest?.email || "",
      password: "",
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

  const clearValues = () => {
    form.reset();
  };

  const handleSubmit = async () => {
    if (!selectedPriest) {
      // Register new priest
      const { email, password } = form.getValues();
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await upsertPriest(userCredential.user.uid);
      } catch (error) {
        notifications.show({
          title: "Failed to add priest",
          message: String(error),
          color: "red",
        });
      }
    } else {
      // Update existing priest data
      upsertPriest();
    }
  };

  const upsertPriest = async (userAuthId?: string) => {
    const partialPriestData: Partial<IPriest> = {
      authId: userAuthId || null,
    };

    try {
      if (selectedPriest) {
        if (!selectedPriest.id) {
          throw new Error("Selected priest has no id");
        }
        await updatePriest({
          id: selectedPriest.id,
          data: {
            ...form.getValues(),
            ...partialPriestData,
          },
        });
        onClose();

        notifications.show({
          title: "Success",
          message: "Priest updated",
          color: "green",
        });
      } else {
        await addPriest({
          ...(form.getValues() as Partial<IPriest>),
          ...partialPriestData,
        } as IPriest);
        clearValues();
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
    form.setValues({
      name: selectedPriest?.name || "",
      email: selectedPriest?.email || "",
      password: "",
    });
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
          <TextInput
            label="Email"
            placeholder="Enter priest email"
            withAsterisk
            key={form.key("email")}
            {...form.getInputProps("email")}
          />
          {!selectedPriest && (
            <TextInput
              label="Password"
              placeholder="Enter password"
              withAsterisk
              type="password"
              key={form.key("password")}
              {...form.getInputProps("password")}
            />
          )}
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
          { accessor: "email" },
          {
            accessor: "created",
            width: 300,
            render: (priest) => {
              const priestRow = priest as IPriest;
              return <Text>{toStandardDateFormat(priestRow.created)}</Text>;
            },
          },
          {
            accessor: "",
            title: "Actions",

            textAlign: "center",
            render: (priest) => {
              const rowPriest = priest as IPriest;
              return (
                <Group justify="center">
                  <Tooltip label="Edit priest">
                    <ActionIcon onClick={() => editPriest(rowPriest)}>
                      <IconPencil />
                    </ActionIcon>
                  </Tooltip>
                  {rowPriest.id && (
                    <Tooltip label="Delete priest">
                      <ActionIcon
                        onClick={() => deletePriest(String(rowPriest.id))}
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
        records={priests}
        withTableBorder
        withColumnBorders
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
