import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import PdfLearningPage from '../pages/PdfLearningPage'
import PresentationPage from '../pages/PresentationPage'
import AssessmentPage from '../pages/AssessmentPage'
import ResultPage from '../pages/ResultPage'
import TaskPage from '../pages/TaskPage'
import ProtectedRoute from '../components/ProtectedRoute'
import VisualTheme from '../components/VisualTheme'

function AppRoutes() {
  return (
    <BrowserRouter>
      <VisualTheme />
      <Routes>
        <Route path="/" element={<Navigate to="/pdf" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* 6-Stage Learning & Assessment Flow */}
        <Route path="/pdf" element={<ProtectedRoute><PdfLearningPage /></ProtectedRoute>} />
        <Route path="/pdf-learning" element={<Navigate to="/pdf" replace />} />

        <Route path="/ppt" element={<ProtectedRoute><PresentationPage /></ProtectedRoute>} />
        <Route path="/ppt-learning" element={<Navigate to="/ppt" replace />} />

        <Route path="/assessment" element={<ProtectedRoute><AssessmentPage /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
        <Route path="/task" element={<ProtectedRoute><TaskPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes

