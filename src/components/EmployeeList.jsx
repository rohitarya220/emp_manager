import { useEffect, useState } from "react";
import { useMyContext } from "../Context/MyContext";
import {
  Table,
  Button,
  Space,
  Input,
  Avatar,
  Popconfirm,
  Tag
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

const EmployeeList = () => {
  const { getEmp, deleteEmp, countryStateData, loading } = useMyContext();
  const Navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [countries, setCountries] = useState([]);

  // Fetch employees
  useEffect(() => {
    const fetchData = async () => {
      const response = await getEmp();
      const mapped = response.map((emp) => ({
        id: emp.ID,
        name: emp.NAME,
        motherName: emp.MOTHER_NAME,
        fatherName: emp.FATHER_NAME,
        gender: emp.GENDER,
        country: emp.COUNTRY_CODE, // store code
        state: emp.STATE_CODE, // store code
        email: emp.EMAIL_ADDRESS,
        contact: emp.CONTACT_NUMBER,
        dob: emp.DOB,
        profileBase64: emp.EMPLOYEE_PROFILE_Base64String
      }));
      setEmployees(mapped);
      setFiltered(mapped);
    };
    fetchData();
  }, []);

  // Fetch country & state mapping
  useEffect(() => {
    const fetchCountries = async () => {
      const data = await countryStateData();
      if (data) {
        const countryList = data.CountryList || [];
        const stateList = data.StateList || [];

        const formattedCountries = countryList.map((country) => {
          const statesForCountry = stateList
            .filter(
              (state) => state.PARENT_RECORD_ID === country.RECORD_ID
            )
            .map((state) => ({
              code: state.RECORD_ID,
              name: state.RECORD_NAME
            }));

          return {
            code: country.RECORD_ID,
            name: country.RECORD_NAME,
            states: statesForCountry
          };
        });

        setCountries(formattedCountries);
      }
    };

    fetchCountries();
  }, []);

  // Helper functions to get names from codes
  const getCountryName = (code) => {
    const country = countries.find((c) => c.code === code);
    return country ? country.name : code;
  };

  const getStateName = (countryCode, stateCode) => {
    const country = countries.find((c) => c.code === countryCode);
    const state = country?.states.find((s) => s.code === stateCode);
    return state ? state.name : stateCode;
  };

  // Search filter (includes country/state names too)
  const onSearch = (value) => {
    const searchValue = value.toLowerCase();
    setFiltered(
      employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchValue) ||
          emp.email.toLowerCase().includes(searchValue) ||
          emp.contact.includes(searchValue) ||
          getCountryName(emp.country)
            .toLowerCase()
            .includes(searchValue) ||
          getStateName(emp.country, emp.state)
            .toLowerCase()
            .includes(searchValue)
      )
    );
  };

  // Delete handler
  const handleDelete = async (id) => {
    await deleteEmp(id);
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    setFiltered((prev) => prev.filter((emp) => emp.id !== id));
  };

  const columns = [
    {
      title: "Profile",
      dataIndex: "profileBase64",
      key: "profile",
      render: (base64) => (
      <Avatar
  src={
    base64?.startsWith("http")
      ? base64
      : `data:image/png;base64,${base64}`
  }
  size={40}
/>

      )
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span className="font-medium text-gray-800">{text}</span>
      )
    },
    {
      title: "Mother's Name",
      dataIndex: "motherName",
      key: "motherName"
    },
    {
      title: "Father's Name",
      dataIndex: "fatherName",
      key: "fatherName"
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (gender) =>
        gender === "Male" ? (
          <Tag color="geekblue">Male</Tag>
        ) : (
          <Tag color="pink">Female</Tag>
        )
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      render: (code) => getCountryName(code)
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      render: (code, record) =>
        getStateName(record.country, code)
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact"
    },
    {
      title: "DOB",
      dataIndex: "dob",
      key: "dob"
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="primary"
            size="small"
            className="bg-blue-500"
            onClick={() =>
              Navigate(`/employee/${record.id}`, {
                state: record
              })
            }
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Employee?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              type="primary"
              danger
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Employee List
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-green-500"
          onClick={() => Navigate("/employee/new")}
        >
          Add Employee
        </Button>
      </div>

      <Search
        placeholder="Search employees..."
        onSearch={onSearch}
        allowClear
        enterButton
        size="large"
        className="mb-4"
      />

      <Table
        columns={columns}
        dataSource={filtered}
        loading={loading}
        bordered
        rowKey="id"
        pagination={{ pageSize: 5 }}
        className="bg-white shadow rounded-lg"
         scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default EmployeeList;
