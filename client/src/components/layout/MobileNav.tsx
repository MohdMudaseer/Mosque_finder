import { Link, useLocation } from "wouter";
import { useEffect } from "react";

interface MobileNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, setIsOpen }) => {
  const [location] = useLocation();

  // Close mobile menu when navigating to a new page
  useEffect(() => {
    setIsOpen(false);
  }, [location, setIsOpen]);

  return (
    <>
      <div className="md:hidden bg-primary text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/">
            <a className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full mr-2">
                <i className="fas fa-mosque text-white text-xl"></i>
              </div>
              <h1 className="font-heading text-lg font-bold">MosqueTime</h1>
            </a>
          </Link>
          <button 
            className="text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)}>
          <div className="bg-primary text-white h-auto w-64 p-4 absolute right-0 top-14" onClick={e => e.stopPropagation()}>
            <nav>
              <ul className="space-y-4">
                <li>
                  <Link href="/">
                    <a className={`block py-2 px-4 hover:bg-primary-700 rounded ${location === '/' ? 'bg-primary-800' : ''}`}>
                      <i className="fas fa-home mr-2"></i> Home
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/find-mosques">
                    <a className={`block py-2 px-4 hover:bg-primary-700 rounded ${location === '/find-mosques' ? 'bg-primary-800' : ''}`}>
                      <i className="fas fa-mosque mr-2"></i> Find Mosques
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/register-mosque">
                    <a className={`block py-2 px-4 hover:bg-primary-700 rounded ${location === '/register-mosque' ? 'bg-primary-800' : ''}`}>
                      <i className="fas fa-user-plus mr-2"></i> Register Mosque
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/login">
                    <a className="block py-2 px-4 hover:bg-primary-700 rounded">
                      <i className="fas fa-sign-in-alt mr-2"></i> Login
                    </a>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
