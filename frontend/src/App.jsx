import { Routes, Route } from 'react-router-dom'
import StartPage from './pages/StartPage/StartPage.jsx'
import PhotoPage from './pages/PhotoPage/PhotoPage.jsx'
import PhotoEndPage from './pages/PhotoEndPage/PhotoEndPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/photo" element={<PhotoPage />} />
      <Route path="/photo-end" element={<PhotoEndPage />} />
    </Routes>
  )
}

export default App