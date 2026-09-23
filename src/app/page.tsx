import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Highlights from '@/components/Highlights';
import Menu from '@/components/Menu';
import About from '@/components/About';
import Gallery from '@/components/Gallery';
import Reviews from '@/components/Reviews';
import Reservation from '@/components/Reservation';
import Visit from '@/components/Visit';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <Highlights />
        <Menu />
        <About />
        <Gallery />
        <Reviews />
        <Reservation />
        <Visit />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
