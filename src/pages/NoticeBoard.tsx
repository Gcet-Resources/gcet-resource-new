
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Info, Calendar, Clock, Pin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const NoticeBoard = () => {
  const [filter, setFilter] = useState<string>("all");

  const notices = [
    {
      id: 1,
      title: "End Sem Exam Schedule for 1st to 4th Year",
      date: "Dec 20, 2025",
      time: "5:30 PM",
      category: "examination",
      description: "The end semester examination for Odd Semester 2025-26 will commence from 23 Dec 2025 to 31 Jan 2026. All students are requested to check the detailed schedule on the university portal.",
      important: true,
      link: "http://fms.aktu.ac.in/Resources/Attachments/Circular/209357b4dcddwd.pdf"
    }
  ];

  const filteredNotices = filter === "all"
    ? notices
    : filter === "important"
      ? notices.filter(notice => notice.important)
      : notices.filter(notice => notice.category === filter);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "examination": return "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400";
      case "event": return "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400";
      case "administrative": return "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400";
      case "academic": return "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400";
      case "placement": return "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400";
      default: return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="flex items-center justify-center mb-6">
          <Bell className="h-8 w-8 text-primary dark:text-teal-400 mr-3" />
          <h1 className="text-4xl font-display font-bold text-center text-gray-900 dark:text-white">
            Notice Board
          </h1>
        </div>

        <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Stay updated with the latest announcements, events, and important dates from the college and university.
        </p>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setFilter("all")}
          >
            All Notices
          </Button>
          <Button
            variant={filter === "important" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setFilter("important")}
          >
            <Info className="mr-1 h-4 w-4" /> Important
          </Button>
          <Button
            variant={filter === "examination" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setFilter("examination")}
          >
            Examination
          </Button>
          <Button
            variant={filter === "academic" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setFilter("academic")}
          >
            Academic
          </Button>
          <Button
            variant={filter === "event" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setFilter("event")}
          >
            Events
          </Button>
          <Button
            variant={filter === "placement" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setFilter("placement")}
          >
            Placement
          </Button>
        </div>

        {/* Notices Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredNotices.map((notice) => (
            <Card
              key={notice.id}
              className={`overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${notice.important ? 'border-l-4 border-l-red-500' : ''}`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{notice.title}</CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3.5 w-3.5" /> {notice.date}
                      <span className="mx-1">•</span>
                      <Clock className="h-3.5 w-3.5" /> {notice.time}
                    </CardDescription>
                  </div>
                  {notice.important && (
                    <div className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 p-1 rounded-full">
                      <Pin className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(notice.category)}`}>
                    {notice.category.charAt(0).toUpperCase() + notice.category.slice(1)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{notice.description}</p>
                <a
                  href={notice.link}
                  className="inline-flex items-center text-sm font-medium text-primary dark:text-teal-400 hover:underline"
                >
                  Read more <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;
