import { useState, useEffect } from "react";
import logo from "../../assets/images/360eye.png";
import { FiMenu, FiX, FiChevronDown, FiChevronUp, FiLogOut, FiSettings, FiHome, FiImage, FiLayers, FiMail, FiLock, FiHelpCircle, FiUsers, FiPlayCircle, FiLink } from "react-icons/fi";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";
import toast from "react-hot-toast";

const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDrawers, setOpenDrawers] = useState({
    product: false,
    album: false,
    client: false,
  });

  // Auto-close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-close drawers when navigating
  const location = useLocation();
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleDrawer = (drawerName) => {
    setOpenDrawers(prev => ({
      ...prev,
      [drawerName]: !prev[drawerName],
    }));
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
    toast.success("Logged out successfully!");
    navigate("/admin");
  };

  // Menu items data
  const menuItems = [
 
    {
      title: "Showcase360",
      icon: <FiLayers className="mr-3 text-lg" />,
      subItems: [
        { title: "Add Project", path: "/product/addProduct" },
        { title: "Manage Project", path: "/" },
        { title: "Property Status", path: "/property/propertyStatus" },
        { title: "Property Type", path: "/property/propertyType" },
        { title: "Add Area", path: "/area" },
        { title: "Filters", path: "/filters" },
      ]
    },
    {
      title: "Commercial Films",
      icon: <FiPlayCircle className="mr-3 text-lg" />,
      subItems: [
        { title: "Add Product", path: "/product/addcommercial" },
        { title: "Manage Product", path: "/managecommercial" }, 
      ]
    },
    {
      title: "3D ArcViz",
      icon: <FiImage className="mr-3 text-lg" />,
      subItems: [
        { title: "Add 3D ArcViz", path: "/album/addAlbum" },
        { title: "Upload Zip", path: "/album/uploadZip" },
      ]
    },
    // {
    //   title: "SEO",
    //   icon: <FiHelpCircle className="mr-3 text-lg" />,
    //   path: "/seo"
    // },
    {
      title: "Client",
      icon: <FiUsers className="mr-3 text-lg" />,
      subItems: [
        { title: "Add Client", path: "/slider/add" },
        { title: "Client List", path: "/slider" }
      ]
    },
    {
      title: "Blog",
      icon: <FiHelpCircle className="mr-3 text-lg" />,
      subItems: [
        { title: "Add Blog", path: "/blog/add" },
        { title: "Manage Blog", path: "/blog" },
      ]
    },
    {
      title: "Client Access",
      icon: <FiLock className="mr-3 text-lg" />,
      subItems: [
        { title: "Add Client Access", path: "/client-access/add" },
        { title: "Manage Client Access", path: "/client-access" },
      ]
    },
    {
      title: "URL Redirection",
      icon: <FiLink className="mr-3 text-lg" />,
      path: "/pageRedirect"
    },
    // {
    //   title: "Email Setting",
    //   icon: <FiSettings className="mr-3 text-lg" />,
    //   path: "/emailSetting"
    // },
    {
      title: "Allowed Domains",
      icon: <FiSettings className="mr-3 text-lg" />,
      path: "/security/allowed-domains"
    },
    {
      title: "Change Password",
      icon: <FiLock className="mr-3 text-lg" />,
      path: "/changePassword"
    },
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="block md:hidden fixed top-4 left-4 z-40">
        <button 
          className="p-2 rounded-lg bg-white text-dark-800 shadow-lg hover:bg-gray-100 transition-all"
          onClick={() => setIsMenuOpen(true)}
        >
          <FiMenu className="text-xl" />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transition-all duration-300 ease-in-out transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        style={{ maxHeight: '100vh', overflowY: 'auto' }}
      >
        {/* Logo and Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <img src={logo} alt="logo"   />
            
          </div>
          <button 
            className="p-1 rounded-md text-gray-500 hover:text-dark-800 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-4" style={{ height: 'calc(100vh - 80px)', overflowY: 'auto' }}>
          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.path ? (
                  <NavLink
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center p-3 rounded-lg transition-all mb-1 ${
                        isActive
                          ? "bg-primary-100 text-primary-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                  >
                    {item.icon}
                    <span className="font-medium">{item.title}</span>
                  </NavLink>
                ) : (
                  <div className="mb-1">
                    <button
                      onClick={() => toggleDrawer(item.title.toLowerCase())}
                      className={`flex items-center justify-between w-full p-3 rounded-lg transition-all ${
                        openDrawers[item.title.toLowerCase()]
                          ? "bg-gray-100 text-dark-800"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="font-medium">{item.title}</span>
                      </div>
                      {openDrawers[item.title.toLowerCase()] ? (
                        <FiChevronUp className="ml-2" />
                      ) : (
                        <FiChevronDown className="ml-2" />
                      )}
                    </button>
                    {openDrawers[item.title.toLowerCase()] && (
                      <div className="pl-4 mt-1 space-y-1">
                        {item.subItems.map((subItem, subIndex) => (
                          <NavLink
                            key={subIndex}
                            to={subItem.path}
                            end={subItem.path === "/slider"}
                            className={({ isActive }) =>
                              `block p-2 pl-10 rounded-lg transition-all text-sm ${
                                isActive
                                  ? "bg-primary-50 text-primary-600 font-medium"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`
                            }
                          >
                            {subItem.title}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Logout Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center w-full p-3 mt-4 text-red-600 rounded-lg hover:bg-red-50 transition-all"
            >
              <FiLogOut className="mr-3 text-lg" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </div>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
              <span className="font-medium">AD</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-dark-800">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
        message="Are you sure you want to logout?"
        desc="You can always login back!"
        action="Logout"
      />

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;