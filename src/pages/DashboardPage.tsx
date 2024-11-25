import { BarChart, DonutChart } from "@mantine/charts";
import {
  Center,
  ColorSwatch,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import dayjs from "dayjs";
import locale from "dayjs/plugin/localeData";
import { useMemo } from "react";
import PageContent from "../components/PageContent";
import { useFetchAll } from "../hooks/useFirebaseFetcher";
import { filterListByPriestUserId } from "../hooks/useUserFilterList";
import useUserStore from "../store/user";

interface IPieData {
  name: string;
  value: number;
  color: string;
}

interface IMonthlyData {
  title: string;
  data: unknown[];
  color: string;
}

const MonthlyChart = ({
  data,
  title,
}: {
  data: IMonthlyData[];
  title: string;
}) => {
  dayjs.extend(locale);

  const filteredData = useMemo(
    () =>
      dayjs.months().map((month) => {
        const consolidatedData = data.reduce((acc, element) => {
          const filteredData = element.data.filter((row) => {
            if (!!row && typeof row === "object" && "created" in row) {
              return dayjs().isSame(dayjs(row.created as string, "month"));
            }
            return false;
          });
          return { ...acc, [element.title]: filteredData.length };
        }, {});

        return {
          month: month.slice(0, 3),
          ...consolidatedData,
        };
      }),
    [data]
  );

  return (
    <Paper withBorder p="md" radius="md">
      <Text fw={600} mb="xl">
        {title}
      </Text>
      <BarChart
        h={300}
        data={filteredData}
        dataKey="month"
        series={data.map((element) => ({
          name: element.title,
          color: element.color,
        }))}
        tickLine="y"
      />
    </Paper>
  );
};

// const Statistics = ({ baptism, funeral, mass, wedding }: IDataProps) => {
//   const getDiff = (data: IMass[]): number => {
//     if (data.length) {
//       const currentMonth = dayjs().month();
//       const previousMonth = dayjs().subtract(1, "month").month();

//       const currentMonthData = data.filter(({ created }) =>
//         dayjs(created).isSame(dayjs().month(currentMonth))
//       );

//       const previousMonthData = data.filter(({ created }) =>
//         dayjs(created).isSame(dayjs().month(previousMonth))
//       );

//       return Math.round(
//         ((currentMonthData.length - previousMonthData.length) /
//           previousMonthData.length) *
//           100
//       );
//     }
//     return 0;
//   };

//   const data = [
//     {
//       title: "Mass",
//       icon: IconBuildingChurch,
//       value: mass.length.toString(),
//       diff: getDiff(mass),
//     },
//     {
//       title: "Baptism",
//       icon: IconDroplet,
//       value: baptism.length.toString(),
//       diff: getDiff(baptism),
//     },
//     {
//       title: "Wedding",
//       icon: IconHeart,
//       value: wedding.length.toString(),
//       diff: getDiff(wedding),
//     },
//     {
//       title: "Funeral",
//       icon: IconFlower,
//       value: funeral.length.toString(),
//       diff: getDiff(funeral),
//     },
//   ] as const;

//   const stats = data.map((stat) => {
//     const Icon = stat.icon;
//     // const DiffIcon = stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;

//     return (
//       <Paper withBorder p="md" radius="md" key={stat.title}>
//         <Group justify="space-between">
//           <Text size="xs" c="dimmed" className={classes.title}>
//             {stat.title}
//           </Text>
//           <Icon className={classes.icon} size="1.4rem" stroke={1.5} />
//         </Group>

//         <Group align="flex-end" gap="xs" mt={25}>
//           <Text className={classes.value}>{stat.value}</Text>
//           {/* <Text
//             c={stat.diff > 0 ? "teal" : "red"}
//             fz="sm"
//             fw={500}
//             className={classes.diff}
//           >
//             <span>{stat.diff}%</span>
//             <DiffIcon size="1rem" stroke={1.5} />
//           </Text> */}
//         </Group>

//         {/* <Text fz="xs" c="dimmed" mt={7}>
//           Compared to previous month
//         </Text> */}
//       </Paper>
//     );
//   });

//   return <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>{stats}</SimpleGrid>;
// };

const DataDistributionChart = ({
  data,
  title,
}: {
  title: string;
  data: IPieData[];
}) => {
  const totalValue = data.reduce((acc, { value }) => acc + value, 0);

  return (
    <Paper withBorder p="md" radius="md">
      <Text fw={600} mb="xl">
        {title}
      </Text>
      {totalValue ? (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <DonutChart
            withLabelsLine
            withLabels
            data={data}
            paddingAngle={8}
            tooltipDataSource="segment"
          />
          <Stack justify="center">
            {data.map((item) => (
              <Group>
                <Group>
                  <ColorSwatch color={item.color.split(".")[0]} />
                  <Text className="text-gray-500">{item.name}:</Text>
                </Group>
                <Text className="font-bold">{item.value}</Text>
              </Group>
            ))}
          </Stack>
        </SimpleGrid>
      ) : (
        <Center p="lg">
          <Text>No data available</Text>
        </Center>
      )}
    </Paper>
  );
};

const Appointments = () => {
  const { user } = useUserStore();
  const { data: mass = [] } = useFetchAll("massAppointments");
  const { data: confirmations = [] } = useFetchAll("confirmationAppointment");
  const { data: baptism = [] } = useFetchAll("baptismAppointment");

  const { data: churchLiturgy = [] } = useFetchAll("churchLiturgyAppointment");
  const { data: houseLiturgy = [] } = useFetchAll("houseLiturgyAppointment");
  const { data: wedding = [] } = useFetchAll("weddingAppointment");

  const filteredEucharistic = filterListByPriestUserId(mass, user);
  const filteredChurchLitergy = filterListByPriestUserId(churchLiturgy, user);
  const filteredHouseLiturgy = filterListByPriestUserId(houseLiturgy, user);

  const pieData: IPieData[] = [
    {
      name: "Eucharistic",
      value: filteredEucharistic.length,
      color: "red.6",
    },
    {
      name: "Church Liturgy",
      value: filteredChurchLitergy.length,
      color: "green.6",
    },
    {
      name: "House Liturgy",
      value: filteredHouseLiturgy.length,
      color: "pink.6",
    },
    ...(user?.isSuperAdmin
      ? [
          {
            name: "Confirmation",
            value: confirmations.length,
            color: "blue.6",
          },

          { name: "Baptism", value: baptism.length, color: "indigo.6" },

          { name: "Mass", value: mass.length, color: "teal.6" },
          { name: "Wedding", value: wedding.length, color: "gray.6" },
        ]
      : []),
  ];

  const monthlyData: IMonthlyData[] = [
    { title: "Eucharistic", data: mass, color: "violet.6" },
    { title: "Church Liturgy", data: mass, color: "red.6" },
    { title: "Hourse Liturgy", data: mass, color: "green.6" },
    ...(user?.isSuperAdmin
      ? [
          { title: "Confirmation", data: mass, color: "blue.6" },
          { title: "Baptism", data: mass, color: "teal.6" },
          { title: "Wedding", data: mass, color: "yellow.6" },
        ]
      : []),
  ];

  return (
    <>
      <DataDistributionChart
        data={pieData}
        title="Appointment Data Distribution"
      />
      <MonthlyChart data={monthlyData} title="Appointment Monthly Statistics" />
    </>
  );
};

const RequestForm = () => {
  const { user } = useUserStore();

  const { data: wedding = [] } = useFetchAll("weddingRequestForm");
  const { data: confirmations = [] } = useFetchAll("confirmationRequestForm");
  const { data: baptism = [] } = useFetchAll("baptismRequestForm");
  const { data: funeral = [] } = useFetchAll("funeralRequestForm");

  const pieData: IPieData[] = [
    {
      name: "Wedding",
      value: wedding.length,
      color: "red.6",
    },
    {
      name: "Confirmation",
      value: confirmations.length,
      color: "green.6",
    },
    {
      name: "Baptism",
      value: baptism.length,
      color: "orange.6",
    },
    {
      name: "Funeral",
      value: funeral.length,
      color: "blue.6",
    },
  ];

  const monthlyData: IMonthlyData[] = [
    { title: "Wedding", data: wedding, color: "violet.6" },
    { title: "Confirmation", data: confirmations, color: "blue.6" },
    { title: "Funeral", data: baptism, color: "teal.6" },
    { title: "Baptism", data: funeral, color: "red.6" },
  ];

  if (!user?.isSuperAdmin) return null;

  return (
    <>
      <DataDistributionChart
        data={pieData}
        title="Request Form Data Distribution"
      />
      <MonthlyChart
        data={monthlyData}
        title="Request Form Monthly Statistics"
      />
    </>
  );
};

export default function DashboardPage() {
  return (
    <PageContent>
      <Stack>
        {/* <Statistics {...data} /> */}
        <SimpleGrid cols={{ base: 1 }}>
          <Appointments />
          <RequestForm />
        </SimpleGrid>
      </Stack>
    </PageContent>
  );
}
