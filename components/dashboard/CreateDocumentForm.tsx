'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useDocuments } from '@/hooks/useDocuments';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const schema = z.object({
    title: z.string().min(1, 'Title is required'),
});

export function CreateDocumentForm() {
    const { createDocument } = useDocuments();
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { title: '' },
    });

    const onSubmit = async (data: { title: string }) => {
        try {
            const response = await createDocument(data);
            toast.success('Document created successfully');
            router.push(`/editor/${response.data.data._id}`);
        } catch (error: any) {
            toast.error(error.message);
            toast.error('Failed to create document');
        }
    };

    return (
        <div className="mb-4">
            <h2 className="text-xl font-semibold mb-4">Create New Document</h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center p-4 rounded-lg border gap-2 bg-linear-to-r from-sky-50/50 to-pink-50/50">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className='bg-linear-to-r from-blue-400/80 to-purple-400/80 mt-auto'>Create Document</Button>
                </form>
            </Form>
        </div>
    );
}