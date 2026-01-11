import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { AdminBuilder } from './pages/AdminBuilder';
import { CampaignView } from './pages/CampaignView';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<AdminBuilder />} />
      <Route path="/c/:id" element={<CampaignView />} />
    </Routes>
  );
}

export default App;