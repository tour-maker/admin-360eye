// src/layouts/DashboardLayout.jsx

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';


const DashboardLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-0 md:ml-64 p-4 flex-1 bg-secondary-100 min-h-[100vh]">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;