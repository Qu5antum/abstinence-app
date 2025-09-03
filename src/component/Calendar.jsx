import { useEffect, useState } from "react";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import { db } from "./firebase"; 
import { doc, getDoc, setDoc } from "firebase/firestore";

dayjs.extend(localeData);

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [passedDays, setPassedDays] = useState([]);
  const [counter, setCounter] = useState(0);
  const [loaded, setLoaded] = useState(false); // 🔹 флаг загрузки данных

  const daysInMonth = currentDate.daysInMonth();
  const startOfMonth = currentDate.startOf("month").day();
  const today = dayjs();

  // 🔹 Загружаем данные из Firebase
  useEffect(() => {
    async function fetchData() {
      const docRef = doc(db, "calendar", "progress");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setCounter(data.counter || 0);
        setPassedDays(data.passedDays || []);
      }
      setLoaded(true); // ✅ теперь можно сохранять
    }
    fetchData();
  }, []);

  // 🔹 Сохраняем данные в Firebase только после загрузки
  useEffect(() => {
    if (!loaded) return; // ❌ не сохраняем до загрузки
    async function saveData() {
      await setDoc(doc(db, "calendar", "progress"), {
        counter,
        passedDays,
      });
    }
    saveData();
  }, [counter, passedDays, loaded]);

  // 🔹 Проверка полуночи
  useEffect(() => {
    function checkMidnight() {
      const now = dayjs();
      if (now.hour() === 0 && now.minute() === 0 && now.second() === 0) {
        setCounter((prev) => prev + 1);
        setPassedDays((prev) => [
          ...prev,
          { day: now.date(), month: now.month(), year: now.year() }
        ]);
        setCurrentDate(now);
      }
    }

    const timer = setInterval(checkMidnight, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClick = () => {
    setCounter(0);
    setPassedDays([]);
  };

  // Создаем массив дней месяца
  const days = [];
  for (let i = 0; i < startOfMonth; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="bg-gray-800 text-white p-6 rounded-xl shadow-lg">
      <div className="text-2xl flex font-mono bg-gray-800 rounded-full px-2 py-2">
        Пройдено дней: <span className="font-bold">{counter}</span>
      </div>
      <div className="buttons my-2">
        <button
          className="text-1xl flex font-mono bg-gray-800 rounded-full px-4 py-3 shadow-lg transition duration-200 hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 hover:ring-offset-gray-800"
          onClick={handleClick}
        >
          Обнулить
        </button>
      </div>

      {/* Переключение месяца */}
      <div className="flex justify-between items-center mb-4 max-w-md flex-col sm:flex-row gap-1 sm:gap-2 p-2 sm:p-3">
        <button
          className="px-3 py-1 bg-gray-600 rounded transition duration-200 hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 hover:ring-offset-gray-800"
          onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
        >
          ←
        </button>

        <div className="flex items-center space-x-2">
          <select
            value={currentDate.format("MMMM")}
            onChange={(e) => {
              const monthIndex = dayjs()
                .localeData()
                .months()
                .indexOf(e.target.value);
              setCurrentDate(currentDate.month(monthIndex));
            }}
            className="border rounded px-2 py-1 bg-gray-700 text-white"
          >
            {dayjs.localeData().months().map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={currentDate.year()}
            onChange={(e) => setCurrentDate(currentDate.year(+e.target.value))}
            className="border rounded px-2 py-1 bg-gray-700 text-white"
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

      {/* Сетка дней недели */}
      <div className="grid grid-cols-7 gap-2 text-center font-medium">
        {dayjs.localeData().weekdaysShort().map((day) => (
          <div key={day} className="p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Сетка чисел */}
      <div className="grid grid-cols-7 gap-2 text-center mt-2">
        {days.map((day, index) => {
          if (!day) return <div key={index}></div>;

          const isToday =
            day === today.date() &&
            currentDate.month() === today.month() &&
            currentDate.year() === today.year();

          const isPrevHighlighted = passedDays.some(
            (d) =>
              d.day === day &&
              d.month === currentDate.month() &&
              d.year === currentDate.year()
          );

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
