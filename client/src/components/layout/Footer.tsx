import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-neutral-dark text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="mosque-dome mr-2 bg-white"></div>
              <h3 className="font-heading text-xl font-bold">MosqueTime</h3>
            </div>
            <p className="text-white/70 mb-4">Connecting worshippers to mosques and accurate prayer times.</p>
            <div className="flex gap-4">
              <a href="#" className="text-white hover:text-secondary transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary transition-colors">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/find-mosques">
                  <a className="text-white/70 hover:text-white transition-colors">Find Mosques</a>
                </Link>
              </li>
              <li>
                <Link href="/register-mosque">
                  <a className="text-white/70 hover:text-white transition-colors">Register Mosque</a>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <a className="text-white/70 hover:text-white transition-colors">Prayer Times</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors">Islamic Calendar</a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors">Mosque Events</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Subscribe</h4>
            <p className="text-white/70 mb-4">Stay updated with our newsletter.</p>
            <form>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="px-4 py-2 rounded-l-lg bg-neutral-light/10 border border-neutral-light/20 text-white w-full focus:outline-none focus:ring-1 focus:ring-secondary"
                />
                <button type="button" className="bg-secondary hover:bg-secondary/90 px-4 py-2 rounded-r-lg transition-colors">
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/70 text-sm">&copy; {new Date().getFullYear()} MosqueTime. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
