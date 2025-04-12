import React from "react";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary/10 border-t border-primary/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <i className="fas fa-mosque text-primary text-2xl mr-2"></i>
              <span className="font-heading text-xl font-bold text-primary">MosqueTime</span>
            </div>
            <p className="text-neutral-dark/80 mb-4">
              Connecting Muslims to mosques and accurate prayer times globally.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary hover:text-primary/80">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-primary hover:text-primary/80">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-primary hover:text-primary/80">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="font-heading font-bold text-lg mb-4 text-neutral-dark">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-neutral-dark/80 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/find-mosques" className="text-neutral-dark/80 hover:text-primary transition-colors">
                  Find Mosques
                </Link>
              </li>
              <li>
                <Link href="/register-mosque" className="text-neutral-dark/80 hover:text-primary transition-colors">
                  Register Mosque
                </Link>
              </li>
              <li>
                <a href="#" className="text-neutral-dark/80 hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-dark/80 hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="md:col-span-1">
            <h3 className="font-heading font-bold text-lg mb-4 text-neutral-dark">Features</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-neutral-dark/80 hover:text-primary transition-colors">
                  Prayer Times
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-dark/80 hover:text-primary transition-colors">
                  Mosque Finder
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-dark/80 hover:text-primary transition-colors">
                  Qibla Direction
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-dark/80 hover:text-primary transition-colors">
                  Islamic Calendar
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-dark/80 hover:text-primary transition-colors">
                  Community Events
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-1">
            <h3 className="font-heading font-bold text-lg mb-4 text-neutral-dark">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt text-primary mt-1 mr-3"></i>
                <span className="text-neutral-dark/80">123 Islamic Way, New York, NY 10001</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-envelope text-primary mt-1 mr-3"></i>
                <span className="text-neutral-dark/80">info@mosquetime.com</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-phone text-primary mt-1 mr-3"></i>
                <span className="text-neutral-dark/80">+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/20 mt-12 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-dark/70 text-sm mb-4 md:mb-0">
              &copy; {currentYear} MosqueTime. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-neutral-dark/70 text-sm hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-neutral-dark/70 text-sm hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-neutral-dark/70 text-sm hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;