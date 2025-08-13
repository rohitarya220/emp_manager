import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import EmployeeList from "./components/EmployeeList";
import EmployeeForm from "./components/EmployeeForm";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
       <Route path="/" element={<Navigate to="/employees" />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employee/new" element={<EmployeeForm />} />
        <Route path="/employee/:id" element={<EmployeeForm />} />
      </Routes>
    </BrowserRouter>
  );
}
