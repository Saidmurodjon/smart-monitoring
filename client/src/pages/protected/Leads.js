import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import Leads from "../../features/leads";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Leads" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Leads />;
}

export default InternalPage;
