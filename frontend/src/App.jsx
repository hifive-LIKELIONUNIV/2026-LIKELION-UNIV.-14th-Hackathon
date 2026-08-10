import { Routes, Route } from 'react-router-dom'
import StartPage from './pages/StartPage/StartPage'
import PhotoPage from './pages/PhotoPage/PhotoPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/photo" element={<PhotoPage />} />
    </Routes>
  )
}

export default App