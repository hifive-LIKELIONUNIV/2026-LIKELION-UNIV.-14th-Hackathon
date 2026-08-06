import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StartPage from './pages/StartPage/StartPage.jsx'
import LoginPage from './pages/LoginPage/LoginPage.jsx'
import LoginProcessingPage from './pages/LoginProcessingPage/LoginProcessingPage.jsx'
import BagSelectionPage from './pages/BagSelectionPage/BagSelectionPage.jsx'
import BagSelectionPageBefore from './pages/BagSelectionPage_before/BagSelectionPage_before.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/processing" element={<LoginProcessingPage />} />
        <Route path="/bags" element={<BagSelectionPage />} />
        <Route path="/bags-before" element={<BagSelectionPageBefore />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
