import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Radio,
  Select,
  Button,
  Upload,
  message,
  DatePicker,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useMyContext } from "../Context/MyContext";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";

const { Option } = Select;

const EmployeeForm = () => {
  const { insertEmp, countryStateData, updateEmp } = useMyContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const empData = location.state;
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [fileBase64, setFileBase64] = useState("");
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Fetch countries & states
  useEffect(() => {
    const fetchCountries = async () => {
      const data = await countryStateData();
      if (data) {
        const countryList = data.CountryList || [];
        const stateList = data.StateList || [];

        const formattedCountries = countryList.map((country) => {
          const statesForCountry = stateList
            .filter((state) => state.PARENT_RECORD_ID === country.RECORD_ID)
            .map((state) => ({
              code: state.RECORD_ID,
              name: state.RECORD_NAME,
            }));

          return {
            code: country.RECORD_ID,
            name: country.RECORD_NAME,
            states: statesForCountry,
          };
        });

        setCountries(formattedCountries);
      }
    };

    fetchCountries();
  }, []);

  // Prefill form values only once when editing
  useEffect(() => {
    if (empData && countries.length > 0 && !isFormInitialized) {
      const selectedCountry = countries.find((c) => c.code === empData.country);
      setStates(selectedCountry?.states || []);

      // Prefill form values
      form.setFieldsValue({
        name: empData?.name,
        motherName: empData?.motherName,
        fatherName: empData?.fatherName,
        gender: empData?.gender,
        DOB: empData?.dob ? dayjs(empData.dob, "YYYY-MM-DD") : null,
        country: empData?.country,
        state: empData?.state,
        email: empData?.email,
        contact: empData?.contact,
        image: empData?.profileBase64
          ? [
              {
                uid: "-1",
                name: empData?.name + "_profile.jpg",
                status: "done",
                url: `data:image/png;base64,${empData.profileBase64}`,
              },
            ]
          : undefined,
      });

      setFileBase64(empData.EMPLOYEE_PROFILE_Base64String || "");
      setIsFormInitialized(true);
    }
  }, [empData, countries, form, isFormInitialized]);

  const handleCountryChange = (value) => {
    const countryData = countries.find((c) => c.code === value);
    setStates(countryData?.states || []);
    form.setFieldsValue({ state: undefined });
  };

  const handleFileChange = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      setFileBase64(base64String);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const onFinish = async (values) => {
    try {
      const payload = {
        id: id || "",
        name: values.name,
        motheR_NAME: values.motherName,
        fatheR_NAME: values.fatherName,
        gender: values.gender,
        countrY_CODE: values.country,
        statE_CODE: values.state,
        emaiL_ADDRESS: values.email,
        contacT_NUMBER: values.contact,
        DOB: values.DOB ? values.DOB.format("YYYY-MM-DD") : null,
        EMPLOYEE_PROFILE_NAME:
          values.image?.file?.name || empData?.EMPLOYEE_PROFILE_NAME || "",
        EMPLOYEE_PROFILE_Base64String: fileBase64,
      };

      setLoading(true);
      if (id) {
        await updateEmp(payload);
        message.success("Employee updated successfully");
      } else {
        await insertEmp(payload);
        message.success("Employee added successfully");
      }
      setLoading(false);

      navigate("/employees");
    } catch (error) {
      setLoading(false);
      message.error("Error saving employee");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">
          {id ? "Update Employee" : "Add Employee"}
        </h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ gender: "Male" }}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please enter full name" }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="motherName"
            label="Mother's Name"
            rules={[{ required: true, message: "Please enter mother's name" }]}
          >
            <Input placeholder="Enter mother's name" />
          </Form.Item>

          <Form.Item
            name="fatherName"
            label="Father's Name"
            rules={[{ required: true, message: "Please enter father's name" }]}
          >
            <Input placeholder="Enter father's name" />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: "Please select gender" }]}
          >
            <Radio.Group>
              <Radio value="Male">Male</Radio>
              <Radio value="Female">Female</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Date of Birth"
            name="DOB"
            rules={[{ required: true, message: "Please select date of birth" }]}
          >
            <DatePicker
              format="DD-MM-YYYY"
              className="w-full"
              placeholder="Select Date of Birth"
            />
          </Form.Item>

          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, message: "Please select country" }]}
          >
            <Select placeholder="Select country" onChange={handleCountryChange}>
              {countries.map((c) => (
                <Option key={c.code} value={c.code}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="state"
            label="State"
            rules={[{ required: true, message: "Please select state" }]}
          >
            <Select placeholder="Select state">
              {states.map((s) => (
                <Option key={s.code} value={s.code}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            name="contact"
            label="Contact Number"
            rules={[
              { required: true, message: "Please enter contact number" },
              { len: 10, message: "Contact must be 10 digits" },
              { pattern: /^[0-9]+$/, message: "Only numbers allowed" },
            ]}
          >
            <Input placeholder="Enter contact number" maxLength={10} />
          </Form.Item>

          <Form.Item
            name="image"
            label="Profile Image"
            rules={[{ required: !id, message: "Please upload profile image" }]}
          >
            <Upload
              beforeUpload={handleFileChange}
              maxCount={1}
              showUploadList={{ showRemoveIcon: true }}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-blue-500"
            >
              {id ? "Update Employee" : "Add Employee"}
            </Button>
            <Button className="ml-3" onClick={() => navigate("/employees")}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default EmployeeForm;
