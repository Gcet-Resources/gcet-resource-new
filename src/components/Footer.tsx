import { Link } from 'react-router-dom';
import {
    MessageCircle,
    Mail,
    Heart,
    Shield
} from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* Brand Section */}
                    <div className="max-w-md">
                        <Link to="/" className="inline-block">
                            <h3 className="text-xl font-display font-bold text-primary dark:text-teal-400 mb-3">
                                GCET Resources
                            </h3>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            Your one-stop destination for quality educational resources. Helping GCET students excel in their academic journey.
                        </p>
                        <div className="flex items-center gap-3">
                            <a
                                href="https://chat.whatsapp.com/CKrN5kPTBqz1wcNruhBSAG"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors"
                                aria-label="WhatsApp"
                            >
                                <MessageCircle className="w-4 h-4" />
                            </a>
                            <a
                                href="mailto:gcetresources@gmail.com"
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                                aria-label="Email"
                            >
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Request Resource Button */}
                    <div>
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <a
                                href="mailto:gcetresources@gmail.com?subject=Resource%20Request&body=Hi%20Team,%0A%0AI%20would%20like%20to%20request%20the%20following%20resource:%0A%0ASubject:%20%0AYear:%20%0AResource%20Type:%20%0A%0AThank%20you!"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary dark:bg-teal-600 text-white rounded-lg hover:bg-primary/90 dark:hover:bg-teal-500 transition-colors text-sm font-medium"
                            >
                                <Mail className="w-4 h-4" />
                                Request Resource
                            </a>
                            <a
                                href="mailto:gcetresources@gmail.com?subject=Resource%20Contribution&body=Hi%20Team,%0A%0AI%20would%20like%20to%20contribute%20the%20following%20resource:%0A%0ASubject:%20%0AYear:%20%0AResource%20Type:%20%0AGoogle%20Drive%20Link:%20%0A%0AThank%20you!"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-primary dark:border-teal-500 text-primary dark:text-teal-400 rounded-lg hover:bg-primary/10 dark:hover:bg-teal-500/20 transition-colors text-sm font-medium"
                            >
                                <Heart className="w-4 h-4" />
                                Contribute Resource
                            </a>
                        </div>

                    </div>
                </div>
            </div>

            {/* Disclaimer Section */}
            <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-900/50">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-start gap-3 mb-4">
                        <Shield className="w-5 h-5 text-primary dark:text-teal-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h5 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                                Content Disclaimer & Fair Use Notice
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                GCET Resources is a community-driven educational platform created by students, for students.
                                <strong className="text-gray-700 dark:text-gray-300"> We do not own or claim ownership of any educational content displayed on this website.</strong> All study materials,
                                notes, previous year questions, and other resources are sourced from various publicly available platforms, educators,
                                and contributors. The original content creators and copyright holders retain all rights to their respective materials.
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
                                This platform operates under the principles of <strong className="text-gray-700 dark:text-gray-300">fair use for educational purposes</strong>.
                                We respect intellectual property rights and are committed to removing any content upon valid request from rightful owners.
                                If you believe any content infringes your copyright, please contact us at{' '}
                                <a href="mailto:gcetresources@gmail.com" className="text-primary dark:text-teal-400 hover:underline">
                                    gcetresources@gmail.com
                                </a>
                                {' '}with relevant details, and we will promptly address your concerns.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="border-t border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4 py-4">
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                        © {currentYear} GCET Resources. Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for GCET students.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
