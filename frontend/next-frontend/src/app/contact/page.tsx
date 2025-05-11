import React from 'react';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Contact Us</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">We'd Love to Hear From You</h2>
          <p className="text-gray-700">
            Have questions, suggestions, or just want to say hello? We're here for you!
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <span className="text-blue-500 mr-2">✉️</span> Email Us
          </h3>
          <p className="text-gray-700 mb-2">
            For any questions or concerns, please email us at:
          </p>
          <a 
            href="mailto:support@auscoolstuff.com.au" 
            className="text-blue-600 font-medium hover:underline"
          >
            support@auscoolstuff.com.au
          </a>
          <p className="text-gray-600 text-sm mt-2">
            We aim to respond to all inquiries within 24-48 hours during business days.
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <span className="text-blue-500 mr-2">📱</span> Social Media
          </h3>
          <p className="text-gray-700 mb-2">
            You can also reach out to us through our social media channels:
          </p>
          <div className="flex space-x-4 mt-3">
            <a 
              href="https://www.instagram.com/auscoolstuff/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-500 hover:text-pink-600"
            >
              Instagram
            </a>
            <a 
              href="https://www.facebook.com/people/Aus-CoolStuff/61575033073084/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              Facebook
            </a>
            <a 
              href="https://www.youtube.com/@AusCoolStuff" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700"
            >
              YouTube
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-medium mb-3">When to Expect a Response</h3>
          <p className="text-gray-700">
            Our customer support team is available Monday to Friday, 9 AM - 5 PM AEST.
            While we strive to answer all inquiries as quickly as possible, please allow 
            up to 48 hours for a response during busy periods.
          </p>
        </div>
      </div>
    </div>
  );
} 