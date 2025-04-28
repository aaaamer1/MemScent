//Mood form UI
import { useForm } from "react-hook-form";
import { z } from "zod"; 
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";

const moodSchema = z.object({
  mood: z.enum(["happy", "calm", "focused", "energized", "relaxed"]),
}); // Define the schema for the form data using Zod

type MoodForm = z.infer<typeof moodSchema>; // Infer the type from the schema


export default function MoodInputForm({ onChange }: { onChange: (m: string) => void }) {
  const { register, watch } = useForm<MoodForm>({
    resolver: zodResolver(moodSchema),
    defaultValues: { mood: "calm" },
  });

  // Watch the mood field and call onChange when it updates
  const selectedMood = watch("mood");
  React.useEffect(() => {
    onChange(selectedMood);
  }, [selectedMood, onChange]);

  return (
    <div className="mb-6">
      <label className="block font-medium mb-2">Select your mood:</label>
      <select
        {...register("mood")}
        className="border rounded px-3 py-2 w-full max-w-xs"
      >
        <option value="happy">😊 Happy</option>
        <option value="calm">😌 Calm</option>
        <option value="focused">🎯 Focused</option>
        <option value="energized">⚡ Energized</option>
        <option value="relaxed">🛋️ Relaxed</option>
      </select>
    </div>
  );
}
