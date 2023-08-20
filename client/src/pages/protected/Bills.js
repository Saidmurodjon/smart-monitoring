import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import Billing from "../../features/settings/billing";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Bills" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Billing />;
}

export default InternalPage;
