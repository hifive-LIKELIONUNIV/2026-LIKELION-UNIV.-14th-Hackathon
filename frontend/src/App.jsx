import { Routes, Route } from 'react-router-dom'
import StartPage from './pages/StartPage/StartPage.jsx'
import PhotoPage from './pages/PhotoPage/PhotoPage.jsx'
import PhotoEndPage from './pages/PhotoEndPage/PhotoEndPage.jsx'
import PeriodPage1976 from './pages/PeriodPages/PeriodPage1976.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/photo" element={<PhotoPage />} />
      <Route path="/photo-end" element={<PhotoEndPage />} />
      <Route path="/period/1976" element={<PeriodPage1976 />} />
    </Routes>
  )
}

export default App