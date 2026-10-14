import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import RequireAuth from "../../components/auth/RequireAuth";
import MyVisits from "../../components/visits/MyVisits";

export const metadata = { title: "My visits | Dwellst" };

export default function VisitsPage() {
  return (
    <>
      <Navbar />
      <RequireAuth>
        <MyVisits />
      </RequireAuth>
      <Footer />
    </>
  );
}