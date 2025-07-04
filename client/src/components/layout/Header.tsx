import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/utils";

const Header = () => {
  const location = useLocation();
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/me');
        return response;
      } catch (error) {
        return null;
      }
    }
  });

  const isMosqueAdmin = user?.role === 'committee';
  const isSystemAdmin = user?.role === 'admin';

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/logout');
      window.location.href = '/login';
    } catch (err) {
      alert('Logout failed.');
    }
  };

  return (
    <header className="bg-primary text-white shadow-md hidden md:block">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <div className="bg-primary/10 p-2 rounded-full mr-2">
            <i className="fas fa-mosque text-white text-2xl"></i>
          </div>
          <h1 className="font-heading text-2xl font-bold">MosqueTime</h1>
        </Link>
        <nav>
          <ul className="flex space-x-6 items-center">
            <li>
              <Link 
                to="/"
                className={`hover:text-secondary transition-colors ${location.pathname === '/' ? 'text-secondary' : ''}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/find-mosques"
                className={`hover:text-secondary transition-colors ${location.pathname === '/find-mosques' ? 'text-secondary' : ''}`}
              >
                Find Mosques
              </Link>
            </li>
            <li>
              <Link 
                to="/register-mosque"
                className={`hover:text-secondary transition-colors ${location.pathname === '/register-mosque' ? 'text-secondary' : ''}`}
              >
                Register Mosque
              </Link>
            </li>
            {isSystemAdmin && (
              <li>
                <Link
                  to="/admin/dashboard"
                  className={`hover:text-secondary transition-colors ${location.pathname === '/admin/dashboard' ? 'text-secondary' : ''}`}
                >
                  System Admin
                </Link>
              </li>
            )}
            {isMosqueAdmin && (
              <li>
                <Link 
                  to="/admin/pending-mosques"
                  className={`hover:text-secondary transition-colors ${location.pathname === '/admin/pending-mosques' ? 'text-secondary' : ''}`}
                >
                  Pending Mosques
                </Link>
              </li>
            )}
            <li>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="hover:text-secondary transition-colors bg-transparent border-none cursor-pointer"
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  Logout
                </button>
              ) : (
                <Link to="/login" className="hover:text-secondary transition-colors">Login</Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
      {/* No email/role or extra message in header as per user request */}
    </header>
  );
}

export default Header;
