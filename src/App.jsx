import Calendar from "./component/Calendar";
import Clock from "./component/Clock";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-900 text-white">
      {/* Часы */}
      <div className="w-full md:w-1/4 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-700 p-4" style={{top: '-260px'}}>
        <Clock />
      </div>

      {/* Календарь */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-gray-700 rounded-2xl shadow-lg p-6">
          <Calendar />
        </div>
      </div>
    </div>
  );
}
