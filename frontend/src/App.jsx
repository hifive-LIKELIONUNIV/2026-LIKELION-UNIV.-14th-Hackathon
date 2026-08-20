import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ensureCsrf } from './api/client.js'
import StartPage from './pages/StartPage/StartPage.jsx'
import LoginPage from './pages/LoginPage/LoginPage.jsx'
import LoginProcessingPage from './pages/LoginProcessingPage/LoginProcessingPage.jsx'
import BagSelectionPage from './pages/BagSelectionPage/BagSelectionPage.jsx'
import BagSelectionPageBefore from './pages/BagSelectionPage_before/BagSelectionPage_before.jsx'
import TimeMachinePage from './pages/TimeMachinePage/TimeMachinePage.jsx'
import LoadingPage1976 from './pages/LoadingPage1976/LoadingPage1976.jsx'
import LoadingPage2005 from './pages/LoadingPage2005/LoadingPage2005.jsx'
import LoadingPage2016 from './pages/LoadingPage2016/LoadingPage2016.jsx'
import LoadingPage2026 from './pages/LoadingPage2026/LoadingPage2026.jsx'
import FinalPage from './pages/FinalPage/FinalPage.jsx'
import PhotoPage from './pages/PhotoPage/PhotoPage.jsx'
import PhotoEndPage from './pages/PhotoEndPage/PhotoEndPage.jsx'
import PeriodPage1976 from './pages/PeriodPages/PeriodPage1976.jsx'
import PeriodPage2005 from './pages/PeriodPages/PeriodPage2005.jsx'
import PeriodPage2016 from './pages/PeriodPages/PeriodPage2016.jsx'
import PeriodPage2026 from './pages/PeriodPages/PeriodPage2026.jsx'
import PhotoFramePage from './pages/PhotoFramePage/PhotoFramePage.jsx'
import ChoosePage from './pages/ChoosePage/ChoosePage.jsx'
import PhotoCapturePage from './pages/PhotoCapturePage/PhotoCapturePage.jsx'
import PassportPreviewPage from './pages/PassportPreviewPage/PassportPreviewPage.jsx'

function App() {
  useEffect(() => {
    ensureCsrf()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/processing" element={<LoginProcessingPage />} />
      <Route path="/bags" element={<BagSelectionPage />} />
      <Route path="/bags-before" element={<BagSelectionPageBefore />} />
      <Route path="/timemachine" element={<TimeMachinePage />} />
      <Route path="/loading-1976" element={<LoadingPage1976 />} />
      <Route path="/loading-2005" element={<LoadingPage2005 />} />
      <Route path="/loading-2016" element={<LoadingPage2016 />} />
      <Route path="/loading-2026" element={<LoadingPage2026 />} />
      <Route path="/final" element={<FinalPage />} />
      <Route path="/photo" element={<PhotoPage />} />
      <Route path="/photo-end" element={<PhotoEndPage />} />
      <Route path="/period/1976" element={<PeriodPage1976 />} />
      <Route path="/period/2005" element={<PeriodPage2005 />} />
      <Route path="/period/2016" element={<PeriodPage2016 />} />
      <Route path="/period/2026" element={<PeriodPage2026 />} />
      <Route path="/photo-frame" element={<PhotoFramePage />} />
      <Route path="/choose" element={<ChoosePage />} />
      <Route path="/photo-capture" element={<PhotoCapturePage />} />
      <Route path="/passport-preview/:id" element={<PassportPreviewPage />} />
    </Routes>
  )
}

export default App
