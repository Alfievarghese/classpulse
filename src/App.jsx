import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './components/LandingPage'
import { JoinSession } from './components/student/JoinSession'
import { VotingInterface } from './components/student/VotingInterface'
import { CreateSession } from './components/teacher/CreateSession'
import { TeacherDashboard } from './components/teacher/TeacherDashboard'
import { ProjectorView } from './components/projector/ProjectorView'

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page with student/teacher options */}
        <Route path="/" element={<LandingPage />} />

        {/* Student routes */}
        <Route path="/join" element={<JoinSession />} />
        <Route path="/student/:sessionId" element={<VotingInterface />} />

        {/* Teacher routes */}
        <Route path="/teacher/create" element={<CreateSession />} />
        <Route path="/teacher/:sessionId" element={<TeacherDashboard />} />

        {/* Projector route */}
        <Route path="/projector/:sessionId" element={<ProjectorView />} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
