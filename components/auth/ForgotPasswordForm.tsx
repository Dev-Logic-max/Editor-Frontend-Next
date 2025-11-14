'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import Link from 'next/link';

const schema = z.object({
  email: z.string().email('Invalid email'),
});

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      await forgotPassword(data.email);
      toast.success('Password reset link sent (check console for token)');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link');
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Send Reset Link
          </Button>
        </form>
      </Form>
      <p className="mt-4 text-center">
        Back to <Link href="/login" className="text-blue-600">Login</Link>
      </p>
    </div>
  );
}