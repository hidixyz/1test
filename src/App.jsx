import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const Calendar = lazy(() => import("./pages/Calendar.jsx"));
const CalendarDetail = lazy(() => import("./pages/CalendarDetail.jsx"));
const Checkin = lazy(() => import("./pages/Checkin.jsx"));
const Records = lazy(() => import("./pages/Records.jsx"));

const PageLoader = () => (
  <div className="page-loader">
    <p>加载中...</p>
  </div>
);

const App = () => {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/calendar/:date" element={<CalendarDetail />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/records" element={<Records />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

export default App;
