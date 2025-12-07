import fs from 'fs';
import path from 'path';

console.log('=' .repeat(70));
console.log('🚀 HIMALAYAN TRAILS - FINAL COMPLETE FIX');
console.log('=' .repeat(70));

function readFile(f) { 
  return fs.readFileSync(f, 'utf-8'); 
}

function writeFile(f, c) { 
  fs.mkdirSync(path.dirname(f), {recursive:true}); 
  fs.writeFileSync(f, c); 
  console.log(`✅ ${f}`); 
}

const indexPath = 'src/pages/Index.tsx';
let code = readFile(indexPath);

// Add useNavigate import
if (!code.includes('useNavigate')) {
  code = code.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { useNavigate } from 'react-router-dom';"
  );
}

// Add navigate hook and booking state
if (!code.includes('const navigate')) {
  code = code.replace(
    'const { toast } = useToast();',
    `const { toast } = useToast();
  const navigate = useNavigate();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    travel_dates: '',
    group_size: 1,
    budget_range: '',
    package_id: '',
    special_requirements: ''
  });`
  );
}

// Add handler functions before return
if (!code.includes('handleShowContact')) {
  const lastIdx = code.lastIndexOf('};', code.indexOf('return ('));
  const handlers = `

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('bookings_2025_10_14_17_34')
        .insert([bookingForm]);
      if (error) throw error;
      toast({
        title: "Booking Submitted!",
        description: "We'll confirm within 24 hours."
      });
      setBookingForm({
        name: '',
        email: '',
        phone: '',
        travel_dates: '',
        group_size: 1,
        budget_range: '',
        package_id: '',
        special_requirements: ''
      });
      setBookingDialogOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to submit booking.",
        variant: "destructive"
      });
    }
  };

  const handleShowContact = (type: string) => {
    if (type === 'email') {
      navigator.clipboard.writeText('Himalayantrailesandtales@gmail.com');
      toast({
        title: "Email Copied!",
        description: "Himalayantrailesandtales@gmail.com"
      });
    } else if (type === 'phone') {
      navigator.clipboard.writeText('+91 8630113945');
      toast({
        title: "Phone Copied!",
        description: "+91 8630113945"
      });
    }
  };`;
  
  code = code.slice(0, lastIdx + 2) + handlers + code.slice(lastIdx + 2);
}

// Replace Speak with Expert button
code = code.replace(
  /<Button\s+variant="outline"\s+size="lg"\s+className="text-lg px-8 py-6 glass">\s*<Phone\s+className="w-5 h-5 mr-2"\s*\/>\s*Speak with Expert\s*<\/Button>/,
  `<Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 glass">
                <Phone className="w-5 h-5 mr-2" />
                Speak with Expert
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Contact Our Experts</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <Input placeholder="Name" value={contactForm.name} onChange={(e) => setContactForm(prev => ({...prev, name: e.target.value}))} required />
                <Input placeholder="Email" type="email" value={contactForm.email} onChange={(e) => setContactForm(prev => ({...prev, email: e.target.value}))} required />
                <Input placeholder="Phone" value={contactForm.phone} onChange={(e) => setContactForm(prev => ({...prev, phone: e.target.value}))} />
                <Textarea placeholder="Your question..." value={contactForm.special_requirements} onChange={(e) => setContactForm(prev => ({...prev, special_requirements: e.target.value}))} rows={4} />
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </DialogContent>
          </Dialog>`
);

// Replace Book This Experience button
code = code.replace(
  /<Button\s+className="w-full group-hover:bg-primary-glow transition-colors">\s*Book This Experience\s*<\/Button>/,
  `<Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full group-hover:bg-primary-glow transition-colors">
                        Book This Experience
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Book: {pkg.name}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleBookingSubmit} className="space-y-4">
                        <Input placeholder="Full Name *" value={bookingForm.name} onChange={(e) => setBookingForm(prev => ({...prev, name: e.target.value}))} required />
                        <Input placeholder="Email *" type="email" value={bookingForm.email} onChange={(e) => setBookingForm(prev => ({...prev, email: e.target.value}))} required />
                        <Input placeholder="Phone" value={bookingForm.phone} onChange={(e) => setBookingForm(prev => ({...prev, phone: e.target.value}))} />
                        <Input placeholder="Travel Dates" value={bookingForm.travel_dates} onChange={(e) => setBookingForm(prev => ({...prev, travel_dates: e.target.value}))} />
                        <Select value={bookingForm.group_size.toString()} onValueChange={(v) => setBookingForm(prev => ({...prev, group_size: parseInt(v)}))}>
                          <SelectTrigger><SelectValue placeholder="Group Size" /></SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5,6,7,8,9,10].map(n => <SelectItem key={n} value={n.toString()}>{n} {n===1?'Person':'People'}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={bookingForm.budget_range} onValueChange={(v) => setBookingForm(prev => ({...prev, budget_range: v}))}>
                          <SelectTrigger><SelectValue placeholder="Budget" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under-10k">Under ₹10,000</SelectItem>
                            <SelectItem value="10k-25k">₹10,000 - ₹25,000</SelectItem>
                            <SelectItem value="25k-50k">₹25,000 - ₹50,000</SelectItem>
                            <SelectItem value="50k-100k">₹50,000 - ₹1,00,000</SelectItem>
                            <SelectItem value="above-100k">Above ₹1,00,000</SelectItem>
                          </SelectContent>
                        </Select>
                        <Textarea placeholder="Special requirements..." value={bookingForm.special_requirements} onChange={(e) => setBookingForm(prev => ({...prev, special_requirements: e.target.value}))} rows={3} />
                        <Button type="submit" className="w-full">Confirm Booking</Button>
                      </form>
                    </DialogContent>
                  </Dialog>`
);

// Replace Call Us button
code = code.replace(
  /<Button\s+variant="outline"\s+size="sm">\s*<Phone\s+className="w-4 h-4 mr-2"\s*\/>\s*Call Us\s*<\/Button>/,
  `<Button variant="outline" size="sm" onClick={() => handleShowContact('phone')}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call Us
                </Button>`
);

// Replace Email button
code = code.replace(
  /<Button\s+variant="outline"\s+size="sm">\s*<Mail\s+className="w-4 h-4 mr-2"\s*\/>\s*Email\s*<\/Button>/,
  `<Button variant="outline" size="sm" onClick={() => handleShowContact('email')}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>`
);

// Fix image paths
code = code.replace(/src="\.\/images\//g, 'src="/images/');

writeFile(indexPath, code);

// Create App.tsx
writeFile('src/App.tsx', `import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import CategoryPage from './pages/CategoryPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/booking/:id" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}`);

// Update main.tsx
writeFile('src/main.tsx', `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`);

// Update package.json
const pkgPath = 'package.json';
const pkg = JSON.parse(readFile(pkgPath));
if (!pkg.dependencies) pkg.dependencies = {};
if (!pkg.dependencies['react-router-dom']) pkg.dependencies['react-router-dom'] = '^6.20.0';
writeFile(pkgPath, JSON.stringify(pkg, null, 2));

// Create images folder
if (!fs.existsSync('public/images')) {
  fs.mkdirSync('public/images', {recursive: true});
  console.log('✅ public/images');
}
console.log('\n' + '='.repeat(70));
console.log('✅ COMPLETE! Now run:');
console.log('   npm install');
console.log('   npm run dev');
console.log('='.repeat(70));
