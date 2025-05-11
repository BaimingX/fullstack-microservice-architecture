import React from 'react';

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions (FAQ)</h1>
      
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <span className="text-blue-500 mr-2">🧸</span> What kind of products do you sell?
          </h2>
          <p className="text-gray-700">
            We curate the coolest stuff we can find – fun gadgets, nostalgic collectibles, brainy toys, and quirky things that simply make you go "Whoa!" Perfect for the curious minds and playful hearts of all ages.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <span className="text-blue-500 mr-2">📦</span> How long does delivery take?
          </h2>
          <p className="text-gray-700">
            Most orders ship within 1–2 business days, and typical delivery takes <strong>4–7 business days</strong>. Sometimes, if you're in a more remote area or if there's high demand, it may take a little longer. We'll keep you posted!
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <span className="text-blue-500 mr-2">💳</span> What payment methods do you accept?
          </h2>
          <p className="text-gray-700">
            We accept major credit cards, debit cards, and PayPal. More local payment options coming soon!
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <span className="text-blue-500 mr-2">🕹</span> Can I change or cancel my order?
          </h2>
          <p className="text-gray-700">
            If your order hasn't been shipped yet, yes! Shoot us a message at <strong>support@auscoolstuff.com.au</strong> as soon as possible. Once it's on the way, unfortunately we can't recall it from the delivery dragons.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <span className="text-blue-500 mr-2">🚫</span> My item arrived damaged – what do I do?
          </h2>
          <p className="text-gray-700">
            Oh no! If anything arrives broken or not working, take a quick photo and send it to us at <strong>support@auscoolstuff.com.au</strong> within 7 days – we'll sort it out faster than a squirrel on energy drinks.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <span className="text-blue-500 mr-2">🕵️‍♂️</span> I didn't get a confirmation email!
          </h2>
          <p className="text-gray-700">
            First, check your spam folder (sometimes we get a bit too cool for inboxes). Still nothing? Email us with your name and what you ordered, and we'll investigate.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <span className="text-blue-500 mr-2">🧠</span> I have other questions!
          </h2>
          <p className="text-gray-700">
            Awesome! Drop us an email at <strong>support@auscoolstuff.com.au</strong> or message us on Instagram. We're real humans (just cool ones), and we'll get back to you as soon as possible.
          </p>
        </div>
      </div>
    </div>
  );
} 