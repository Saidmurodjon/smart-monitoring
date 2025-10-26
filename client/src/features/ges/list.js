import moment from "moment";
import { useEffect } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import useFetch from "../../hooks/UseFetch";
import IconButton from "../../components/buttons/IconButton";
import Button from "../../components/buttons/Button";
import { useLocation} from "react-router-dom";
function Transactions() {
  const location = useLocation();

  // xaritadan navigate bilan yuborilgan obyekt
  const geo = location.state?.geo;

  // custom hook
  const { data: firstData, fetchData: fetchFirstData } = useFetch();
  const { fetchData: fetchSecondData } = useFetch();

  // Qaysi hudud? (nomini olamiz)
  // !!! bu joyni sizning geo strukturangizga moslashtirasiz
  const selectedRegionName =
    geo?.properties?.name ||
    geo?.properties?.NAME_1 ||
    geo?.name ||
    null;

  // 1) sahifa ochilganda fetch
  // 2) geo o'zgarsa qayta fetch
useEffect(() => {
  if (selectedRegionName) {
    fetchFirstData(`ges-list?region=${encodeURIComponent(selectedRegionName)}`);
  } else {
    fetchFirstData("ges-list");
  }
  // faqat selectedRegionName o'zgarganda chaqirsin

}, [selectedRegionName]);

  // debug ko'rish uchun
  console.log("geo from navigate:", geo);
  console.log("selectedRegionName:", selectedRegionName);

  const Delete = async (value) => {
    if (window.confirm("Delete the item?")) {
      fetchSecondData("ges-list?_id=" + value._id, {
        method: "delete",
        status: 200,
        successMessage: "Item has deleted",
      });
      fetchFirstData("ges-list");
    }
  };

  return (
    <>
      <TitleCard
        title="Ges"
        topMargin="mt-2"
        TopSideButtons={
          <Button
            name={"Add new"}
            btnStyle={"btn-primary px-6 btn-sm normal-case"}
            navigate={"./add-new"}
          />
        }
      >
        {/* Team Member list in table format loaded constant */}
        <div className="overflow-x-auto w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Nomi</th>
                <th>Holati</th>
                <th>Hudud</th>
                <th>So'ngi tamirlangan vaqti</th>
                <th>Quvvati</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {firstData
                ? firstData.map((l, k) => {
                    return (
                      <tr key={k}>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="avatar">
                              {/* <div className="mask mask-circle w-12 h-12">
                                <img
                                  src={
                                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
                                  }
                                  alt="Avatar"
                                />
                               
                              </div> */}
                                <h3>{k+1}</h3>
                            </div>
                           
                            <div>
                              <div className="font-bold">
                                {l.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{l.status}</td>
                        <td>{l.region}</td>
                        <td>{moment(l.repair).format("D MMM")}</td>

                        <td>{l.power}</td>
                        <td>{l.email}</td>
                        <td>
                          <IconButton
                            iconType={"pensil"}
                            value={l}
                            navigate={"./add-new"}
                          />
                          <IconButton
                            iconType={"trash"}
                            value={l}
                            onPress={Delete}
                          />
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>
      </TitleCard>
    </>
  );
}

export default Transactions;
