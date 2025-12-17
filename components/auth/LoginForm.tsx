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

import { RiLockPasswordLine, RiLoginCircleLine, RiMailLine } from 'react-icons/ri';
import { BiLoader } from "react-icons/bi";

import { GooogleIcon } from '@/components/icons/commonIcons';
import { MotionDiv } from '@/components/common/MotionDiv';
import { useEffect, useState } from 'react';

const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
});

export function LoginForm() {
    const { loginUser, loading } = useAuth();
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: '', password: '' }
    });
    const [currentFeature, setCurrentFeature] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const onSubmit = async (data: { email: string; password: string }) => {
        try {
            await loginUser(data);
            toast.success('Login successful');
            router.push('/');
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            // Implement Google Sign-In logic here
            // Example: await signInWithGoogle();
            toast.success('Google sign-in initiated');
            // router.push('/');
        } catch (error: any) {
            toast.error(error.message || 'Google sign-in failed');
        }
    };

    const features = [
        "Real-time Collaboration ✨",
        "AI Document Management 🤖",
        "Smart Content Writing ✍️",
        "Auto Summarization 📝",
        "File Upload & Storage 📁",
        "Export to PDF 📄",
        "Version Control 🔄",
        "Team Workspace 👥",
        "Cloud Sync ☁️",
        "Advanced Search 🔍"
    ];

    useEffect(() => {
        const currentFullText = features[currentFeature];

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                // Typing
                if (displayedText.length < currentFullText.length) {
                    setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
                } else {
                    // Pause before deleting
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            } else {
                // Deleting
                if (displayedText.length > 0) {
                    setDisplayedText(displayedText.slice(0, -1));
                } else {
                    // Move to next feature
                    setIsDeleting(false);
                    setCurrentFeature((prev) => (prev + 1) % features.length);
                }
            }
        }, isDeleting ? 50 : 100);

        return () => clearTimeout(timeout);
    }, [displayedText, isDeleting, currentFeature]);

    return (
        <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-md"
        >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
                {/* Header */}
                <div className="text-center pt-6 pb-4 bg-pink-50">
                    <MotionDiv
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-linear-to-br from-purple-400 to-pink-400 rounded-2xl shadow-lg"
                    >
                        <RiLoginCircleLine className="w-8 h-8 text-white" />
                    </MotionDiv>
                    <h1 className="text-3xl font-bold bg-linear-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                        Collab Sphere
                    </h1>
                    <p className="text-gray-600 mt-2 h-6 flex items-center justify-center">
                        <span className="inline-flex items-center font-semibold ml-1">
                            {displayedText}
                            <span className="inline-block w-0.5 h-4 bg-purple-600 ml-0.5 animate-pulse"></span>
                        </span>
                    </p>
                </div>

                {/* Form */}
                <div className="px-8 py-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                            {/* Forgot Password Link */}
                            <div className="text-right">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                onClick={form.handleSubmit(onSubmit)}
                                className={`w-full h-10 bg-linear-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <BiLoader className='animate-spin w-5 h-5' />
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign In'
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

                    {/* Google Sign In */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        className="w-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all font-semibold"
                    >
                        <GooogleIcon className="mr-2" />
                        Sign in with Google
                    </Button>

                    {/* Sign Up Link */}
                    <p className="mt-6 text-center text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-purple-600 hover:text-purple-700 font-semibold hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </MotionDiv>
    );
}