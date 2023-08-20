import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import Dashboard from "../../features/dashboard/index";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Dashboard" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Dashboard />;
}

export default InternalPage;
