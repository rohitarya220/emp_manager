import { useState, useCallback } from "react";
import axios from "../utils/Axios";

const useApi = () => {
  const [loading, setLoading] = useState(false);

  const callApi = useCallback(async (method, url, payload = null, headers = {}) => {
    setLoading(true);
    try {
      const res = await axios({ method, url, data: payload, headers });
      if (res?.status == 200) {
        return res?.data;
      }
    } catch (err) {
      console.error(`method=${method} url=${url}`, err);
      return err?.response?.data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { callApi, loading };
};

export default useApi;
