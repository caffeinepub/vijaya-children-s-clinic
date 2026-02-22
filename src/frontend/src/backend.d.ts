import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StaffCredentials {
    userId: string;
    password: string;
}
export interface StaffUser {
    status: ActivationStatus;
    userId: string;
    password: string;
    email?: string;
}
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
export enum ActivationStatus {
    activated = "activated",
    deleted = "deleted",
    deactivated = "deactivated"
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
    authenticateStaff(arg0: StaffCredentials): Promise<boolean>;
    createAppointment(request: AppointmentRequest): Promise<void>;
    createStaffUser(newUser: StaffUser): Promise<void>;
    deactivateStaffUser(userId: string): Promise<void>;
    deleteStaffUser(userId: string): Promise<void>;
    getAllActiveStaffUsers(): Promise<Array<StaffUser>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDeletedStaffUsers(): Promise<Array<StaffUser>>;
    getInactiveStaffUsers(): Promise<Array<StaffUser>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAppointments(): Promise<Array<AppointmentRequest>>;
    logoutStaff(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAppointmentStatus(index: bigint, newStatus: AppointmentStatus): Promise<void>;
    updateStaffUser(userId: string, updatedUser: StaffUser): Promise<void>;
}
