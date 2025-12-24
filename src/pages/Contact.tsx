
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  MessageCircle,
  Mail,
  MessagesSquare,
  Send,
  User,
  HelpCircle,
  Bug,
  FilePlus,
  ArrowRight,
  Copy,
  ExternalLink,
  Instagram
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
    type: "student"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct mailto link
    const subject = `[${formData.type.toUpperCase()}] ${formData.subject}`;
    const body = `Name: ${formData.firstName} ${formData.lastName}%0AEmail: ${formData.email}%0A%0A${formData.message}`;

    const mailtoLink = `mailto:gcetresources@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(mailtoLink, '_blank');

    toast({
      title: "Opening Email Client",
      description: "Please send the pre-filled email to contact us.",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("gcetresources@gmail.com");
    toast({
      title: "Email Copied!",
      description: "gcetresources@gmail.com copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <Navigation />

      <main className="container mx-auto px-4 pt-32 pb-20">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in-up">
          <div className="inline-flex items-center justify-center p-3 mb-6 bg-primary/10 dark:bg-teal-500/10 rounded-full ring-1 ring-primary/20 dark:ring-teal-500/20">
            <Mail className="w-8 h-8 text-primary dark:text-teal-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Get in Touch 📬
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Have a question, found a bug, or want to contribute? We're here to help!
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-8">

          {/* Left Column: Contact Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions Card */}
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg shadow-gray-100 dark:shadow-gray-900/50">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-primary dark:text-teal-500" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <a href="mailto:gcetresources@gmail.com?subject=Resource%20Contribution" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-primary/5 dark:hover:bg-teal-500/10 group transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-white dark:bg-gray-700 shadow-sm text-blue-500">
                      <FilePlus className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Submit Resource</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary dark:group-hover:text-teal-500 transition-colors" />
                </a>

                <a href="mailto:gcetresources@gmail.com?subject=Bug%20Report" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/10 group transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-white dark:bg-gray-700 shadow-sm text-red-500">
                      <Bug className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Report a Bug</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                </a>

                <button onClick={copyEmail} className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 group transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-white dark:bg-gray-700 shadow-sm text-gray-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 block">Email Us</span>
                      <span className="text-xs text-gray-500 block">gcetresources@gmail.com</span>
                    </div>
                  </div>
                  <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </button>
              </div>
            </Card>

            {/* Community Card */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-teal-500/5 dark:from-primary/10 dark:to-teal-500/10 border-primary/10 dark:border-teal-500/10">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Join Community</h3>
              <div className="grid gap-3">
                <a
                  href="https://chat.whatsapp.com/CKrN5kPTBqz1wcNruhBSAG"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-green-500/50 hover:shadow-sm transition-all group"
                >
                  <div className="bg-[#25D366] p-2 rounded-full text-white">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white block">WhatsApp Group</span>
                    <span className="text-xs text-green-600 dark:text-green-400">Join now</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-500" />
                </a>

                <a
                  href="https://telegram.me/akturesources"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-500/50 hover:shadow-sm transition-all group"
                >
                  <div className="bg-[#229ED9] p-2 rounded-full text-white">
                    <MessagesSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white block">Telegram Channel</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">Subscribe</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                </a>

                <a
                  href="https://www.instagram.com/gcetresources/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-pink-500/50 hover:shadow-sm transition-all group"
                >
                  <div className="bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-2 rounded-full text-white">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white block">Instagram</span>
                    <span className="text-xs text-pink-600 dark:text-pink-400">Follow us</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-pink-500" />
                </a>
              </div>
            </Card>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-3">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-gray-950/50 h-full">
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        className="pl-9"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        className="pl-9"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">I am a...</Label>
                    <Select
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                      defaultValue="student"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="alumni">Alumni</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <div className="relative">
                    <HelpCircle className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="What is this regarding?"
                      className="pl-9"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us more details..."
                    rows={6}
                    className="resize-none"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-11 text-base bg-primary dark:bg-teal-600 hover:bg-primary/90 dark:hover:bg-teal-500">
                  Send Message <Send className="ml-2 w-4 h-4" />
                </Button>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  This will open your default email client with a pre-filled message.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
