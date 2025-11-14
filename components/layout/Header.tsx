'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { FaBars, FaCog, FaSignOutAlt, FaTimes, FaUser } from 'react-icons/fa';

import { useAuth } from '@/hooks/useAuth';
import { MotionDiv } from '../common/MotionDiv';

export function Header() {
  const { user, logoutUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/#home' },
    { name: 'Features', href: '/#features' },
    { name: 'Testimonials', href: '/#testimonials' },
    { name: 'Get Started', href: '/#get-started' },
  ];

  // Smooth scrolling handler
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.split('#')[1];
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (href === '/#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center relative">
        {/* Logo */}
        <Link href="/" className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-500 to-purple-500">
          AI Editor
        </Link>

        {/* 💻 Navigation (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center space-x-6 mx-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="text-slate-600 hover:bg-linear-to-r hover:from-blue-500 hover:to-purple-500 hover:bg-clip-text hover:text-transparent transition-all duration-300"
            >
              {item.name}
            </Link>
          ))}
          {user && (
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="text-slate-600 hover:bg-linear-to-r hover:from-blue-500 hover:to-purple-500 hover:bg-clip-text hover:text-transparent"
              >
                Dashboard
              </Button>
            </Link>
          )}
        </nav>

        {/* 🗝️ Login/Register (Right Side) */}
        <div className="hidden md:flex items-center space-x-4">
          {!user && (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-slate-600 hover:bg-linear-to-r hover:from-blue-500 hover:to-purple-500 hover:bg-clip-text hover:text-transparent"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  className="bg-linear-to-r from-blue-200 to-purple-200 text-gray-600 hover:from-blue-500 hover:to-purple-500 hover:text-white shadow-xs hover:shadow-sm"
                >
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* ⚙️ Hamburger Icon for Mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-slate-600 hover:text-purple-500 ms-auto pr-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
        </Button>

        {/* 📲 Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <MotionDiv
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white w-[96%] border left-1/2 -translate-x-1/2 z-30 shadow-lg absolute top-16"
            >
              <div className="flex flex-col items-center py-6 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="text-slate-600 text-lg hover:bg-linear-to-r hover:from-blue-500 hover:to-purple-500 hover:bg-clip-text hover:text-transparent transition-all duration-300"
                  >
                    {item.name}
                  </Link>
                ))}
                {user && (
                  <Link href="/dashboard" className='w-full px-4'>
                    <Button
                      variant="ghost"
                      className="text-lg w-full font-normal bg-linear-to-r from-blue-200 to-purple-200 text-slate-600 hover:from-blue-500 hover:to-purple-500 hover:bg-linear-to-r hover:bg-clip-text hover:text-transparent"
                    >
                      Dashboard
                    </Button>
                  </Link>
                )}
                {!user && (
                  <>
                    <Link href="/login" className='w-full px-4'>
                      <Button
                        variant="ghost"
                        className="text-lg w-full bg-linear-to-r from-orange-200 to-pink-200 text-slate-600 hover:bg-linear-to-r hover:from-blue-500 hover:to-purple-500 hover:bg-clip-text hover:text-transparent"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" className='w-full px-4'>
                      <Button
                        variant="outline"
                        className="text-lg w-full bg-linear-to-r from-blue-200 to-purple-200 text-gray-600 hover:from-blue-500 hover:to-purple-500 hover:text-white shadow-xs hover:shadow-sm"
                      >
                        Register
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>

        {/* 👨🏻‍💼 User Profile (Right Side) */}
        {user && (
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center justify-center group cursor-pointer w-10 h-10 border-2 rounded-full overflow-hidden bg-linear-to-r from-blue-200 to-purple-200">
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto && `${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${user.profilePhoto}`}
                      alt="Profile"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-sm font-semibold rounded-full text-gray-600 group-hover:text-purple-500">
                      {user.firstName?.charAt(0)?.toUpperCase()}
                      {user.lastName?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white shadow-lg">
                <DropdownMenuItem>
                  <FaUser className="mr-2 h-4 w-4" />
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FaCog className="mr-2 h-4 w-4" />
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logoutUser}
                >
                  <FaSignOutAlt className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}