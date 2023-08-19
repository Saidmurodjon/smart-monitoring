import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
const useFetch = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Start with loading as false

  const fetchData = async (url, options) => {
    setLoading(true); // Set loading to true before making the request
    try {
      const response = await axios({
        method: options?.method || "get",
        url: process.env.REACT_APP_SERVER_URL + url,
        data: options?.data || null,
      });
      setData(response.data);
      setLoading(false); // Set loading to false when the request is done
    } catch (error) {
      setError(error.response?.data || "An error occurred");
      toast.error(error.response?.data || "An error occurred", {
        theme: "colored",
      });
      setLoading(false); // Set loading to false when there's an error
    }
  };

  return { data, loading, error, fetchData };
};

export default useFetch;
