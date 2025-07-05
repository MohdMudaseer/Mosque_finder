
import React from "react";
import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-primary/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-6">
              <div className="bg-primary/10 p-2 rounded-full mr-2">
                <i className="fas fa-mosque text-primary text-2xl"></i>
              </div>
              <div className="ml-1">
                <span className="font-heading text-2xl font-bold text-primary block">MosqueTime</span>
                <span className="text-sm text-muted-foreground">Prayer Times & More</span>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Connecting Muslims to mosques and providing accurate prayer times globally. Your trusted companion for spiritual guidance.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="font-heading font-bold text-xl mb-6 text-primary">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group">
                  <i className="fas fa-chevron-right text-xs mr-2 transition-transform group-hover:translate-x-1"></i>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/find-mosques" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group">
                  <i className="fas fa-chevron-right text-xs mr-2 transition-transform group-hover:translate-x-1"></i>
                  Find Mosques
                </Link>
              </li>
              <li>
                <Link href="/register-mosque" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group">
                  <i className="fas fa-chevron-right text-xs mr-2 transition-transform group-hover:translate-x-1"></i>
                  Register Mosque
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center group">
                  <i className="fas fa-chevron-right text-xs mr-2 transition-transform group-hover:translate-x-1"></i>
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="md:col-span-1">
            <h3 className="font-heading font-bold text-xl mb-6 text-primary">Features</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center">
                  <i className="fas fa-clock mr-3 w-5 text-primary/70"></i>
                  Prayer Times
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center">
                  <i className="fas fa-mosque mr-3 w-5 text-primary/70"></i>
                  Mosque Finder
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center">
                  <i className="fas fa-compass mr-3 w-5 text-primary/70"></i>
                  Qibla Direction
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center">
                  <i className="fas fa-calendar-alt mr-3 w-5 text-primary/70"></i>
                  Islamic Calendar
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-1">
            <h3 className="font-heading font-bold text-xl mb-6 text-primary">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt text-primary mt-1.5 mr-3 w-5"></i>
                <span className="text-muted-foreground">123 Islamic Way<br/>New York, NY 10001</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope text-primary mr-3 w-5"></i>
                <a href="mailto:info@mosquetime.com" className="text-muted-foreground hover:text-primary transition-colors">
                  info@mosquetime.com
                </a>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone text-primary mr-3 w-5"></i>
                <a href="tel:+15551234567" className="text-muted-foreground hover:text-primary transition-colors">
                  +1 (555) 123-4567
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/10 mt-12 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm mb-4 md:mb-0">
              &copy; {currentYear} MosqueTime. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-muted-foreground text-sm hover:text-primary transition-colors">
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
