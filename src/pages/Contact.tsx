
import { Navigation } from "@/components/Navigation";
import { MessageCircle, Mail, MessagesSquare } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          
          {/* Left Column - Contact Information */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
                Contact Us
              </h1>
              <p className="text-lg text-gray-600">
                Feel free to use the form or join our community groups. We're here to help!
              </p>
            </div>

            <div className="space-y-6">
              <a 
                href="https://chat.whatsapp.com/CKrN5kPTBqz1wcNruhBSAG?mode=ems_copy_t" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-4 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">WhatsApp Group</h3>
                  <p className="text-gray-600">Join our community group</p>
                </div>
              </a>

              <a 
                href="https://telegram.me/akturesources" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-4 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessagesSquare size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Telegram Channel</h3>
                  <p className="text-gray-600">Get updates and resources</p>
                </div>
              </a>

              <a 
                href="mailto:gcetresources@gmail.com" 
                className="flex items-center space-x-4 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email Us</h3>
                  <p className="text-gray-600">gcetresources@gmail.com</p>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
