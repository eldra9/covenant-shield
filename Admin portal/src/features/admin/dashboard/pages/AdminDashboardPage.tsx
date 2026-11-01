import React from 'react';
import { CommandCenterView } from '../components/CommandCenterView';
import { AdminTab } from '@/components/admin/AdminSidebar';

interface AdminDashboardPageProps {
  onNavigate: (tab: AdminTab, recordId?: string) => void;
  defaultMode?: string;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  return <CommandCenterView onNavigate={onNavigate} />;
};
