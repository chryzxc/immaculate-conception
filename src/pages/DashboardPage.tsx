import { BarChart, DonutChart } from "@mantine/charts";
import { Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import {
  IconBuildingChurch,
  IconDroplet,
  IconFlower,
  IconHeart,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import locale from "dayjs/plugin/localeData";
import { useMemo } from "react";
import PageContent from "../components/PageContent";
import { IMass } from "../database";
import { useFetchAll } from "../hooks/useFirebaseFetcher";
import classes from "../styles/Dashboard.module.css";

interface IDataProps {
  mass: IMass[];
  baptism: IMass[];
  wedding: IMass[];
  funeral: IMass[];
}

const MonthlyChart = ({
  mass = [],
  baptism = [],
  wedding = [],
  funeral = [],
}: IDataProps) => {
  dayjs.extend(locale);

  const data = useMemo(
    () =>
      dayjs.months().map((month) => {
        const filteredMass = mass.filter(({ created }) =>
          dayjs().isSame(dayjs(created, "month"))
        );

        const filteredBaptism = baptism.filter(({ created }) =>
          dayjs().isSame(dayjs(created, "month"))
        );

        const filteredWedding = wedding.filter(({ created }) =>
          dayjs().isSame(dayjs(created, "month"))
        );

        const filteredFuneral = funeral.filter(({ created }) =>
          dayjs().isSame(dayjs(created, "month"))
        );

        return {
          month: month.slice(0, 3),
          Mass: filteredMass.length,
          Baptism: filteredBaptism.length,
          Wedding: filteredWedding.length,
          Funeral: filteredFuneral.length,
        };
      }),
    [mass, baptism, wedding, funeral]
  );

  return (
    <BarChart
      h={300}
      data={data}
      dataKey="month"
      series={[
        { name: "Mass", color: "violet.6" },
        { name: "Baptism", color: "blue.6" },
        { name: "Wedding", color: "teal.6" },
        { name: "Funeral", color: "red.6" },
      ]}
      tickLine="y"
    />
  );
};

const Statistics = ({ baptism, funeral, mass, wedding }: IDataProps) => {
  const getDiff = (data: IMass[]): number => {
    if (data.length) {
      const currentMonth = dayjs().month();
      const previousMonth = dayjs().subtract(1, "month").month();

      const currentMonthData = data.filter(({ created }) =>
        dayjs(created).isSame(dayjs().month(currentMonth))
      );

      const previousMonthData = data.filter(({ created }) =>
        dayjs(created).isSame(dayjs().month(previousMonth))
      );

      return Math.round(
        ((currentMonthData.length - previousMonthData.length) /
          previousMonthData.length) *
          100
      );
    }
    return 0;
  };

  const data = [
    {
      title: "Mass",
      icon: IconBuildingChurch,
      value: mass.length.toString(),
      diff: getDiff(mass),
    },
    {
      title: "Baptism",
      icon: IconDroplet,
      value: baptism.length.toString(),
      diff: getDiff(baptism),
    },
    {
      title: "Wedding",
      icon: IconHeart,
      value: wedding.length.toString(),
      diff: getDiff(wedding),
    },
    {
      title: "Funeral",
      icon: IconFlower,
      value: funeral.length.toString(),
      diff: getDiff(funeral),
    },
  ] as const;

  const stats = data.map((stat) => {
    const Icon = stat.icon;
    // const DiffIcon = stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;

    return (
      <Paper withBorder p="md" radius="md" key={stat.title}>
        <Group justify="space-between">
          <Text size="xs" c="dimmed" className={classes.title}>
            {stat.title}
          </Text>
          <Icon className={classes.icon} size="1.4rem" stroke={1.5} />
        </Group>

        <Group align="flex-end" gap="xs" mt={25}>
          <Text className={classes.value}>{stat.value}</Text>
          {/* <Text
            c={stat.diff > 0 ? "teal" : "red"}
            fz="sm"
            fw={500}
            className={classes.diff}
          >
            <span>{stat.diff}%</span>
            <DiffIcon size="1rem" stroke={1.5} />
          </Text> */}
        </Group>

        {/* <Text fz="xs" c="dimmed" mt={7}>
          Compared to previous month
        </Text> */}
      </Paper>
    );
  });

  return <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>{stats}</SimpleGrid>;
};

const DataDistribution = ({ baptism, funeral, mass, wedding }: IDataProps) => {
  const data = [
    { name: "Baptism", value: baptism.length, color: "indigo.6" },
    { name: "Funeral", value: funeral.length, color: "yellow.6" },
    { name: "Mass", value: mass.length, color: "teal.6" },
    { name: "Wedding", value: wedding.length, color: "gray.6" },
  ];

  return (
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
          <Text fw={600}>{`${item.name} : ${item.value}`}</Text>
        ))}
      </Stack>
    </SimpleGrid>
  );
};

export default function DashboardPage() {
  const { data: mass = [] } = useFetchAll("massAppointments");
  const data: IDataProps = { baptism: [], funeral: [], mass, wedding: [] };
  return (
    <PageContent>
      <Stack>
        <Statistics {...data} />
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Paper withBorder p="md" radius="md">
            <Text fw={600} mb="xl">
              Data Distribution
            </Text>
            <DataDistribution {...data} />
          </Paper>
          <Paper withBorder p="md" radius="md">
            <Text fw={600} mb="xl">
              Monthly Statistics
            </Text>
            <MonthlyChart {...data} />
          </Paper>
        </SimpleGrid>
      </Stack>
    </PageContent>
  );
}
