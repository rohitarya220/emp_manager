import { createContext, useContext } from "react";
import useApi from "../hooks/useApi";
import { message } from "antd";

export const MyContext = createContext();

const MyProvider = (props) => {
  const { callApi, loading, error } = useApi();

  const getEmp = async () => {
    const response = await callApi("GET", "SelectEmployeeDemoProfile");
    if (response?.status === 200) {
      return response?.data?.["select-employee"] || [];
    }
  };

  const deleteEmp = async (id) => {
    await callApi("POST", "DeleteEmployeeDemoProfile", { id });
    message.success("Employee deleted successfully");
    getEmp();
  };

  const insertEmp = async (payload) => {
    await callApi("POST", "InsertUpdateEmployeeDemoProfile", payload);
    getEmp()
  };

  const updateEmp = async (payload) => {
    await callApi("POST", "InsertUpdateEmployeeDemoProfile", payload);
    getEmp()
  };

  const countryStateData = async () => {
    const data = await callApi("GET", "PageLoadForEmployeeDemoProfile");
    if (data?.status === 200) {
      return data?.data;
    }
  };

  return (
    <MyContext.Provider
      value={{
        loading,
        error,
        getEmp,
        deleteEmp,
        insertEmp,
        updateEmp,
        countryStateData,
      }}
    >
      {props.children}
    </MyContext.Provider>
  );
};

export default MyProvider;
export const useMyContext = () => useContext(MyContext);
