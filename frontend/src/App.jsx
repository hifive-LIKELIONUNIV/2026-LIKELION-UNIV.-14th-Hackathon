import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StartPage from './pages/StartPage/StartPage.jsx'
import LoginPage from './pages/LoginPage/LoginPage.jsx'
import LoginProcessingPage from './pages/LoginProcessingPage/LoginProcessingPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/processing" element={<LoginProcessingPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
