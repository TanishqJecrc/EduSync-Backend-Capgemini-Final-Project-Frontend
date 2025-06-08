import axiosInstance from "../../api/axiosInstance";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@mdi/react";
import { mdiAccount, mdiEmail, mdiFormTextboxPassword, mdiAccountPlus,mdiCardAccountDetails } from "@mdi/js";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const [role, setRole] = useState("student");

  function handleRegister(e) {
    e.preventDefault();
    axiosInstance
      .post("/Auth/register", {
        email: email,
        password: password,
        name: name,
        role: role
      })
      .then((response) => {
        console.log(response.data);
        if (response.status === 200) {
          alert("Registration successful");
          navigate("/login");
        }
      })
      .catch((error) => {
        console.error("There was an error!", error);
        alert("Registration failed");
      });
  }
  return(
    <>
    <div style={{ backgroundColor: 'gray', padding: '20px', minHeight: '100vh' }}>
      <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column', marginBottom: '20px' }}>
          <h1>Welcome to EduSync</h1>
          <h2>Register Portal</h2>
      </div>
      <form style={{backgroundColor: '#f8f9fa', padding: '20px', width: '300px', margin: 'auto', borderRadius: '15px'}}>
        <div className="mb-3">
          <label htmlFor="exampleInputEmail1" className="form-label">
<Icon path={mdiAccount} size={1} /> Name</label>
            <input type="text" onChange={(e) => setName(e.target.value)}  className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
            </div>
            <div className="mb-3">
            <label htmlFor="exampleInputEmail1" className="form-label">
<Icon path={mdiEmail} size={1} /> Email address</label>
            <input type="email" onChange={(e) => setEmail(e.target.value)}  className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
            </div>
            <div className="mb-3">
            <label htmlFor="exampleInputPassword1" className="form-label"><Icon path={mdiFormTextboxPassword} size={1} /> Password</label>
            <input type="password" onChange={(e) => setPassword(e.target.value)} className="form-control" id="exampleInputPassword1" />
            </div>
            <label htmlFor="role" className="form-label"><Icon path={mdiCardAccountDetails} size={1} />  Register As</label>
            <div className="mb-3" style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="Student"
                  checked={role === "Student"}
                  onChange={() => setRole("Student")}
                  style={{ marginRight: '5px' }}
                />
                Student
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="Instructor"
                  checked={role === "Instructor"}
                  onChange={() => setRole("Instructor")}
                  style={{ marginRight: '5px' }}
                />
                Instructor
              </label>
            </div>
             
             <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button type="submit" onClick={handleRegister} className="btn btn-success"><Icon path={mdiAccountPlus} size={1} /> Register</button>
             </div><hr>
               
             </hr>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <p>Already have an account? <a href="/login">Login</a></p>
             </div>
      </form>
    </div>
    </>
  )



}
export default Register;