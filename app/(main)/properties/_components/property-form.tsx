// components/PropertyForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    price: z.number().positive("Price must be positive"),
    location: z.string().min(2, "Location is required"),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
});

type PropertyFormValues = z.infer<typeof formSchema>;

interface PropertyFormProps {
    initialData?: Partial<PropertyFormValues>;
    onSubmit: (values: PropertyFormValues) => void;
    isSubmitting?: boolean;
    buttonText?: string;
}

export default function PropertyForm({
    initialData,
    onSubmit,
    isSubmitting = false,
    buttonText = "Save",
}: PropertyFormProps) {
    const form = useForm<PropertyFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: initialData?.title || "",
            price: initialData?.price || 0,
            location: initialData?.location || "",
            description: initialData?.description || "",
            images: initialData?.images || [],
        },
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages: string[] = [];
        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    newImages.push(reader.result);
                    form.setValue("images", [...(form.getValues("images") || []), reader.result]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <Label>Title</Label>
                <Input {...form.register("title")} />
                {form.formState.errors.title && (
                    <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
            </div>

            <div>
                <Label>Price (USD)</Label>
                <Input
                    type="number"
                    {...form.register("price", { valueAsNumber: true })}
                />
                {form.formState.errors.price && (
                    <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                )}
            </div>

            <div>
                <Label>Location</Label>
                <Input {...form.register("location")} />
                {form.formState.errors.location && (
                    <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
                )}
            </div>

            <div>
                <Label>Description</Label>
                <Textarea {...form.register("description")} rows={4} />
            </div>

            <div>
                <Label>Images</Label>
                <Input type="file" multiple accept="image/*" onChange={handleImageChange} />
                {form.watch("images")!.length > 0 && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                        {form.watch("images")?.map((img, i) => (
                            <img
                                key={i}
                                src={img}
                                alt="preview"
                                className="h-20 w-full object-cover rounded"
                            />
                        ))}
                    </div>
                )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Saving..." : buttonText}
            </Button>
        </form>
    );
}