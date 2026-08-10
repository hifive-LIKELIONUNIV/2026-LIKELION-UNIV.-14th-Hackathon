import { Routes, Route } from 'react-router-dom'
import StartPage from './pages/StartPage/StartPage.jsx'
import PhotoPage from './pages/PhotoPage/PhotoPage.jsx'
import PhotoEndPage from './pages/PhotoEndPage/PhotoEndPage.jsx'
import PeriodPage1976 from './pages/PeriodPages/PeriodPage1976.jsx'
import PeriodPage2005 from './pages/PeriodPages/PeriodPage2005.jsx'
import PeriodPage2016 from './pages/PeriodPages/PeriodPage2016.jsx'
import PeriodPage2026 from './pages/PeriodPages/PeriodPage2026.jsx'
import PhotoFramePage from './pages/PhotoFramePage/PhotoFramePage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/photo" element={<PhotoPage />} />
      <Route path="/photo-end" element={<PhotoEndPage />} />
      <Route path="/period/1976" element={<PeriodPage1976 />} />
      <Route path="/period/2005" element={<PeriodPage2005 />} />
      <Route path="/period/2016" element={<PeriodPage2016 />} />
      <Route path="/period/2026" element={<PeriodPage2026 />} />
      <Route path="/photo-frame" element={<PhotoFramePage />} />
    </Routes>
  )
}

export default App