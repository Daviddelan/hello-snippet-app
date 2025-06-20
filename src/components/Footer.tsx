import React from 'react';
import { Calendar, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    platform: [
      { name: 'Create Event', href: '#' },
      { name: 'Browse Events', href: '#' },
      { name: 'Mobile App', href: '#' },
    ],
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact', href: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },    ],
  };

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/hello.snippet?igsh=MWl6bzV3ejE4OW9icw==' },
  ];

  return (
    <footer className="bg-gray-500 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <img 
                src="/hellosnippet_transparent.png" 
                alt="HelloSnippet" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-200 mb-6 leading-relaxed">
              Connecting event organizers, attendees, and corporate users through innovative event management solutions.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-200">
                <Mail className="w-4 h-4 mr-3" />
                <span>hello@hellsnippet.com</span>
              </div>
              <div className="flex items-center text-gray-200">
                <Phone className="w-4 h-4 mr-3" />
                <span>+233 (26) 554-4837</span>
              </div>
              <div className="flex items-center text-gray-200">
                <Phone className="w-4 h-4 mr-3" />
                <span>+233 (26) 531-2612</span>
              </div>
              <div className="flex items-center text-gray-200">
                <Phone className="w-4 h-4 mr-3" />
                <span>+233 (50) 715-0959</span>
              </div>
              <div className="flex items-center text-gray-200">
                <MapPin className="w-4 h-4 mr-3" />
                <span>Accra, Ghana</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-200 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-200 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-200 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-400 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="text-gray-200 mb-4 md:mb-0">
              © 2024 HelloSnippet. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex space-x-6">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-200 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
