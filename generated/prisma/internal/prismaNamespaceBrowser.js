import * as runtime from "@prisma/client/runtime/index-browser";
export const Decimal = runtime.Decimal;
export const NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
export const DbNull = runtime.DbNull;
export const JsonNull = runtime.JsonNull;
export const AnyNull = runtime.AnyNull;
export const ModelName = {
    User: 'User',
    Worker: 'Worker',
    Job: 'Job'
};
export const TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
export const UserScalarFieldEnum = {
    id: 'id',
    phone: 'phone',
    fullName: 'fullName',
    location: 'location',
    role: 'role',
    createdAt: 'createdAt'
};
export const WorkerScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    idNumber: 'idNumber',
    skill: 'skill',
    isVerified: 'isVerified'
};
export const JobScalarFieldEnum = {
    id: 'id',
    customerId: 'customerId',
    skillNeeded: 'skillNeeded',
    location: 'location',
    description: 'description',
    status: 'status'
};
export const SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
export const QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
export const NullsOrder = {
    first: 'first',
    last: 'last'
};
//# sourceMappingURL=prismaNamespaceBrowser.js.map