import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type WorkerModel = runtime.Types.Result.DefaultSelection<Prisma.$WorkerPayload>;
export type AggregateWorker = {
    _count: WorkerCountAggregateOutputType | null;
    _min: WorkerMinAggregateOutputType | null;
    _max: WorkerMaxAggregateOutputType | null;
};
export type WorkerMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    idNumber: string | null;
    skill: string | null;
    isVerified: boolean | null;
};
export type WorkerMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    idNumber: string | null;
    skill: string | null;
    isVerified: boolean | null;
};
export type WorkerCountAggregateOutputType = {
    id: number;
    userId: number;
    idNumber: number;
    skill: number;
    isVerified: number;
    _all: number;
};
export type WorkerMinAggregateInputType = {
    id?: true;
    userId?: true;
    idNumber?: true;
    skill?: true;
    isVerified?: true;
};
export type WorkerMaxAggregateInputType = {
    id?: true;
    userId?: true;
    idNumber?: true;
    skill?: true;
    isVerified?: true;
};
export type WorkerCountAggregateInputType = {
    id?: true;
    userId?: true;
    idNumber?: true;
    skill?: true;
    isVerified?: true;
    _all?: true;
};
export type WorkerAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WorkerWhereInput;
    orderBy?: Prisma.WorkerOrderByWithRelationInput | Prisma.WorkerOrderByWithRelationInput[];
    cursor?: Prisma.WorkerWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | WorkerCountAggregateInputType;
    _min?: WorkerMinAggregateInputType;
    _max?: WorkerMaxAggregateInputType;
};
export type GetWorkerAggregateType<T extends WorkerAggregateArgs> = {
    [P in keyof T & keyof AggregateWorker]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateWorker[P]> : Prisma.GetScalarType<T[P], AggregateWorker[P]>;
};
export type WorkerGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WorkerWhereInput;
    orderBy?: Prisma.WorkerOrderByWithAggregationInput | Prisma.WorkerOrderByWithAggregationInput[];
    by: Prisma.WorkerScalarFieldEnum[] | Prisma.WorkerScalarFieldEnum;
    having?: Prisma.WorkerScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: WorkerCountAggregateInputType | true;
    _min?: WorkerMinAggregateInputType;
    _max?: WorkerMaxAggregateInputType;
};
export type WorkerGroupByOutputType = {
    id: string;
    userId: string;
    idNumber: string;
    skill: string;
    isVerified: boolean;
    _count: WorkerCountAggregateOutputType | null;
    _min: WorkerMinAggregateOutputType | null;
    _max: WorkerMaxAggregateOutputType | null;
};
export type GetWorkerGroupByPayload<T extends WorkerGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<WorkerGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof WorkerGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], WorkerGroupByOutputType[P]> : Prisma.GetScalarType<T[P], WorkerGroupByOutputType[P]>;
}>>;
export type WorkerWhereInput = {
    AND?: Prisma.WorkerWhereInput | Prisma.WorkerWhereInput[];
    OR?: Prisma.WorkerWhereInput[];
    NOT?: Prisma.WorkerWhereInput | Prisma.WorkerWhereInput[];
    id?: Prisma.StringFilter<"Worker"> | string;
    userId?: Prisma.StringFilter<"Worker"> | string;
    idNumber?: Prisma.StringFilter<"Worker"> | string;
    skill?: Prisma.StringFilter<"Worker"> | string;
    isVerified?: Prisma.BoolFilter<"Worker"> | boolean;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type WorkerOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    idNumber?: Prisma.SortOrder;
    skill?: Prisma.SortOrder;
    isVerified?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type WorkerWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    userId?: string;
    idNumber?: string;
    AND?: Prisma.WorkerWhereInput | Prisma.WorkerWhereInput[];
    OR?: Prisma.WorkerWhereInput[];
    NOT?: Prisma.WorkerWhereInput | Prisma.WorkerWhereInput[];
    skill?: Prisma.StringFilter<"Worker"> | string;
    isVerified?: Prisma.BoolFilter<"Worker"> | boolean;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id" | "userId" | "idNumber">;
export type WorkerOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    idNumber?: Prisma.SortOrder;
    skill?: Prisma.SortOrder;
    isVerified?: Prisma.SortOrder;
    _count?: Prisma.WorkerCountOrderByAggregateInput;
    _max?: Prisma.WorkerMaxOrderByAggregateInput;
    _min?: Prisma.WorkerMinOrderByAggregateInput;
};
export type WorkerScalarWhereWithAggregatesInput = {
    AND?: Prisma.WorkerScalarWhereWithAggregatesInput | Prisma.WorkerScalarWhereWithAggregatesInput[];
    OR?: Prisma.WorkerScalarWhereWithAggregatesInput[];
    NOT?: Prisma.WorkerScalarWhereWithAggregatesInput | Prisma.WorkerScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Worker"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"Worker"> | string;
    idNumber?: Prisma.StringWithAggregatesFilter<"Worker"> | string;
    skill?: Prisma.StringWithAggregatesFilter<"Worker"> | string;
    isVerified?: Prisma.BoolWithAggregatesFilter<"Worker"> | boolean;
};
export type WorkerCreateInput = {
    id?: string;
    idNumber: string;
    skill: string;
    isVerified?: boolean;
    user: Prisma.UserCreateNestedOneWithoutWorkerProfileInput;
};
export type WorkerUncheckedCreateInput = {
    id?: string;
    userId: string;
    idNumber: string;
    skill: string;
    isVerified?: boolean;
};
export type WorkerUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    idNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    skill?: Prisma.StringFieldUpdateOperationsInput | string;
    isVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    user?: Prisma.UserUpdateOneRequiredWithoutWorkerProfileNestedInput;
};
export type WorkerUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    idNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    skill?: Prisma.StringFieldUpdateOperationsInput | string;
    isVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type WorkerCreateManyInput = {
    id?: string;
    userId: string;
    idNumber: string;
    skill: string;
    isVerified?: boolean;
};
export type WorkerUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    idNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    skill?: Prisma.StringFieldUpdateOperationsInput | string;
    isVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type WorkerUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    idNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    skill?: Prisma.StringFieldUpdateOperationsInput | string;
    isVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type WorkerNullableScalarRelationFilter = {
    is?: Prisma.WorkerWhereInput | null;
    isNot?: Prisma.WorkerWhereInput | null;
};
export type WorkerCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    idNumber?: Prisma.SortOrder;
    skill?: Prisma.SortOrder;
    isVerified?: Prisma.SortOrder;
};
export type WorkerMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    idNumber?: Prisma.SortOrder;
    skill?: Prisma.SortOrder;
    isVerified?: Prisma.SortOrder;
};
export type WorkerMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    idNumber?: Prisma.SortOrder;
    skill?: Prisma.SortOrder;
    isVerified?: Prisma.SortOrder;
};
export type WorkerCreateNestedOneWithoutUserInput = {
    create?: Prisma.XOR<Prisma.WorkerCreateWithoutUserInput, Prisma.WorkerUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.WorkerCreateOrConnectWithoutUserInput;
    connect?: Prisma.WorkerWhereUniqueInput;
};
export type WorkerUncheckedCreateNestedOneWithoutUserInput = {
    create?: Prisma.XOR<Prisma.WorkerCreateWithoutUserInput, Prisma.WorkerUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.WorkerCreateOrConnectWithoutUserInput;
    connect?: Prisma.WorkerWhereUniqueInput;
};
export type WorkerUpdateOneWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.WorkerCreateWithoutUserInput, Prisma.WorkerUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.WorkerCreateOrConnectWithoutUserInput;
    upsert?: Prisma.WorkerUpsertWithoutUserInput;
    disconnect?: Prisma.WorkerWhereInput | boolean;
    delete?: Prisma.WorkerWhereInput | boolean;
    connect?: Prisma.WorkerWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.WorkerUpdateToOneWithWhereWithoutUserInput, Prisma.WorkerUpdateWithoutUserInput>, Prisma.WorkerUncheckedUpdateWithoutUserInput>;
};
export type WorkerUncheckedUpdateOneWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.WorkerCreateWithoutUserInput, Prisma.WorkerUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.WorkerCreateOrConnectWithoutUserInput;
    upsert?: Prisma.WorkerUpsertWithoutUserInput;
    disconnect?: Prisma.WorkerWhereInput | boolean;
    delete?: Prisma.WorkerWhereInput | boolean;
    connect?: Prisma.WorkerWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.WorkerUpdateToOneWithWhereWithoutUserInput, Prisma.WorkerUpdateWithoutUserInput>, Prisma.WorkerUncheckedUpdateWithoutUserInput>;
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type WorkerCreateWithoutUserInput = {
    id?: string;
    idNumber: string;
    skill: string;
    isVerified?: boolean;
};
export type WorkerUncheckedCreateWithoutUserInput = {
    id?: string;
    idNumber: string;
    skill: string;
    isVerified?: boolean;
};
export type WorkerCreateOrConnectWithoutUserInput = {
    where: Prisma.WorkerWhereUniqueInput;
    create: Prisma.XOR<Prisma.WorkerCreateWithoutUserInput, Prisma.WorkerUncheckedCreateWithoutUserInput>;
};
export type WorkerUpsertWithoutUserInput = {
    update: Prisma.XOR<Prisma.WorkerUpdateWithoutUserInput, Prisma.WorkerUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.WorkerCreateWithoutUserInput, Prisma.WorkerUncheckedCreateWithoutUserInput>;
    where?: Prisma.WorkerWhereInput;
};
export type WorkerUpdateToOneWithWhereWithoutUserInput = {
    where?: Prisma.WorkerWhereInput;
    data: Prisma.XOR<Prisma.WorkerUpdateWithoutUserInput, Prisma.WorkerUncheckedUpdateWithoutUserInput>;
};
export type WorkerUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    idNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    skill?: Prisma.StringFieldUpdateOperationsInput | string;
    isVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type WorkerUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    idNumber?: Prisma.StringFieldUpdateOperationsInput | string;
    skill?: Prisma.StringFieldUpdateOperationsInput | string;
    isVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type WorkerSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    idNumber?: boolean;
    skill?: boolean;
    isVerified?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["worker"]>;
