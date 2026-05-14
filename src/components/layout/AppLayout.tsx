import { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopBar from './TopBar';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-8 px-4 lg:px-6 py-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
