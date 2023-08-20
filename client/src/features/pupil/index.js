import moment from "moment";
import { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/UseFetch";
const TopSideButtons = () => {
  const navigate = useNavigate();

  const openAddNewLeadModal = () => {
    navigate("./add-new");
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
function Transactions() {
  const {
    data: firstData,
    error: firstError,
    fetchData: fetchFirstData,
  } = useFetch();
  const {
    data: secondData,
    error: secondError,
    fetchData: fetchSecondData,
  } = useFetch();
  useEffect(() => {
    fetchFirstData("teachers");
  }, []);

  const Delete = async (_id) => {
    if (window.confirm("Delete the item?")) {
      fetchSecondData("teachers?_id=" + _id, {
        method: "delete",
      });
    }
  };
  useEffect(() => {
    if (secondData) {
      toast.success("Teacher ma'lumotlari o'chirildi!");
      fetchFirstData("teachers");
    } else if (firstData) {
      toast.error(`Error in DELETE request: ${secondError}`);
    }
  }, [secondData, secondError]);

  return (
    <>
      <TitleCard
        title="Recent Transactions"
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
              {firstData
                ? firstData.map((l, k) => {
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
                            <PencilIcon className="w-5" />
                          </button>
                          <button
                            className="btn btn-square btn-ghost"
                            // onClick={() => deleteCurrentLead(k)}
                          >
                            <TrashIcon
                              className="w-5"
                              onClick={() => Delete(l._id)}
                            />
                          </button>
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