export type WorkerSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    idNumber?: boolean;
    skill?: boolean;
    isVerified?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["worker"]>;
export type WorkerSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    idNumber?: boolean;
    skill?: boolean;
    isVerified?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["worker"]>;
export type WorkerSelectScalar = {
    id?: boolean;
    userId?: boolean;
    idNumber?: boolean;
    skill?: boolean;
    isVerified?: boolean;
};
export type WorkerOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "idNumber" | "skill" | "isVerified", ExtArgs["result"]["worker"]>;
export type WorkerInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type WorkerIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type WorkerIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $WorkerPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Worker";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        idNumber: string;
        skill: string;
        isVerified: boolean;
    }, ExtArgs["result"]["worker"]>;
    composites: {};
};
export type WorkerGetPayload<S extends boolean | null | undefined | WorkerDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$WorkerPayload, S>;
export type WorkerCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<WorkerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: WorkerCountAggregateInputType | true;
};
export interface WorkerDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Worker'];
        meta: {
            name: 'Worker';
        };
    };
    findUnique<T extends WorkerFindUniqueArgs>(args: Prisma.SelectSubset<T, WorkerFindUniqueArgs<ExtArgs>>): Prisma.Prisma__WorkerClient<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends WorkerFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, WorkerFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__WorkerClient<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends WorkerFindFirstArgs>(args?: Prisma.SelectSubset<T, WorkerFindFirstArgs<ExtArgs>>): Prisma.Prisma__WorkerClient<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends WorkerFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, WorkerFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__WorkerClient<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends WorkerFindManyArgs>(args?: Prisma.SelectSubset<T, WorkerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends WorkerCreateArgs>(args: Prisma.SelectSubset<T, WorkerCreateArgs<ExtArgs>>): Prisma.Prisma__WorkerClient<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends WorkerCreateManyArgs>(args?: Prisma.SelectSubset<T, WorkerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends WorkerCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, WorkerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends WorkerDeleteArgs>(args: Prisma.SelectSubset<T, WorkerDeleteArgs<ExtArgs>>): Prisma.Prisma__WorkerClient<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends WorkerUpdateArgs>(args: Prisma.SelectSubset<T, WorkerUpdateArgs<ExtArgs>>): Prisma.Prisma__WorkerClient<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends WorkerDeleteManyArgs>(args?: Prisma.SelectSubset<T, WorkerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends WorkerUpdateManyArgs>(args: Prisma.SelectSubset<T, WorkerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends WorkerUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, WorkerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends WorkerUpsertArgs>(args: Prisma.SelectSubset<T, WorkerUpsertArgs<ExtArgs>>): Prisma.Prisma__WorkerClient<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends WorkerCountArgs>(args?: Prisma.Subset<T, WorkerCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], WorkerCountAggregateOutputType> : number>;
    aggregate<T extends WorkerAggregateArgs>(args: Prisma.Subset<T, WorkerAggregateArgs>): Prisma.PrismaPromise<GetWorkerAggregateType<T>>;
    groupBy<T extends WorkerGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: WorkerGroupByArgs['orderBy'];
    } : {
        orderBy?: WorkerGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, WorkerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWorkerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: WorkerFieldRefs;
}
export interface Prisma__WorkerClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface WorkerFieldRefs {
    readonly id: Prisma.FieldRef<"Worker", 'String'>;
    readonly userId: Prisma.FieldRef<"Worker", 'String'>;
    readonly idNumber: Prisma.FieldRef<"Worker", 'String'>;
    readonly skill: Prisma.FieldRef<"Worker", 'String'>;
    readonly isVerified: Prisma.FieldRef<"Worker", 'Boolean'>;
}
export type WorkerFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    include?: Prisma.WorkerInclude<ExtArgs> | null;
    where: Prisma.WorkerWhereUniqueInput;
};
export type WorkerFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    include?: Prisma.WorkerInclude<ExtArgs> | null;
    where: Prisma.WorkerWhereUniqueInput;
};
export type WorkerFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    include?: Prisma.WorkerInclude<ExtArgs> | null;
    where?: Prisma.WorkerWhereInput;
    orderBy?: Prisma.WorkerOrderByWithRelationInput | Prisma.WorkerOrderByWithRelationInput[];
    cursor?: Prisma.WorkerWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WorkerScalarFieldEnum | Prisma.WorkerScalarFieldEnum[];
};
export type WorkerFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    include?: Prisma.WorkerInclude<ExtArgs> | null;
    where?: Prisma.WorkerWhereInput;
    orderBy?: Prisma.WorkerOrderByWithRelationInput | Prisma.WorkerOrderByWithRelationInput[];
    cursor?: Prisma.WorkerWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WorkerScalarFieldEnum | Prisma.WorkerScalarFieldEnum[];
};
export type WorkerFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    include?: Prisma.WorkerInclude<ExtArgs> | null;
    where?: Prisma.WorkerWhereInput;
    orderBy?: Prisma.WorkerOrderByWithRelationInput | Prisma.WorkerOrderByWithRelationInput[];
    cursor?: Prisma.WorkerWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WorkerScalarFieldEnum | Prisma.WorkerScalarFieldEnum[];
};
export type WorkerCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    include?: Prisma.WorkerInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WorkerCreateInput, Prisma.WorkerUncheckedCreateInput>;
};
export type WorkerCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.WorkerCreateManyInput | Prisma.WorkerCreateManyInput[];
    skipDuplicates?: boolean;
};
export type WorkerCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    data: Prisma.WorkerCreateManyInput | Prisma.WorkerCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.WorkerIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type WorkerUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    include?: Prisma.WorkerInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WorkerUpdateInput, Prisma.WorkerUncheckedUpdateInput>;
    where: Prisma.WorkerWhereUniqueInput;
};
export type WorkerUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.WorkerUpdateManyMutationInput, Prisma.WorkerUncheckedUpdateManyInput>;
    where?: Prisma.WorkerWhereInput;
    limit?: number;
};
export type WorkerUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WorkerUpdateManyMutationInput, Prisma.WorkerUncheckedUpdateManyInput>;
    where?: Prisma.WorkerWhereInput;
    limit?: number;
    include?: Prisma.WorkerIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type WorkerUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    include?: Prisma.WorkerInclude<ExtArgs> | null;
    where: Prisma.WorkerWhereUniqueInput;
    create: Prisma.XOR<Prisma.WorkerCreateInput, Prisma.WorkerUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.WorkerUpdateInput, Prisma.WorkerUncheckedUpdateInput>;
};
export type WorkerDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    include?: Prisma.WorkerInclude<ExtArgs> | null;
    where: Prisma.WorkerWhereUniqueInput;
};
export type WorkerDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WorkerWhereInput;
    limit?: number;
};
export type WorkerDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    include?: Prisma.WorkerInclude<ExtArgs> | null;
};
