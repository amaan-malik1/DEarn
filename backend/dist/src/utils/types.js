import z from "zod";
export const createTaskInput = z.object({
    options: z.array(z.object({
        imgageUrl: z.string(),
    })),
    title: z.string().optional(),
    signature: z.string(),
});
//# sourceMappingURL=types.js.map