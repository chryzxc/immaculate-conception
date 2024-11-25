import {
  Button,
  Card,
  Group,
  NativeSelect,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch, IconTrash } from "@tabler/icons-react";
import dayjs from "dayjs";
import locale from "dayjs/plugin/localeData";
import { saveAs } from "file-saver";
import { DataTable } from "mantine-datatable";
import Papa from "papaparse";
import { ComponentProps, useEffect, useState } from "react";
import { IBaseEntity } from "../database";

interface IColumn {
  accessor?: string;
  title: string;
}

interface IRecordData {
  [key: string]: unknown; // Index signature allows dynamic keys
}

const PAGE_SIZES = [10, 15, 20];
dayjs.extend(locale);

type TCustomDatatable = ComponentProps<typeof DataTable> & {
  title?: string;
  records: unknown[];
  actionComponent?: React.ReactNode;
  onDeleteRecords?: (records: unknown[]) => void;
  showMonthFilter?: boolean;
};

export default function CustomDatatable({
  title,
  records,
  actionComponent,
  onDeleteRecords,
  showMonthFilter = true,
  ...otherProps
}: TCustomDatatable) {
  const [query, setQuery] = useState("");
  const [selectedRecords, setSelectedRecords] = useState<unknown[]>([]);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [tableRecords, setTableRecords] = useState(
    [...records].reverse().slice(0, pageSize)
  );
  const [debouncedQuery] = useDebouncedValue(query, 800);
  const [selectedMonth, setSelectedMonth] = useState<string>("All");

  useEffect(() => {
    let filteredRecords = [...records];

    if (debouncedQuery) {
      filteredRecords = filteredRecords.filter((record) =>
        JSON.stringify(record)
          .toLowerCase()
          .includes(debouncedQuery.trim().toLowerCase())
      );
    }

    if (selectedMonth !== "All") {
      filteredRecords = filteredRecords.filter((record: unknown) => {
        const row: IBaseEntity = record as unknown as IBaseEntity;
        return row.created && dayjs(row?.created).isSame(dayjs(), "M");
      });
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setTableRecords(filteredRecords.reverse().slice(from, to));
  }, [records, page, pageSize, debouncedQuery, selectedMonth]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  // Export to CSV Functionality
  const exportToCSV = () => {
    if (!otherProps.columns || otherProps.columns.length === 0) {
      console.error("No columns defined for CSV export");
      return;
    }

    // Extract headers from columns
    const headers = otherProps.columns
      .map((column) => {
        const col = column as IColumn;
        return col.accessor || col?.title;
      })
      .filter((title) => title?.toLowerCase() !== "actions");

    const newRecords: IRecordData[] = records as IRecordData[];

    // Map records to only include the values for the defined columns
    const formattedData = newRecords.map((record: IRecordData) =>
      headers.reduce((acc: Record<string, unknown>, header: string) => {
        acc[header] = record[header] ?? ""; // Use empty string for missing values
        return acc;
      }, {})
    );

    // Convert to CSV
    const csv = Papa.unparse({
      fields: headers,
      data: formattedData,
    });

    // Create a Blob and trigger download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${title || "data"}.csv`);
  };

  return (
    <Card shadow="lg" withBorder radius="md">
      <Stack>
        <Group justify="space-between">
          {title && (
            <Text fw={700} size="lg" color="primary">
              {title}
            </Text>
          )}
          <TextInput
            leftSection={<IconSearch />}
            placeholder="Search"
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
        </Group>
        <Group justify="space-between">
          <Group>
            {showMonthFilter && (
              <Group>
                <NativeSelect
                  data={["All", ...dayjs.months().map((month) => `${month}`)]}
                  onChange={(event) =>
                    setSelectedMonth(event.currentTarget.value)
                  }
                />
              </Group>
            )}

            {onDeleteRecords && (
              <Button
                disabled={!selectedRecords.length}
                color="red"
                leftSection={<IconTrash />}
              >
                {!selectedRecords.length
                  ? "Select records to delete"
                  : `Delete ${selectedRecords.length} ${
                      selectedRecords.length > 1 ? "records" : "record"
                    }`}
              </Button>
            )}
            {actionComponent}
          </Group>
          <Button onClick={exportToCSV}>Export as CSV</Button>
        </Group>
        <DataTable
          {...otherProps}
          records={tableRecords}
          highlightOnHover
          totalRecords={records.length}
          recordsPerPage={pageSize}
          page={page}
          onPageChange={(p) => setPage(p)}
          recordsPerPageOptions={PAGE_SIZES}
          onRecordsPerPageChange={setPageSize}
          striped
          withTableBorder
          withColumnBorders
          {...(onDeleteRecords && {
            selectedRecords,
            onSelectedRecordsChange: setSelectedRecords,
          })}
        />
      </Stack>
    </Card>
  );
}
