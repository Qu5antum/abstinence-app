import { useEffect, useState } from "react";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";

dayjs.extend(localeData);

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [prevDay, setPrevDay] = useState(null); // для хранения предыдущего дня
  var [counter, setCounter] = useState(0);


  const daysInMonth = currentDate.daysInMonth();
  const startOfMonth = currentDate.startOf("month").day();
  const today = dayjs();

  useEffect(() => {
    function checkMidnight() {
      const now = dayjs();
      if (now.hour() === 0 && now.minute() === 0) {
        setCounter(counter + 1)
        setPrevDay(today.date()); // сохраняем предыдущий день
        setCurrentDate(now); // обновляем текущую дату
      }
    }

    const timer = setInterval(checkMidnight, 15 * 1000); // проверка каждую минуту
    return () => clearInterval(timer);
  }, [today]);

  const handleClick = () => {
     //Обнуление
      setCounter(counter = 0);
      setPrevDay(null);
  };

  // массив дней для сетки
  const days = [];
  for (let i = 0; i < startOfMonth; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return (
    <div className="bg-gray-800 text-white p-6 rounded-xl shadow-lg">
      <div className="text-2xl flex font-mono bg-gray-800 rounded-full px-2 py-2">
        Пройдено дней: <span className="font-bold">{counter}</span>
      </div>
      <div className="buttons">
                <button className="text-1xl flex font-mono bg-gray-800 rounded-full px-4 py-3 shadow-lg transition duration-200 hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 hover:ring-offset-gray-800" onClick={handleClick}>
                    Обнулить
                </button>
            </div>
      {/* переключение месяца */}
      <div className="flex justify-between items-center mb-4 max-w-md flex-col sm:flex-row gap-1 sm:gap-2 p-2 sm:p-3">
        <button
          className="px-3 py-1 bg-gray-600 rounded transition duration-200 hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 hover:ring-offset-gray-800"
          onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
        >
          ←
        </button>

        <div className="flex items-center space-x-2">
          {/* выбор месяца */}
          <select
            value={currentDate.format("MMMM")}
            onChange={(e) => {
              const monthIndex = dayjs()
                .localeData()
                .months()
                .indexOf(e.target.value);
              setCurrentDate(currentDate.month(monthIndex));
            }}
            className="border rounded px-2 py-1 bg-gray-700 text-white transition duration-200 hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 hover:ring-offset-gray-800"
          >
            {dayjs.localeData()
              .months()
              .map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
          </select>

          {/* выбор года */}
          <select
            value={currentDate.year()}
            onChange={(e) => setCurrentDate(currentDate.year(+e.target.value))}
            className="border rounded px-2 py-1 bg-gray-700 text-white transition duration-200 hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 hover:ring-offset-gray-800"
          >
            {Array.from({ length: 10 }, (_, i) => 2025 + i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          className="px-3 py-1 bg-gray-600 rounded transition duration-200 hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 hover:ring-offset-gray-800"
          onClick={() => setCurrentDate(currentDate.add(1, "month"))}
        >
          →
        </button>
      </div>

      {/* сетка дней недели */}
      <div className="grid grid-cols-7 gap-2 text-center font-medium">
        {dayjs.localeData()
          .weekdaysShort()
          .map((day) => (
            <div key={day} className="p-2">
              {day}
            </div>
          ))}
      </div>

      {/* сетка чисел */}
      <div className="grid grid-cols-7 gap-2 text-center mt-2">
        {days.map((day, index) => {
          if (!day) return <div key={index}></div>;

          const isToday =
            day === today.date() &&
            currentDate.month() === today.month() &&
            currentDate.year() === today.year();

          const isPrevHighlighted =
            prevDay === day &&
            currentDate.month() === today.month() &&
            currentDate.year() === today.year();

          return (
            <div
              key={index}
              className={`p-2 rounded-lg ${
                isToday
                  ? "bg-blue-500 text-white font-bold"
                  : isPrevHighlighted
                  ? "bg-green-500 text-white font-bold"
                  : "bg-gray-700 text-white"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}