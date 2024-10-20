import { Button, Group, Stack, Text } from "@mantine/core";
import { ComponentProps, useEffect, useState } from "react";

import { DataTable } from "mantine-datatable";
import { IconTrash } from "@tabler/icons-react";

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
  const [selectedRecords, setSelectedRecords] = useState<unknown[]>([]);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [tableRecords, setTableRecords] = useState(records.slice(0, pageSize));

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setTableRecords(records.slice(from, to));
  }, [records, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  return (
    <Stack>
      {title && <Text fw={700}>{title}</Text>}
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
        records={[...tableRecords].reverse()}
        totalRecords={records.length}
        recordsPerPage={pageSize}
        page={page}
        onPageChange={(p) => setPage(p)}
        recordsPerPageOptions={PAGE_SIZES}
        onRecordsPerPageChange={setPageSize}
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
        {...(onDeleteRecords && {
          selectedRecords,
          onSelectedRecordsChange: setSelectedRecords,
        })}
      />
    </Stack>
  );
}
