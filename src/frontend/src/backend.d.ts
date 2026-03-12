import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Client {
    id: ClientId;
    name: string;
    createdAt: Time;
    email: string;
    notes: string;
    phone: string;
}
export type ClientId = string;
export interface ClientInput {
    name: string;
    email: string;
    notes: string;
    phone: string;
}
export interface backendInterface {
    addClient(input: ClientInput): Promise<void>;
    deleteClient(id: ClientId): Promise<void>;
    editClient(id: ClientId, input: ClientInput): Promise<void>;
    getAllClients(): Promise<Array<Client>>;
    getClient(id: ClientId): Promise<Client>;
}
