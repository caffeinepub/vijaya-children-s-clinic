import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AppointmentRequest {
    status: AppointmentStatus;
    email?: string;
    childAge: bigint;
    preferredDate: bigint;
    preferredTime: string;
    submissionTime: bigint;
    phoneNumber: string;
    childName: string;
    parentName: string;
    reason: string;
}
export interface UserProfile {
    name: string;
}
export enum AppointmentStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAppointment(request: AppointmentRequest): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAppointments(): Promise<Array<AppointmentRequest>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAppointmentStatus(index: bigint, newStatus: AppointmentStatus): Promise<void>;
}
