import Icon from '@mdi/react';
import { mdiLogin, mdiAccount, mdiFormTextboxPassword } from '@mdi/js';
import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const Navigate = useNavigate();

  function handleLogin(e){
    e.preventDefault();
    axiosInstance.post('/Auth/login', {
      email: email,
      password: password
    })
    .then((response) => {
      console.log(response.data);
      if (response.status === 200) {
        sessionStorage.setItem('token', response.data.authtoken);
        sessionStorage.setItem('role', response.data.role);
        sessionStorage.setItem('userName', response.data.name);
        alert('Login successful');
        if (response.data.role === 'Student') {
          Navigate('/studenthome');
        }
        if (response.data.role === 'Instructor') {
          Navigate('/instructordashboard');
        } 
      }
    })
    .catch((error) => {
      console.error('There was an error!', error);
      alert('Invalid credentials');
    });
  }
  return (
    <>
    <div style ={{ backgroundColor: 'gray', padding: '20px', minHeight: '100vh' }}>
      <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column', marginBottom: '20px' }}>
          <h1>Welcome to EduSync</h1>
          <h2>Login Portal</h2>
      </div>
      <form style={{backgroundColor: '#f8f9fa', padding: '20px', width: '300px', margin: 'auto', borderRadius: '15px'}}>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
<Icon path={mdiAccount} size={1} /> Email address</label>
          <input type="email" onChange={(e) => setEmail(e.target.value)}  className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputPassword1" className="form-label"><Icon path={mdiFormTextboxPassword} size={1} /> Password</label>
          <input type="password" onChange={(e) => setPassword(e.target.value)} className="form-control" id="exampleInputPassword1" />
        </div>
         
         <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="submit" onClick={handleLogin} className="btn btn-success"><Icon path={mdiLogin} size={1} /> Login</button>
         </div>
         <hr />
         <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <p>Don't have an account? <Link to="/register">Register</Link></p>
         </div>
      </form>
    </div>
    </>
  );
}
export default Login;