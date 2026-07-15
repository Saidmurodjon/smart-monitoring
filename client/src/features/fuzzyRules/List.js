import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleCard from "../../components/Cards/TitleCard";
import http from "../../utils/http";

function FuzzyRulesList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await http.get("/fuzzy-rules");
        setRows(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <TitleCard title="Fuzzy Logic qoidalari" topMargin="mt-2">
      <p className="text-sm text-base-content/70 mb-4">
        Har bir baholash bloki (gidroturbina, generator, transformator, GES
        darajasi) uchun aʼzolik funksiyalari va qoidalar bazasi shu yerda
        saqlanadi. O'zgarishlar darhol kuchga kiradi — serverni qayta ishga
        tushirish shart emas.
      </p>

      {loading ? (
        <div>Yuklanmoqda...</div>
      ) : rows.length === 0 ? (
        <div className="text-base-content/60 italic">
          DB'da hali qoidalar ta'rifi topilmadi.
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Blok</th>
                <th>O'zgaruvchilar soni</th>
                <th>Qoidalar soni</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.assessmentType}
                  className="hover cursor-pointer"
                  onClick={() => navigate(`/app/fuzzy-rules/detail?type=${r.assessmentType}`)}
                >
                  <td className="font-semibold">{r.assessmentType}</td>
                  <td>{r.variableCount}</td>
                  <td>{r.ruleCount}</td>
                  <td className="text-right">
                    <button className="btn btn-sm btn-primary">Ko'rish</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </TitleCard>
  );
}

export default FuzzyRulesList;
