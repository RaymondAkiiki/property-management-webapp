// Update in /src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiSettings, 
  FiGrid,
  FiFileText, // Add this import
  FiTool, 
  FiDollarSign 
} from 'react-icons/fi';

const Sidebar = () => {
  const menuItems = [
    { path: '/', name: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
    { path: '/properties', name: 'Properties', icon: <FiGrid className="w-5 h-5" /> },
    { path: '/tenants', name: 'Tenants', icon: <FiUsers className="w-5 h-5" /> },
    { path: '/documents', name: 'Documents', icon: <FiFileText className="w-5 h-5" /> }, // Add this item
    { path: '/maintenance', name: 'Maintenance', icon: <FiTool className="w-5 h-5" /> },
    { path: '/payments', name: 'Payments', icon: <FiDollarSign className="w-5 h-5" /> },
    { path: '/settings', name: 'Settings', icon: <FiSettings className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-gray-800 text-white h-full w-64 flex-shrink-0">
      <div className="p-4">
        <h1 className="text-xl font-bold">PropertyPro</h1>
      </div>
      <nav className="mt-6">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className="mb-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                    isActive ? 'bg-gray-700 text-white' : ''
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;