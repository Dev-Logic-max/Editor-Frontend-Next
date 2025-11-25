'use client';

import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useForm } from 'react-hook-form';
import Link from 'next/link';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { RiLockPasswordLine, RiLoginCircleLine, RiMailLine } from 'react-icons/ri';
import { BiLoader } from "react-icons/bi";

import { MotionDiv } from '@/components/common/MotionDiv';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
});

export function LoginForm() {
    const { loginUser, loading } = useAuth();
    const router = useRouter();
    const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

    const onSubmit = async (data: { email: string; password: string }) => {
        try {
            await loginUser(data);
            toast.success('Login successful');
            router.push('/');
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
        }
    };

    return (
        <MotionDiv
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative w-full max-w-md"
        >
            <div className="w-full max-w-md relative backdrop-blur-2xl p-8 bg-white rounded-xl shadow-md">
                <div className="relative text-center mb-8">
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
                    <p className="0 mt-2">Real-time collaborative editing</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 group-focus-within:text-purple-400 transition-colors" />
                                            <Input
                                                type="email"
                                                placeholder="you@example.com"
                                                className="pl-11"
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
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5  group-focus-within:text-pink-400 transition-colors" />
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                className="pl-11"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full bg-linear-to-br from-purple-300 to-indigo-300 hover:from-purple-400 hover:to-indigo-400 shadow-lg hover:shadow-xl">
                            {loading ? <>Logging in ...<BiLoader className='animate-spin'/></> : 'Login'}
                        </Button>
                    </form>
                </Form>
                <p className="mt-4 text-center">
                    Don’t have an account? <Link href="/register" className="text-blue-600">Register</Link>
                </p>
            </div>
        </MotionDiv>
    );
}