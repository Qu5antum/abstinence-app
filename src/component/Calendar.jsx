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
  const [loaded, setLoaded] = useState(false);
  const [recordCounter, setRecord] = useState(0)

  const daysInMonth = currentDate.daysInMonth();
  const startOfMonth = currentDate.startOf("month").day();
  const today = dayjs().startOf("day");

  // 🔹 Загружаем и обновляем данные
  useEffect(() => {
    async function fetchData() {
      const docRef = doc(db, "calendar", "progress");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        let { counter, passedDays, lastUpdate, recordCounter } = docSnap.data();

        counter = counter || 0;
        passedDays = passedDays || [];
        let last = lastUpdate ? dayjs(lastUpdate) : null;
        recordCounter= recordCounter || 0

        // Проверяем, прошёл ли новый день
        if (!last || last.isBefore(today)) {
          const diff = today.diff(last, "day") || 1; // сколько дней прошло

          counter += diff;

          for (let i = 1; i <= diff; i++) {
            const dayToAdd = today.subtract(i, "day");
            passedDays.push({
              day: dayToAdd.date(),
              month: dayToAdd.month(),
              year: dayToAdd.year(),
            });
          }

          // Сохраняем новое состояние
          await setDoc(docRef, {
            counter,
            passedDays,
            lastUpdate: today.format("YYYY-MM-DD"),
            recordCounter,
          }, { merge: true });
        }

        setCounter(counter);
        setPassedDays(passedDays);
        setRecord(recordCounter)
      } else {
        // первый запуск → ничего не подсвечиваем, пока не пройдёт день
        await setDoc(docRef, {
          counter: 0,
          passedDays: [],
          lastUpdate: today.format("YYYY-MM-DD"),
          recordCounter: 0,
        });
        setCounter(0);
        setPassedDays([]);
        setRecord(0);
      }

      setLoaded(true);
    }

    fetchData();
  }, []);

  // 🔹 Обнуление
  const handleClick = async () => {
    const today = dayjs().startOf("day");

    let newRecord = Number(recordCounter) || 0;
    if (Number(counter) > newRecord) {
      newRecord = Number(counter);
    }

    setCounter(0);
    setPassedDays([]);
    setRecord(newRecord);
    await setDoc(doc(db, "calendar", "progress"), {
      counter: 0,
      passedDays: [],
      lastUpdate: today.format("YYYY-MM-DD"),
      recordCounter: newRecord,
    });
  };

  // Создаём массив дней месяца
  const days = [];
  for (let i = 0; i < startOfMonth; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="bg-gray-800 text-white p-6 rounded-xl shadow-lg">
      <div className="text-2xl flex font-mono bg-gray-800 rounded-full px-0 py-2">
        Пройдено: <span className="font-bold">{counter} дней</span>
      </div>
      <div className="text-2xl flex font-mono bg-gray-800 rounded-full px-0 py-2">
          Рекорд: <span className="font-bold">{recordCounter} дней</span> 
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
              const monthIndex = dayjs().localeData().months().indexOf(e.target.value);
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
              className={`aspect-square flex items-center justify-center rounded-xl text-sm sm:text-base ${
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
