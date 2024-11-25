import { Button, Card, Group, Stack, Text, TextInput } from "@mantine/core";
import { ComponentProps, useEffect, useState } from "react";
import { DataTable } from "mantine-datatable";
import { IconSearch, IconTrash } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { saveAs } from "file-saver";
import Papa from "papaparse";

const PAGE_SIZES = [10, 15, 20];

type TCustomDatatable = ComponentProps<typeof DataTable> & {
  title?: string;
  records: unknown[];
  actionComponent?: React.ReactNode;
  onDeleteRecords?: (records: unknown[]) => void;
};

export default function CustomDatatable({
  title,
  records,
  actionComponent,
  onDeleteRecords,
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

  useEffect(() => {
    let filteredRecords = [...records];

    if (debouncedQuery) {
      filteredRecords = filteredRecords.filter((record) =>
        JSON.stringify(record)
          .toLowerCase()
          .includes(debouncedQuery.trim().toLowerCase())
      );
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setTableRecords(filteredRecords.reverse().slice(from, to));
  }, [records, page, pageSize, debouncedQuery]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  // Export to CSV Functionality
  const exportToCSV = () => {
    // Map records to a flat structure for CSV
    const formattedData = records.map((record: unknown) => ({
      Name: record.name,
      "Mother's Name": record.motherName,
      "Father's Name": record.fatherName,
      Church: record.church,
      "Birth Place": record.birthPlace,
      "Contact Number": record.guardianNumber,
      "Date of Baptism": record.baptismDate,
      Sponsor: record.sponsorName,
      Status: record.status,
    }));

    // Convert to CSV
    const csv = Papa.unparse(formattedData);

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
          <Button onClick={exportToCSV} color="blue">
            Export as CSV
          </Button>
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
