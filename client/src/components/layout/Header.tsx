import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

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
          <ul className="flex space-x-6">
            <li>
              <Link 
                to="/"
                className={`hover:text-secondary transition-colors ${location === '/' ? 'text-secondary' : ''}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/find-mosques"
                className={`hover:text-secondary transition-colors ${location === '/find-mosques' ? 'text-secondary' : ''}`}
              >
                Find Mosques
              </Link>
            </li>
            <li>
              <Link 
                to="/register-mosque"
                className={`hover:text-secondary transition-colors ${location === '/register-mosque' ? 'text-secondary' : ''}`}
              >
                Register Mosque
              </Link>
            </li>
            <li>
              <Link 
                to="/login"
                className="hover:text-secondary transition-colors"
              >
                Login
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
