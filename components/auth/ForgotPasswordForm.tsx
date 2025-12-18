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
import { MotionDiv } from '@/components/common/MotionDiv';
import { RiMailLine, RiKeyLine, RiArrowLeftLine } from 'react-icons/ri';
import { BiLoader } from 'react-icons/bi';

const schema = z.object({
  email: z.string().email('Invalid email'),
});

export function ForgotPasswordForm() {
  const { requestPasswordReset, loading } = useAuth();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      await requestPasswordReset(data.email);
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link');
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-br from-purple-50 to-blue-50 p-6 text-center">
          <MotionDiv
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-linear-to-br from-purple-500 to-blue-500 rounded-2xl shadow-lg"
          >
            <RiKeyLine className="w-8 h-8 text-white" />
          </MotionDiv>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-600">
            No worries, we'll send you reset instructions
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-6">
          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">Email</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <Input 
                          type="email" 
                          placeholder="you@example.com"
                          className="pl-11 h-10 font-semibold border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={loading}
                onClick={form.handleSubmit(onSubmit)}
                className="w-full h-10 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <BiLoader className='animate-spin w-5 h-5'/>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </div>
          </Form>

          {/* Back to Login Link */}
          <div className="mt-6">
            <Link 
              href="/login" 
              className="flex items-center justify-center gap-2 w-fit mx-auto text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
            >
              <RiArrowLeftLine className="w-5 h-5" />
              Back to Sign In
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-2 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-gray-600 text-center">
              📧 Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder
            </p>
          </div>
        </div>
      </div>
    </MotionDiv>
  );
}