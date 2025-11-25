'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { DashboardIcon, DocumentIcon, FileIcon, FolderIcon, SettingsIcon, UsersIcon } from '@/components/icons/Document';
import { SidebarDocumentList } from '@/components/documents/SidebarDocumentList';
import { Button } from '@/components/ui/button';

import { FaPlus, FaChevronRight, FaChevronLeft, FaBars } from 'react-icons/fa';
import { LuLayoutDashboard } from "react-icons/lu";

import { useDocuments } from '@/hooks/useDocuments';
import { MotionDiv } from '../common/MotionDiv';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { createDocument } = useDocuments();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { name: 'Documents', icon: <FileIcon className="h-6 w-6" />, href: '/documents' },
    { name: 'Collaborators', icon: <UsersIcon className="h-6 w-6" />, href: '/collaborators' },
    { name: 'Settings', icon: <SettingsIcon className="h-6 w-6" />, href: '/settings' },
  ];

  const handleCreateDocument = async () => {
    try {
      const response = await createDocument({ title: 'New Document' });
      toast.success('Document created successfully');
      router.push(`/editor/${response.data.data._id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create document');
    }
  };

  const NavSection = () => (
    <nav className="space-y-1.5 py-2 mb-3 border-b">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`flex items-center gap-3 px-2 py-1.5 rounded-md text-slate-600 hover:shadow bg-linear-to-r ${pathname === item.href
            ? 'from-orange-100/80 to-purple-100/80 hover:bg-blue-100 shadow-md'
            : 'hover:from-blue-100/80 hover:to-purple-100/80'
            } transition-all duration-300`}
        >
          {item.icon}
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  );

  const Documents = () => (
    <div className="border-b pb-2 mb-3">
      <div className="group flex items-center justify-between mb-3">
        <h2 className="flex items-center text-lg font-semibold text-slate-800">
          <DocumentIcon className='w-7 h-7 mr-2' /> Documents
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreateDocument}
          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-purple-400 hover:bg-purple-100"
        >
          <FaPlus />
        </Button>
      </div>
      <SidebarDocumentList isSidebar />
    </div>
  )

  const Imports = () => (
    <div className="hidden">
      <div className="group flex items-center justify-between mb-3">
        <h2 className="flex items-center text-lg font-semibold text-slate-800">
          <FolderIcon className='w-7 h-7 mr-2' /> Imports
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-purple-400 hover:bg-purple-100"
        >
          <FaPlus />
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-18 left-4 z-20 bg-white border rounded-full p-2 shadow-sm"
      >
        <FaBars className="h-6 w-6 text-slate-600" />
      </Button>

      {/* Mobile Sidebar */}
      <MotionDiv
        initial={{ x: '-100%' }}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        transition={{ duration: 0.3 }}
        className={`md:static md:hidden fixed top-16 left-2 bg-white shadow-md border z-10 transition-all duration-300 
          ${isSidebarOpen ? 'w-64 p-4' : 'hidden p-0 overflow-hidden'} md:w-64 md:p-4 flex flex-col rounded-lg`}
      >
        <>
          <h1 className="flex items-center pb-4 text-lg border-b font-semibold text-slate-800">
            <Link href="/dashboard" className='flex'><LuLayoutDashboard className='w-5 h-5 mr-4' /> Collab Sphere</Link>
          </h1>
          <NavSection />
          <Documents />
        </>
      </MotionDiv>

      {/* Desktop Sidebar */}
      <aside
        className={`bg-white transition-all duration-300 border relative shadow ${isSidebarOpen ? 'w-56 p-4' : 'w-16 my-3 ms-3 rounded-lg p-2'} md:flex flex-col hidden`}
      >
        {/* Buttons for Desktop */}
        <Button
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`mb-4 absolute m-0 w-8 h-8 -right-4 ${isSidebarOpen ? '' : 'top-9'} rounded-full border cursor-pointer bg-gray-50 hover:bg-gray-100`}
        >
          {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </Button>
        {isSidebarOpen ? (
          <>
            <h1 className="flex items-center pb-4 text-lg border-b font-semibold text-slate-800">
              <Link href="/dashboard" className='flex'><DashboardIcon className='w-6 h-6 mr-2' /> Collab Sphere</Link>
            </h1>
            <NavSection />
            <Documents />
            <Imports />
          </>
        ) : (
          <div className="flex flex-col items-center space-y-5">
            <div className='border-b pb-4'>
              <DashboardIcon className="w-6 h-6 mt-2" />
            </div>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={`flex justify-center items-center w-10 h-10 rounded-md text-slate-600 hover:bg-gray-100 ${pathname === item.href ? 'border shadow bg-purple-100 text-purple-700' : ''}`}
              >
                {item.icon}
              </Link>
            ))}
            <div className='space-y-8'>
              <p className="flex items-center text-slate-800">
                <DocumentIcon className='w-6 h-6' />
              </p>
              <p className="flex items-center text-slate-800">
                <FolderIcon className='w-6 h-6' />
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}