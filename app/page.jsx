import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/home/HeroSection";
import CategorySection from "../components/home/CategorySection";
import FeaturedRooms from "../components/home/FeaturedRooms";
import TrustSection from "../components/home/TrustSection";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <HeroSection />
        <CategorySection />
        <FeaturedRooms />
        <TrustSection />
      </main>

      <Footer />
    </>
  );
}