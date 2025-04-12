import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [location] = useLocation();

  return (
    <header className="bg-primary text-white shadow-md hidden md:block">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-full mr-2">
              <i className="fas fa-mosque text-white text-2xl"></i>
            </div>
            <h1 className="font-heading text-2xl font-bold">MosqueTime</h1>
          </a>
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/">
                <a className={`hover:text-secondary transition-colors ${location === '/' ? 'text-secondary' : ''}`}>
                  Home
                </a>
              </Link>
            </li>
            <li>
              <Link href="/find-mosques">
                <a className={`hover:text-secondary transition-colors ${location === '/find-mosques' ? 'text-secondary' : ''}`}>
                  Find Mosques
                </a>
              </Link>
            </li>
            <li>
              <Link href="/register-mosque">
                <a className={`hover:text-secondary transition-colors ${location === '/register-mosque' ? 'text-secondary' : ''}`}>
                  Register Mosque
                </a>
              </Link>
            </li>
            <li>
              <Link href="/login">
                <a className="hover:text-secondary transition-colors">
                  Login
                </a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
