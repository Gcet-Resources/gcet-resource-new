import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import noticesData from "@/data/notices.json";
import {
  Bell,
  Calendar,
  Clock,
  Pin,
  ExternalLink,
  Search,
  Sparkles,
  Zap,
  GraduationCap,
  Megaphone,
  Briefcase,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Notice = (typeof noticesData)[number];

const NoticeBoard = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const notices = noticesData as Notice[];

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredNotices = notices.filter((notice) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "important"
          ? notice.important
          : notice.category === filter;

    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "examination":
        return <FileText className="w-4 h-4" />;
      case "event":
        return <Sparkles className="w-4 h-4" />;
      case "placement":
        return <Briefcase className="w-4 h-4" />;
      case "academic":
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <Megaphone className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "examination":
        return "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20";
      case "event":
        return "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20";
      case "resources":
        return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20";
      case "announcement":
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
      case "placement":
        return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const renderLink = (notice: Notice) => {
    const isInternal = notice.link.startsWith("/");
    const label = (
      <>
        Read <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
      </>
    );

    if (isInternal) {
      return (
        <Link to={notice.link} className="flex items-center gap-1 text-primary dark:text-teal-400 hover:underline group/link">
          {label}
        </Link>
      );
    }

    return (
      <a
        href={notice.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-primary dark:text-teal-400 hover:underline group/link"
      >
        {label}
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 font-sans">
      <Seo
        title="Notice Board — Exams & Announcements"
        description="Latest AKTU exam schedules, academic announcements, and GCET student updates."
        path="/notice-board"
      />
      <Navigation />

      <main id="main-content" className="container mx-auto px-4 pt-32 pb-20">
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 transform ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-30 animate-pulse" />
            <div className="relative bg-white dark:bg-gray-900 p-4 rounded-full ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm">
              <Bell className="w-8 h-8 text-primary dark:text-teal-400" />
            </div>
            <div className="absolute -top-2 -right-6 animate-bounce delay-100">
              <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500 filter drop-shadow-md" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Notice Board <span className="text-primary dark:text-teal-400">Hub</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Live updates on exams, events, and essential announcements.
          </p>
        </div>

        <div
          className={`sticky top-24 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-4 mb-12 shadow-lg transition-all duration-700 delay-100 transform ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
              {[
                "all",
                "important",
                "examination",
                "announcement",
                "resources",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                    filter === cat
                      ? "bg-primary dark:bg-teal-600 text-white border-primary dark:border-teal-600 shadow-md"
                      : "bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-primary/50"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search notices..."
                className="pl-9 h-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotices.length > 0 ? (
            filteredNotices.map((notice, index) => (
              <div
                key={notice.id}
                className={`group relative transition-all duration-500 transform ${mounted ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card
                  className={`h-full border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:-translate-y-1 transition-all shadow-sm hover:shadow-xl overflow-hidden relative ${notice.important ? "ring-1 ring-red-500/20" : ""}`}
                >
                  {notice.isNew && (
                    <div className="absolute top-4 right-4 flex items-center gap-1">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                      </span>
                      <span className="text-[10px] font-bold text-primary dark:text-teal-400 uppercase">
                        New
                      </span>
                    </div>
                  )}

                  {notice.important && (
                    <div className="absolute top-0 left-0 bg-red-500 text-white p-1.5 rounded-br-xl z-10">
                      <Pin className="w-3.5 h-3.5 fill-current" />
                    </div>
                  )}

                  <CardContent className="p-6 flex flex-col h-full">
                    <Badge
                      variant="outline"
                      className={`w-fit mb-4 px-3 py-1 rounded-full text-xs font-semibold capitalize border ${getCategoryColor(notice.category)}`}
                    >
                      <span className="mr-1.5">{getCategoryIcon(notice.category)}</span>
                      {notice.category}
                    </Badge>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                      {notice.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow line-clamp-3">
                      {notice.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {notice.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {notice.time}
                        </span>
                      </div>
                      {renderLink(notice)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No notices found
              </h3>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setFilter("all");
                  setSearchQuery("");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NoticeBoard;
