import z from "zod";
export declare const createTaskInput: z.ZodObject<{
    options: z.ZodArray<z.ZodObject<{
        imgageUrl: z.ZodString;
    }, z.z.core.$strip>>;
    title: z.ZodOptional<z.ZodString>;
    signature: z.ZodString;
}, z.z.core.$strip>;
//# sourceMappingURL=types.d.ts.map