import React from 'react';

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Shipping Information</h1>
      <p className="text-center text-xl mb-8">We ship all across Australia!</p>
      
      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-8 rounded">
        <p className="text-blue-700 font-bold">🎉 SPECIAL PROMOTION</p>
        <p className="text-blue-600">Free shipping on all orders during our promotional period!</p>
      </div>
      
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <span className="text-blue-500 mr-2">🕒</span> When will my order ship?
          </h2>
          <p className="text-gray-700">
            Orders are usually processed and dispatched within <strong>1–2 business days</strong>.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <span className="text-blue-500 mr-2">📦</span> How long will delivery take?
          </h2>
          <p className="text-gray-700">
            Estimated delivery time is <strong>4–7 business days</strong>. If you're in a rural or remote area, or if there are delays due to weather or high demand, it might take a little longer. We'll always do our best to get your stuff to you fast.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <span className="text-blue-500 mr-2">💰</span> How much does shipping cost?
          </h2>
          <p className="text-gray-700">
            Shipping rates are calculated at checkout based on your location and the weight of your items. Free shipping may apply for orders over a certain amount – keep an eye out for promos!
          </p>
          <p className="text-blue-600 font-medium mt-2">
            Currently: FREE shipping on all orders during our promotional period!
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <span className="text-blue-500 mr-2">🔎</span> Can I track my order?
          </h2>
          <p className="text-gray-700">
            Absolutely! As soon as your order ships, we'll send you a tracking number so you can follow your package as it makes its way to you.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <span className="text-blue-500 mr-2">❗</span> Important Notes
          </h2>
          <ul className="text-gray-700 list-disc pl-5 space-y-2">
            <li>We currently ship only within Australia.</li>
            <li>Please double-check your address at checkout to avoid delays.</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 