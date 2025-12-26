import { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface ExamInfo {
    name: string;
    date: Date;
}

const ExamCountdown = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    // Update this with actual exam dates
    const upcomingExam: ExamInfo = {
        name: "End Semester Examination",
        date: new Date("2025-01-23T09:00:00"), // Exam start date
    };

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = upcomingExam.date.getTime() - new Date().getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    const TimeBlock = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 md:p-4 min-w-[60px] md:min-w-[80px] border border-gray-100 dark:border-gray-700">
                <span className="text-2xl md:text-4xl font-bold text-primary dark:text-teal-400 font-mono">
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-wide">
                {label}
            </span>
        </div>
    );

    const examDate = upcomingExam.date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="bg-gradient-to-r from-primary/5 via-teal-50 to-primary/5 dark:from-teal-500/10 dark:via-gray-800/50 dark:to-teal-500/10 rounded-2xl p-6 md:p-8 border border-primary/10 dark:border-teal-500/20">
            <div className="flex items-center justify-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary dark:text-teal-400" />
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                    {upcomingExam.name}
                </h3>
            </div>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
                Starting from {examDate}
            </p>

            <div className="flex justify-center items-center gap-2 md:gap-4">
                <TimeBlock value={timeLeft.days} label="Days" />
                <span className="text-2xl md:text-3xl font-bold text-gray-300 dark:text-gray-600 mt-[-20px]">:</span>
                <TimeBlock value={timeLeft.hours} label="Hours" />
                <span className="text-2xl md:text-3xl font-bold text-gray-300 dark:text-gray-600 mt-[-20px]">:</span>
                <TimeBlock value={timeLeft.minutes} label="Mins" />
                <span className="text-2xl md:text-3xl font-bold text-gray-300 dark:text-gray-600 mt-[-20px]">:</span>
                <TimeBlock value={timeLeft.seconds} label="Secs" />
            </div>

            <div className="flex items-center justify-center gap-1 mt-6 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Time to prepare! Good luck! 📚</span>
            </div>
        </div>
    );
};

export default ExamCountdown;
