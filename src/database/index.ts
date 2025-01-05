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

import {
  PriestConfirmationStatusEnum,
  RequestFormStatusEnum,
  StatusEnum,
} from "../enums";
import app from "./config";

const database = getDatabase(app);

export interface IBaseEntity {
  id?: string;
  userId?: string;
  dateTimeStamp?: string;
  updated?: string;
}

export interface IRequestFormRelease {
  releasedTo?: string;
  releasedDate: Date | string;
}

export interface IPriest extends IBaseEntity {
  authId: string | null;
  name: string;
  email: string;
}

export interface IPriestAppointment {
  priestId: string;
  priestConfirmationStatus?: PriestConfirmationStatusEnum;
}

export interface IMass extends IBaseEntity, IPriestAppointment {
  date: string;
  massIntentions: string;
  time: string;
  status: StatusEnum;
}

export interface IChurchLiturgy extends IBaseEntity, IPriestAppointment {
  appointment: string;
  date: string;
  fullName: string;
  place: string;
  time: string;
  status: StatusEnum;
}

export interface IHouseLiturgy extends IBaseEntity, IPriestAppointment {
  appointment: string;
  date: string;
  fullName: string;
  place: string;
  time: string;
  status: StatusEnum;
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
  status?: StatusEnum;
}

export interface IBaptismRequestForm extends IBaseEntity, IRequestFormRelease {
  contactNumber: string;
  dateOfBaptism: string;
  dateOfBirth: string;
  father: string;
  mother: string;
  name: string;
  placeOfBaptism: string;
  purpose: string;
  status?: RequestFormStatusEnum;
}

export interface IConfirmationAppointments extends IBaseEntity {
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
  status?: StatusEnum;
}

export interface IConfirmationRequestForm
  extends IBaseEntity,
    IRequestFormRelease {
  contactNumber: string;
  dateOfConfirmation: string;
  father: string;
  mother: string;
  name: string;
  purpose: string;
  status?: RequestFormStatusEnum;
}

export interface IConfirmationRequestForm
  extends IBaseEntity,
    IRequestFormRelease {
  contactNumber: string;
  dateOfConfirmation: string;
  father: string;
  mother: string;
  name: string;
  purpose: string;
  status?: RequestFormStatusEnum;
}

export interface IAnnouncement extends IBaseEntity {
  content: string;
}

export interface IWeddingAnnouncement extends IBaseEntity {
  content: string;
  expiration: string | Date;
}

export interface IWeddingAppointment extends IBaseEntity {
  bride: string;
  brideAge: string;
  confirmedBy: string;
  contactNumber: string;
  date: string;
  dateConfirmation: string;
  dateCounseling: string;
  dateInterview: string;
  dateWedding: string;
  groom: string;
  groomAge: string;
  timeConfirmation: string;
  timeInterview: string;
  timeWedding: string;
  venue: string;
  status?: StatusEnum;
}

export interface IWeddingRequestForm extends IBaseEntity, IRequestFormRelease {
  address: string;
  bridesName: string;
  contactNumber: string;
  dateOfWedding: string;
  groomsName: string;
  status?: RequestFormStatusEnum;
}

export interface IFuneralRequestForm extends IBaseEntity, IRequestFormRelease {
  address: string;
  causeOfDeath: string;
  dateOfBirth: string;
  dateOfBurial: string;
  dateOfDeath: string;
  funeralStatus: string;
  nameOfInformant: string;
  nameOfTheDeceased: string;
  nearestKin: string;
  phoneNumberOfInformant: string;
  relationToTheDeceased: string;
  religion: string;
  status?: RequestFormStatusEnum;
}

export interface INotification {
  id?: string;
  message: string;
  timestamp: string;
  title: string;
  type:
    | "MassAppointment"
    | "HouseLiturgyAppointment"
    | "ChurchLiturgyAppointment"
    | "BaptismAppointment"
    | "BaptismRequestForm"
    | "ConfirmationAppointment"
    | "ConfirmationRequestForm"
    | "WeddingAnnouncement"
    | "WeddingAppointment"
    | "WeddingRequestForm"
    | "FuneralRequestForm"
    | "FuneralAppointment";
  read?: boolean;
  userId: string | null;
  fromAdmin?: boolean;
}

export type TDBEntities = {
  priests: IPriest;
  announcements: IAnnouncement;
  massAppointments: IMass;
  houseLiturgyAppointment: IHouseLiturgy;
  churchLiturgyAppointment: IChurchLiturgy;
  baptismAppointment: IBaptism;
  baptismRequestForm: IBaptismRequestForm;
  confirmationAppointment: IConfirmationAppointments;
  confirmationRequestForm: IConfirmationRequestForm;
  weddingAnnouncements: IWeddingAnnouncement;
  weddingAppointment: IWeddingAppointment;
  weddingRequestForm: IWeddingRequestForm;
  funeralAppointment: IFuneralRequestForm;
  funeralRequestForm: IFuneralRequestForm;
  notification: INotification;
};

export type TDBPaths =
  | "announcements"
  | "priests"
  | "massAppointments"
  | "houseLiturgyAppointment"
  | "churchLiturgyAppointment"
  | "baptismAppointment"
  | "baptismRequestForm"
  | "confirmationAppointment"
  | "confirmationRequestForm"
  | "weddingAnnouncements"
  | "weddingAppointment"
  | "weddingRequestForm"
  | "funeralAppointment"
  | "funeralRequestForm"
  | "notification";

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
      dateTimeStamp: new Date().toISOString(),
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
