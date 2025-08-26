import React, { useState } from "react";

export default function SupportPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Later you can integrate this with Supabase or an email service
    console.log("Support request submitted:", form);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-purple-700">Support Center</h1>
        <p className="mt-2 text-gray-600">
          Welcome to Olamco Digital Hub Support. Find answers to common
          questions or contact our support team.
        </p>

        {/* FAQ Section */}
        <div className="mt-10 bg-white shadow rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <ul className="space-y-4">
            <li>
              <p className="font-medium text-gray-800">💳 How do I upgrade my subscription?</p>
              <p className="text-gray-600">Go to your Dashboard → Subscriptions → Choose a plan and complete payment via Paystack.</p>
            </li>
            <li>
              <p className="font-medium text-gray-800">💰 How do I withdraw my commissions?</p>
              <p className="text-gray-600">Navigate to Dashboard → Withdrawal Requests. Fill in your bank details and submit a request.</p>
            </li>
            <li>
              <p className="font-medium text-gray-800">👥 How does the referral system work?</p>
              <p className="text-gray-600">Share your referral link. When new users subscribe, you earn commission instantly.</p>
            </li>
            <li>
              <p className="font-medium text-gray-800">🔒 Is my payment secure?</p>
              <p className="text-gray-600">Yes, all payments are processed securely with Paystack and SSL encryption.</p>
            </li>
          </ul>
        </div>

        {/* Contact Form */}
        <div className="mt-10 bg-white shadow rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
          {submitted ? (
            <div className="p-4 bg-green-50 text-green-600 rounded-lg">
              ✅ Thank you! Your message has been submitted. We’ll get back to you shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow"
              >
                Submit
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}