import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import Calendar from "../../features/calendar";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Calendar" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Calendar />;
}

export default InternalPage;
