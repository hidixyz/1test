import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Calendar from "./pages/Calendar.jsx";
import Checkin from "./pages/Checkin.jsx";
import Records from "./pages/Records.jsx";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/checkin" element={<Checkin />} />
        <Route path="/records" element={<Records />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
