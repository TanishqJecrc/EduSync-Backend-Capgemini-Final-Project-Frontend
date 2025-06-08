import logo from './logo.svg';
import './App.css';
import Login from './Components/Auth/Login';
import {Routes,Route,Link,useLocation,BrowserRouter as Router} from 'react-router-dom';
import { isLoggedIn } from './utils/auth';
import Navbar from './Components/Navbar';
import Register from './Components/Auth/Register';
import Dashboard from './Components/Student/StudentDashboard';
import InstructorDashboard from './Components/Instructor/InstructorDashboard';
import CourseGroupView from './Components/Instructor/CourseGroupView';
import CourseView from './Components/Instructor/CourseView';
import ContentView from './Components/Instructor/ContentView';
import CourseAssessment from './Components/Instructor/CourseAssessment';
import StudentHome from './Components/Student/StudentHome';

import ViewModule from './Components/Student/ViewModule';
import StudentDashboard from './Components/Student/StudentDashboard';
import ViewEnrolledModule from './Components/Student/ViewEnrolledModule';
import ViewContent from './Components/Student/ViewContent';
import NotFound from './utils/NotFound';
import TakeAssessment from './Components/Student/TakeAssessment';
import Profile from './Components/Auth/Profile';
import ViewResults from './Components/Student/ViewResults';
import InstructorAnalytics from './Components/Instructor/InstructorAnalytics';


function AppContent() {
  const location = useLocation();
  const hideNavbarOn = ['/login', '/register'];

  // Hide navbar on login and register pages
  const shouldShowNavbar = isLoggedIn() && !hideNavbarOn.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/instructordashboard" element={<InstructorDashboard />} />
        <Route path="/course-groups/:courseGroupId" element={<CourseGroupView />} />
        <Route path="/course/:courseId" element={<CourseView />} />
        <Route path="/content/:courseContentId" element={<ContentView />} />
        <Route path="/Course/:courseId/Assessment" element={<CourseAssessment />} />
        <Route path="/StudentHome" element={<StudentHome />} />
        <Route path="/MyCourses" element={<StudentDashboard />} />
        <Route path="/ViewModule/:courseId" element={<ViewModule/>} />
        <Route path="/:courseId/ViewModule" element={<ViewEnrolledModule />} />
        <Route path="*" element={<NotFound/>} />
        <Route path="/:contentId/ViewContent" element={<ViewContent />} />
        <Route path="/TakeAssessment/:courseId" element={<TakeAssessment />} />
        <Route path="/MyProfile" element={<Profile />} />
        <Route path="/MyResults" element={<ViewResults />} />
        <Route path="/Analytics" element={<InstructorAnalytics />} />
        {/* ...other routes */}
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;