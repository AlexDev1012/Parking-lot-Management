import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200">
      <div className="max-w-[1300px] mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Logo & About Section */}
          <div className="space-y-6">
            <Link to="/" className="block">
              <img
                className="h-12 w-auto"
                src="./newLogo.png"
                alt="City Park Authority Logo"
              />
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed">
              City Park Authority provides innovative parking management
              solutions for cities and businesses across the nation.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <i className="pi pi-twitter text-gray-600" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <i className="pi pi-linkedin text-gray-600" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <i className="pi pi-facebook text-gray-600" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Quick Links
            </h3>
            <div className="flex flex-col gap-3">
              <Link
                to="/"
                className="text-gray-600 hover:text-blue-600 transition-colors inline-flex items-center gap-2 group"
              >
                <i className="pi pi-chevron-right text-xs text-gray-400 group-hover:text-blue-600" />
                <span>Home</span>
              </Link>
              <a
                href="https://www.cityparkauthority.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors inline-flex items-center gap-2 group"
              >
                <i className="pi pi-chevron-right text-xs text-gray-400 group-hover:text-blue-600" />
                <span>About Us</span>
              </a>
              <a
                href="https://www.cityparkauthority.com/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 transition-colors inline-flex items-center gap-2 group"
              >
                <i className="pi pi-chevron-right text-xs text-gray-400 group-hover:text-blue-600" />
                <span>Contact Us</span>
              </a>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Contact Us
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <i className="pi pi-envelope text-gray-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600">Email</span>
                  <a
                    href="mailto:info@cityparkauthority.com"
                    className="text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    info@cityparkauthority.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <i className="pi pi-phone text-gray-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600">Phone</span>
                  <a
                    href="tel:(954) 420-1580"
                    className="text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    (954) 420-1580
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Stay Updated
            </h3>
            <p className="text-sm text-gray-600">
              Subscribe to our newsletter for the latest updates and news.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              ©2024 City Park Authority. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-blue-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-blue-600 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-blue-600 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
