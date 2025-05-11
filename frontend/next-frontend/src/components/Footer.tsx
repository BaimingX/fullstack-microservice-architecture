import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faYoutube, faTiktok } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6 mt-16">
      {/* 主要footer内容 */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* 品牌介绍和订阅区域 */}
          <div className="md:col-span-4 mb-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-left">AUS COOL STUFF</h2>
              <p className="text-left font-medium mt-1">TAKE CARE OF THE BIG KID IN YOUR HEART</p>
            </div>
            
            <p className="text-sm text-gray-300 mb-4 text-left">
              Whether you're into gadgets, retro toys, or just cool stuff that makes you smile – we're here for your inner child.
            </p>
            
            {/* 订阅表单 */}
            <div className="flex mb-4">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-gray-700 text-white p-2 rounded-l w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r transition duration-300">
                Subscribe
              </button>
            </div>
            
            {/* 社交媒体图标 - 使用FontAwesome图标 */}
            <div className="flex space-x-6 text-left">
              <a href="mailto:support@auscoolstuff.com.au" className="text-gray-300 hover:text-white transition duration-300">
                ✉️
              </a>
              <a href="https://www.facebook.com/people/Aus-CoolStuff/61575033073084/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition duration-300">
                <FontAwesomeIcon icon={faFacebookF} className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/auscoolstuff/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition duration-300">
                <FontAwesomeIcon icon={faInstagram} className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com/@AusCoolStuff" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition duration-300">
                <FontAwesomeIcon icon={faYoutube} className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@auscoolstuff" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition duration-300">
                <FontAwesomeIcon icon={faTiktok} className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-6 flex md:pl-8">
            {/* Follow Us 社交媒体矩阵 */}
            <div className="flex-1 pr-6">
              <h3 className="text-lg font-semibold mb-4 text-left">Follow Us</h3>
              <div className="space-y-3">
                <a 
                  href="https://www.instagram.com/auscoolstuff/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-pink-400 transition duration-300"
                >
                  <FontAwesomeIcon icon={faInstagram} className="w-5 h-5" />
                  <span>@auscoolstuff</span>
                </a>
                
                <a 
                  href="https://www.facebook.com/people/Aus-CoolStuff/61575033073084/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition duration-300"
                >
                  <FontAwesomeIcon icon={faFacebookF} className="w-5 h-5" />
                  <span>Aus CoolStuff</span>
                </a>
                
                <a 
                  href="https://www.youtube.com/@AusCoolStuff" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition duration-300"
                >
                  <FontAwesomeIcon icon={faYoutube} className="w-5 h-5" />
                  <span>@AusCoolStuff</span>
                </a>
                
                <a 
                  href="https://www.tiktok.com/@auscoolstuff" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-teal-400 transition duration-300"
                >
                  <FontAwesomeIcon icon={faTiktok} className="w-5 h-5" />
                  <span>@auscoolstuff</span>
                </a>
              </div>
            </div>
            
            {/* Help & Information 栏目 */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4 text-left">Help & Information</h3>
              <ul className="space-y-2 text-left">
                <li><a href="/faq" className="text-gray-300 hover:text-white transition duration-300 text-sm">FAQ</a></li>
                <li><a href="/shipping" className="text-gray-300 hover:text-white transition duration-300 text-sm">Shipping Information</a></li>
                <li><a href="/returns" className="text-gray-300 hover:text-white transition duration-300 text-sm">Returns & Refunds</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white transition duration-300 text-sm">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          {/* Account 栏目 */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-left">Account</h3>
            <ul className="space-y-2 text-left">
              <li><a href="/account" className="text-gray-300 hover:text-white transition duration-300 text-sm">My Account</a></li>
              <li><a href="/orders" className="text-gray-300 hover:text-white transition duration-300 text-sm">Order Tracking</a></li>
              <li><a href="/privacy" className="text-gray-300 hover:text-white transition duration-300 text-sm">Privacy Policy</a></li>
              <li><a href="/terms" className="text-gray-300 hover:text-white transition duration-300 text-sm">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* 版权信息 */}
      <div className="border-t border-gray-700 mt-10 pt-6">
        <div className="container mx-auto px-4">
          <p className="text-gray-400 text-sm text-center">
            © 2025 AusCoolStuff Pty Ltd. All rights reserved. | ABN: 93484296203
          </p>
        </div>
      </div>
    </footer>
  );
}
  