import { Button, Card, Group, Stack, Text, TextInput } from "@mantine/core";
import { ComponentProps, useEffect, useState } from "react";

import { DataTable } from "mantine-datatable";
import { IconSearch, IconTrash } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";

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
        {(!!onDeleteRecords || !!actionComponent) && (
          <Group justify="space-between">
            {onDeleteRecords && (
              <Button
                disabled={!selectedRecords.length}
                color="red"
                leftSection={<IconTrash />}
              >
                {!selectedRecords.length
                  ? "Select records to delete"
                  : `Delete ${selectedRecords.length} ${selectedRecords.length > 1 ? "records" : "record"} `}
              </Button>
            )}
            {actionComponent}
          </Group>
        )}
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
