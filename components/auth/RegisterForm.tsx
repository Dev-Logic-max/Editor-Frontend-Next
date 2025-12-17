'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { RiUserAddLine, RiUserLine, RiMailLine, RiLockPasswordLine } from 'react-icons/ri';
import { BiLoader } from 'react-icons/bi';

import { GooogleIcon } from '@/components/icons/commonIcons';
import { MotionDiv } from '@/components/common/MotionDiv';

const schema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().optional(),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function RegisterForm() {
    const { registerUser, loading } = useAuth();
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { firstName: '', lastName: '', email: '', password: '' },
    });

    const onSubmit = async (data: { firstName: string; lastName?: string; email: string; password: string }) => {
        try {
            await registerUser(data);
            toast.success('Registration successful');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Registration failed');
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            // Implement Google Sign-Up logic here
            // Example: await signUpWithGoogle();
            toast.success('Google sign-up initiated');
            // router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Google sign-up failed');
        }
    };

    return (
        <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-md"
        >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
                {/* Header */}
                <div className="pt-6 pb-4 text-center bg-blue-50">
                    <MotionDiv
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-linear-to-br from-purple-500 to-blue-500 rounded-2xl shadow-lg"
                    >
                        <RiUserAddLine className="w-8 h-8 text-white" />
                    </MotionDiv>
                    <h1 className="text-3xl font-bold bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                        Create Account
                    </h1>
                    <p className="text-gray-600 mt-2">Join Collab Sphere today</p>
                </div>

                {/* Form */}
                <div className="px-8 py-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-semibold">First Name</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <RiUserLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                                    <Input 
                                                        placeholder="John"
                                                        className="pl-11 h-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                        {...field} 
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-semibold">Last Name</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Doe"
                                                    className="h-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

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
                                                    className="pl-11 h-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                    {...field} 
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-semibold">Password</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                                <Input 
                                                    type="password" 
                                                    placeholder="••••••••"
                                                    className="pl-11 h-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
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
                                className={`w-full h-10 bg-linear-to-r from-purple-400 to-indigo-400 hover:to-indigo-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <BiLoader className='animate-spin w-5 h-5'/>
                                        Creating account...
                                    </span>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>
                    </Form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign Up */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignUp}
                        className="w-full h-10 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all font-semibold"
                    >
                        <GooogleIcon className="mr-2" />
                        Sign up with Google
                    </Button>

                    {/* Sign In Link */}
                    <p className="mt-6 text-center text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </MotionDiv>
    );
}