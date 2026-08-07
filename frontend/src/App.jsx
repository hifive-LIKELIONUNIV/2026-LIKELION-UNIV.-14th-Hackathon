import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StartPage from './pages/StartPage/StartPage.jsx'
import LoginPage from './pages/LoginPage/LoginPage.jsx'
import LoginProcessingPage from './pages/LoginProcessingPage/LoginProcessingPage.jsx'
import BagSelectionPage from './pages/BagSelectionPage/BagSelectionPage.jsx'
import BagSelectionPageBefore from './pages/BagSelectionPage_before/BagSelectionPage_before.jsx'
import LoadingPage1976 from './pages/LoadingPage1976/LoadingPage1976.jsx'
import LoadingPage2005 from './pages/LoadingPage2005/LoadingPage2005.jsx'
import LoadingPage2026 from './pages/LoadingPage2026/LoadingPage2026.jsx'
import FinalPage from './pages/FinalPage/FinalPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/processing" element={<LoginProcessingPage />} />
        <Route path="/bags" element={<BagSelectionPage />} />
        <Route path="/bags-before" element={<BagSelectionPageBefore />} />
        <Route path="/loading-1976" element={<LoadingPage1976 />} />
        <Route path="/loading-2005" element={<LoadingPage2005 />} />
        <Route path="/loading-2026" element={<LoadingPage2026 />} />
        <Route path="/final" element={<FinalPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
