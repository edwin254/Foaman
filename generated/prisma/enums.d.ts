export declare const Role: {
    readonly CUSTOMER: "CUSTOMER";
    readonly WORKER: "WORKER";
    readonly SUPPLIER: "SUPPLIER";
    readonly ADMIN: "ADMIN";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const JobStatus: {
    readonly PENDING: "PENDING";
    readonly MATCHED: "MATCHED";
    readonly COMPLETED: "COMPLETED";
    readonly CANCELLED: "CANCELLED";
};
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
