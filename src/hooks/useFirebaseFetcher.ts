import { TDBEntities, firebaseDatabase } from "../database";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useFetchAll = <T extends keyof TDBEntities>(path: T) => {
  const db = firebaseDatabase(path);

  return useQuery({
    queryFn: db.fetchAll,
    queryKey: [path],
  });
};

export const useFetchById = <T extends keyof TDBEntities>(
  path: T,
  id: string | undefined | null
) => {
  const db = firebaseDatabase(path);

  return useQuery({
    queryFn: () => db.fetch(String(id)),
    queryKey: [path, id],
  });
};

export const useCreate = <T extends keyof TDBEntities>(path: T) => {
  const queryClient = useQueryClient();
  const db = firebaseDatabase(path);

  return useMutation({
    mutationKey: [path],
    mutationFn: (data: TDBEntities[T]) => db.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [path] });
    },
  });
};

export const useUpdate = <T extends keyof TDBEntities>(path: T) => {
  const queryClient = useQueryClient();
  const db = firebaseDatabase(path);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TDBEntities[T]> }) =>
      db.patch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [path] });
    },
  });
};

export const useDelete = <T extends keyof TDBEntities>(path: T) => {
  const queryClient = useQueryClient();
  const db = firebaseDatabase(path);

  return useMutation({
    mutationFn: (id: string) => db.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [path] });
    },
  });
};

export const useSearchByKey = <T extends keyof TDBEntities>(
  path: T,
  key: keyof TDBEntities[T],
  value: string | number
) => {
  const db = firebaseDatabase(path);

  return useQuery({
    queryFn: async () => {
      const allData = await db.fetchAll();
      return allData.filter((item: TDBEntities[T]) => item[key] === value);
    },
    queryKey: [path, "search", key, value],
  });
};

export const searchByKey = async <T extends keyof TDBEntities>(
  path: T,
  key: keyof TDBEntities[T],
  value: string | number
) => {
  const db = firebaseDatabase(path);
  const allData = await db.fetchAll();
  return allData.filter((item: TDBEntities[T]) => item[key] === value);
};
