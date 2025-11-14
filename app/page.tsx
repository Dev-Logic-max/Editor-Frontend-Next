'use client';

import Link from 'next/link';
import { MotionDiv } from '@/components/common/MotionDiv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaBrain, FaUsers, FaEdit, FaStar } from 'react-icons/fa';
import LandingLayout from './LandinLayout';

export default function Home() {
  return (
    <LandingLayout>
      <div className="space-y-24 bg-cream-50">
        {/* Hero Section */}
        <section id="home" className="text-center py-20">
          <MotionDiv
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-6">
              AI-Powered Collaborative Text Editor
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Create, collaborate, and enhance your documents in real-time with intelligent AI suggestions.
            </p>
            <p className="text-sm my-6 text-gray-600">Collaborate in real-time with AI-powered suggestions.</p>
            <div className="space-x-4">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-blue-500 hover:bg-teal-400 text-white shadow-md transition-all duration-300"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-teal-100 hover:text-teal-600 shadow-sm transition-all duration-300"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </MotionDiv>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4">
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h2 className="text-3xl font-semibold text-center text-slate-900 mb-12">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <FaUsers className="h-6 w-6 text-blue-500" />
                    Real-Time Collaboration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Work together seamlessly with multiple users editing documents in real-time.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <FaBrain className="h-6 w-6 text-blue-500" />
                    AI Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Get intelligent suggestions to improve your writing with AI-powered insights.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <FaEdit className="h-6 w-6 text-blue-500" />
                    Easy Document Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Organize, share, and track your documents effortlessly.
                  </p>
                </CardContent>
              </Card>
            </div>
          </MotionDiv>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="bg-cream-100 py-16">
          <div className="container mx-auto px-4">
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <h2 className="text-3xl font-semibold text-center text-slate-900 mb-12">
                What Our Users Say
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <FaStar className="h-5 w-5 text-yellow-400" />
                      John Doe
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">
                      "This editor has transformed our team’s workflow. The AI suggestions are spot-on!"
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <FaStar className="h-5 w-5 text-yellow-400" />
                      Jane Smith
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">
                      "Real-time collaboration is seamless, and the interface is so intuitive."
                    </p>
                  </CardContent>
                </Card>
              </div>
            </MotionDiv>
          </div>
        </section>

        {/* CTA Section */}
        <section id="get-started" className="text-center py-16 bg-blue-50">
          <MotionDiv
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-3xl font-semibold text-slate-900 mb-6">Ready to Start?</h2>
            <p className="text-xl text-slate-600 mb-8 max-w-xl mx-auto">
              Join thousands of users collaborating smarter with our AI-powered editor.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="bg-blue-500 hover:bg-teal-400 text-white shadow-md transition-all duration-300"
              >
                Sign Up Now
              </Button>
            </Link>
          </MotionDiv>
        </section>
      </div>
    </LandingLayout>
  );
}