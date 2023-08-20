import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import Integration from "../../features/integration";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Integrations" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Integration />;
}

export default InternalPage;
