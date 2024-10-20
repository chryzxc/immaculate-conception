import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  Input,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  signInWithPhoneNumber,
} from "firebase/auth";
import { zodResolver } from "mantine-form-zod-resolver";
import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask";
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

const PHONE_NUMBER_MASK = "+63 000-0000-000";

const schema = z.object({
  name: z.string().min(2, { message: "Name should have at least 2 letters" }),
  phoneNumber: z
    .string()
    .min(PHONE_NUMBER_MASK.length, {
      message: "Phone number should have 13 characters",
    })
    .max(PHONE_NUMBER_MASK.length, {
      message: "Phone number should have 13 characters",
    }),
});

const PriestDrawer = ({ onClose, opened, selectedPriest }: IPriestDrawer) => {
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [verifiyingOtp, setVerifyingOtp] = useState(false);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: selectedPriest?.name || "",
      phoneNumber: selectedPriest?.phoneNumber || "",
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

  const setUpRecaptcha = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          console.log("Recaptcha resolved");
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      }
    );
  };

  const clearValues = () => {
    setVerificationId("");
    setOtp("");
    form.reset();
  };

  const handleSubmit = async () => {
    if (
      !selectedPriest?.phoneNumber ||
      selectedPriest.phoneNumber !== form.getValues().phoneNumber
    ) {
      sendVerificationCode();
    } else {
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
          ...(form.getValues() as IPriest),
          ...partialPriestData,
        });
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

  const sendVerificationCode = () => {
    setUpRecaptcha();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appVerifier = (window as any).recaptchaVerifier;
    signInWithPhoneNumber(auth, form.getValues().phoneNumber, appVerifier)
      .then((confirmationResult) => {
        setVerificationId(confirmationResult.verificationId);
        console.log("OTP sent");
      })
      .catch((error) => {
        console.error("Error sending OTP", error);
      });
  };

  const handleVerifyOtp = async () => {
    setVerifyingOtp(true);
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    try {
      const userAuth = await signInWithCredential(auth, credential);

      upsertPriest(userAuth?.user.uid);
    } catch (e) {
      notifications.show({
        title: "Failed to verify OTP",
        message: String(e),
        color: "red",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  useEffect(() => {
    form.setValues({
      name: selectedPriest?.name || "",
      phoneNumber: selectedPriest?.phoneNumber || "",
    });
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
      <div id="recaptcha-container"></div>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {!verificationId ? (
            <>
              <TextInput
                label="Name"
                placeholder="Enter priest name"
                withAsterisk
                key={form.key("name")}
                {...form.getInputProps("name")}
              />
              <Input.Wrapper
                label="Phone Number"
                {...form.getInputProps("phoneNumber")}
              >
                <Input
                  component={IMaskInput}
                  mask={PHONE_NUMBER_MASK}
                  placeholder="Enter phone number"
                  {...form.getInputProps("phoneNumber")}
                />
              </Input.Wrapper>
              <Button type="submit" loading={isLoading}>
                {getSubmitLabel()}
              </Button>
            </>
          ) : (
            <>
              <Input.Wrapper label="OTP Code">
                <Input
                  placeholder="Enter the OTP code sent to the provided number"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </Input.Wrapper>

              <Button loading={verifiyingOtp} onClick={handleVerifyOtp}>
                {verifiyingOtp ? "Verifying OTP..." : "Verify OTP"}
              </Button>
            </>
          )}
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
          { accessor: "phoneNumber" },
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
