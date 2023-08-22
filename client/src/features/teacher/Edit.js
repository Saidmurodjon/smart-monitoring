import moment from "moment";
import { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import FunnelIcon from "@heroicons/react/24/outline/FunnelIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const TopSideButtons = () => {
  const navigate = useNavigate();

  const openAddNewLeadModal = () => {
    navigate("./addnew");

    console.log("NAV ADD");
  };

  return (
    <div className="inline-block float-right">
      <button
        className="btn px-6 btn-sm normal-case btn-primary"
        onClick={() => openAddNewLeadModal()}
      >
        Add New
      </button>
    </div>
  );
};
function Settings() {
  const [teacher, setTeacher] = useState([]);

  useEffect(() => {
    const get = async () => {
      try {
        const response = await axios.get(SERVER_URL + "teachers");
        if (response.status === 200) {
          setTeacher(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    get();
  }, []);

  return (
    <>
      <TitleCard
        title="Recent Settings"
        topMargin="mt-2"
        TopSideButtons={<TopSideButtons />}
      >
        {/* Team Member list in table format loaded constant */}
        <div className="overflow-x-auto w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Profession</th>
                <th>Phone</th>
                <th>Starus</th>
                <th>Transaction Date</th>
              </tr>
            </thead>
            <tbody>
              {teacher.map((l, k) => {
                return (
                  <tr key={k}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-circle w-12 h-12">
                            <img src={l.avatar} alt="Avatar" />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">
                            {l.firstName + " " + l.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{l.email}</td>
                    <td>{l.location}</td>
                    <td>{moment(l.date).format("D MMM")}</td>
                    <td>
                      <button
                        className="btn btn-square btn-ghost"
                        // onClick={() => console.log(k)}
                      >
                        <FunnelIcon className="w-5" />
                      </button>
                      <button
                        className="btn btn-square btn-ghost"
                        // onClick={() => deleteCurrentLead(k)}
                      >
                        <TrashIcon className="w-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </TitleCard>
    </>
  );
}

export default Settings;
