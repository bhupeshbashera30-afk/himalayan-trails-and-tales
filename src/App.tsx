import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import CategoryPage from './pages/CategoryPage';
import NotFound from './pages/NotFound';
import Packages from './pages/Packages';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/booking/:id" element={<Index />} />
                      <Route path="/packages" element={<Packages />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
