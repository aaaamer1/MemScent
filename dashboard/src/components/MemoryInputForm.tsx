//Memory form UI
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";

const memorySchema = z.object({
  memory: z.string().max(100, "Keep it under 100 characters").optional(),
});

type MemoryForm = z.infer<typeof memorySchema>;

export default function MemoryInputForm({ onChange }: { onChange: (m: string) => void }) {
  const { register, watch } = useForm<MemoryForm>({
    resolver: zodResolver(memorySchema),
    defaultValues: { memory: "" },
  });

  const text = watch("memory");
  React.useEffect(() => {
    onChange(text ?? "");
  }, [text, onChange]);

  return (
    <div className="mb-6">
      <label className="block text-gray-200 font-medium mb-2">Recall a memory:</label>
      <input
        {...register("memory")}
        type="text"
        placeholder="e.g. Beach trip"
        className="w-full max-w-md px-4 py-2 rounded-lg bg-gray-700 border border-gray-600
                    placeholder-gray-400 text-gray-100 focus:ring-2 focus:ring-green-400
                    transition"
      />
    </div>
  );
}
