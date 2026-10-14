import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import RequireAuth from "../../components/auth/RequireAuth";
import NotificationList from "../../components/notifications/NotificationList";

export const metadata = { title: "Notifications | Dwellst" };

export default function NotificationsPage() {
  return (
    <>
      <Navbar />
      <RequireAuth>
        <NotificationList />
      </RequireAuth>
      <Footer />
    </>
  );
}