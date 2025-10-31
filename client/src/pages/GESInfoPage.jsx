
import { useLocation, useNavigate } from "react-router-dom";

export default function GESInfoPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // UzbekistanMap'dan jo'natilgan data
  const ges = location.state?.ges;

  if (!ges) {
    return (
      <div className="p-6 text-white">
        <div className="text-xl mb-4">GES ma'lumot topilmadi</div>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-2 bg-blue-600 rounded-lg text-white"
        >
          Orqaga
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <div className="text-2xl font-bold mb-2">{ges.name}</div>
      <div className="mb-1">
        Holati: <span className="font-semibold">{ges.status}</span>
      </div>
      <div className="text-gray-300 text-sm leading-relaxed">{ges.desc}</div>

      <div className="text-xs text-gray-500 mt-4 font-mono">
        Koordinata: {ges.coordinates[1].toFixed(2)}°N,&nbsp;
        {ges.coordinates[0].toFixed(2)}°E
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-6 inline-block px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
      >
        Orqaga
      </button>
    </div>
  );
}
