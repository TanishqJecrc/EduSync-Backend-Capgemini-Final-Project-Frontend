import { useNavigate, Link } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiLogout,mdiMonitorDashboard,mdiBadgeAccount,mdiChartScatterPlotHexbin,mdiFinance,mdiHome,mdiBookshelf} from '@mdi/js';
import {useEffect} from 'react';
import './Navbar.css';
import { isLoggedIn } from '../utils/auth';

function Navbar() {
  const navigate = useNavigate();
  const role = (sessionStorage.getItem('role') || '').toLowerCase();

    useEffect(() => {
    if (!isLoggedIn()) {
          alert('You are not logged in. Please log in to continue.');
          navigate('/login');
        }
      }, [navigate]);


  function handleLogout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userName');
    navigate('/login');
  }

  const studentLinks = (
    <>
      <Link className="nav-link" to="/StudentHome"><Icon path={mdiHome} size={0.8} /> Home</Link>
      <Link className="nav-link" to="/MyCourses"><Icon path={mdiBookshelf} size={0.8} /> My Courses</Link>
      <Link className="nav-link" to="/My-Profile"><Icon path={mdiBadgeAccount} size={0.8} /> Profile</Link>
      <Link className="nav-link" to="/My-Results"><Icon path={mdiFinance} size={0.8} /> My Results</Link>
    </>
  );

  const instructorLinks = (
    <>
      <Link className="nav-link" to="/instructordashboard"> <Icon path={mdiMonitorDashboard} size={0.8} />Dashboard</Link>
      <Link className="nav-link" to="/My-Profile"> <Icon path={mdiBadgeAccount} size={0.8} />Profile</Link>
      <Link className="nav-link" to="/Analyt-ics"> <Icon path={mdiChartScatterPlotHexbin} size={0.8} />Analytics</Link>
    </>
  );

  return (
    <nav className="navbar navbar-expand-lg edusync-navbar-bg">
      <div className="container-fluid">
        <div className="d-flex align-items-center w-100" style={{ minHeight: '64px' }}>
          <Link
            className="navbar-brand d-flex align-items-center"
            to="/"
            style={{ height: '48px', marginBottom: 0 }}
          >
            <img
              src="/logoedusync.png"
              alt="EduSync Logo"
              style={{
                height: '40px',
                width: '40px',
                borderRadius: '35%',
                objectFit: 'cover',
                marginRight: '12px',
                marginBottom: '7px',
                // Optional: add a subtle glow if you want
                // filter: 'drop-shadow(0 0 8px #0fa)'
              }}
            />
            {/* Neon effect only on text */}
            <span className="">EduSync</span>
          </Link>
          <button className="navbar-toggler ms-2" type="button" data-bs-toggle="collapse"
            data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup"
            aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse ms-3" id="navbarNavAltMarkup">
            <div className="ms-auto d-flex align-items-center gap-3">
              <div className="navbar-nav d-flex align-items-center gap-3">
                {role === 'student' && studentLinks}
                {role === 'instructor' && instructorLinks}
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-danger d-flex align-items-center gap-2"
                type="button"
              >
                <Icon path={mdiLogout} size={0.8} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
