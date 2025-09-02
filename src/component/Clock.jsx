import { useState, useEffect } from "react";

export default function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function updateTime() {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // 24-часовой формат без секунд
      const timeStr =
        `${hours.toString().padStart(2, "0")}:` +
        `${minutes.toString().padStart(2, "0")}`;

      setTime(timeStr);
    }

    updateTime();
    const timer = setInterval(updateTime, 1000 * 5); // обновляем каждые 30 сек
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-10 p-4">
      {/* Часы */}
      <div className="text-4xl flex font-mono bg-gray-800 rounded-full px-10 py-6 shadow-lg">
        {time}
      </div>
    </div>
  );
}
