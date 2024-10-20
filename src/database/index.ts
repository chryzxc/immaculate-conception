import {
  child,
  get,
  getDatabase,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";

import { AppointmentStatusEnum } from "../enums";
import app from "./config";

const database = getDatabase(app);

export type TDBPaths =
  | "priests"
  | "massAppointments"
  | "baptismAppointment"
  | "confirmationAppointment"
  | "weddingAnnouncements"
  | "masses"
  | "schedules"
  | "announcements";

export interface IBaseEntity {
  id?: string;
  created?: string;
  updated?: string;
}

export interface IPriest extends IBaseEntity {
  authId: string | null;
  name: string;
  phoneNumber: string;
}

export interface IMass extends IBaseEntity {
  date: string;
  description: string;
  name: string;
  place: string;
  time: string;
  status: AppointmentStatusEnum;
  priestId: string;
}

export interface IBaptism extends IBaseEntity {
  address: string;
  baptismDate: string;
  baptismPlace: string;
  baptismSponsors: string;
  birthPlace: string;
  birthdate: string;
  child_sName: string;
  father_sName: string;
  parentsContactNumber: string;
  status: AppointmentStatusEnum;
}

export interface IConfirmations extends IBaseEntity {
  baptismDate: string;
  birthPlace: string;
  birthdate: string;
  churchPlace: string;
  email: string;
  fatherName: string;
  guardianNumber: string;
  motherName: string;
  name: string;
  number: string;
  sponsorName: string;
  sponsorRelation: string;
  purpose: string;
  status: AppointmentStatusEnum;
}

export interface IParish extends IBaseEntity {
  name: string;
}

export interface ISchedule extends IBaseEntity {
  date: string;
}

export interface IAnnouncement extends IBaseEntity {
  content: string;
}

export interface IWeddingAnnouncement extends IBaseEntity {
  content: string;
  expiration: string | Date;
}

export type TDBEntities = {
  priests: IPriest;
  massAppointments: IMass;
  baptismAppointment: IBaptism;
  confirmationAppointment: IConfirmations;
  masses: IMass;
  schedules: ISchedule;
  announcements: IAnnouncement;
  weddingAnnouncements: IWeddingAnnouncement;
};

export type FirebaseDatabaseReturn<T extends TDBPaths> = {
  create: (data: TDBEntities[T]) => Promise<string>; // Assuming create returns the generated key
  patch: (id: string, data: Partial<TDBEntities[T]>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  fetch: (id: string) => Promise<TDBEntities[T] | null>;
  fetchAll: () => Promise<TDBEntities[T][]>;
};

/**
 * Firebase Realtime Database CRUD Utility
 * @param {string} basePath - The base path for the data node
 */
export const firebaseDatabase = <T extends TDBPaths>(
  basePath: T
): FirebaseDatabaseReturn<T> => {
  const create = async (data: TDBEntities[T]) => {
    const dbRef = ref(database, basePath);
    const newRef = push(dbRef); // Generates a unique key
    const formData: TDBEntities[T] = {
      ...data,
      created: new Date().toISOString(),
    };
    await set(newRef, formData);
    return newRef.key as string;
  };

  const patch = async (id: string, data: Partial<TDBEntities[T]>) => {
    const dbRef = ref(database, `${basePath}/${id}`);
    const formData: Partial<TDBEntities[T]> = {
      ...data,
      updated: new Date().toISOString(),
    };
    await update(dbRef, formData);
  };

  const removeItem = async (id: string) => {
    const dbRef = ref(database, `${basePath}/${id}`);
    await remove(dbRef);
  };

  const fetch = async (id: string): Promise<TDBEntities[T] | null> => {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `${basePath}/${id}`));
    return snapshot.exists() ? (snapshot.val() as TDBEntities[T]) : null;
  };

  const fetchAll = async (): Promise<TDBEntities[T][]> => {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, basePath));

    let data: TDBEntities[T][] = [];

    if (snapshot.exists()) {
      data = Object.entries(snapshot.val() as TDBEntities[T]).map(
        ([key, value]) => ({ id: key, ...value })
      );
    }

    return data;
  };

  return {
    create,
    patch,
    remove: removeItem,
    fetch,
    fetchAll,
  };
};
