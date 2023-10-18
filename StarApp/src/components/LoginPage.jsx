import banner from "../images/STAR (1).gif";
import loginicon from "../images/OIP 1.png";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";
import Navbar from "./Navbar";
import Toast from 'react-bootstrap/Toast';
import { MdInfoOutline } from "react-icons/md";

export default function LoginPage() {
  var [isLoading, setLoading] = useState(false);
  var [error, setError] = useState("");
  const [cookies, setCookie] = useCookies(["token"]);
  const navigation = useNavigate();
  const [user, setUser] = useState({ email: '', password: '' });

  // This state variable manages the visibility of the toast. 
  const [showToast, setShowToast] = useState(false);

  // This function is responsible for toggling the state of the showToast variable.
  const toggleShowToast = () => setShowToast(!showToast);

  function handleEmailChange(e) {
    setUser({ ...user, email: e.target.value });
  }

  function handlePasswordChange(e) {
    setUser({ ...user, password: e.target.value });
  }

  function login() {
    setLoading(true);

    if(user.email == "" || user.password == "") {
      setError("Enter Credentials!");
      setShowToast(true);
      setLoading(false);
    }

    else {
      axios({
        method: "post",
        url: "http://localhost:4000/user/login",
        data: user,
      }).then(
        function (response) {
          setLoading(false);
  
          if (response.data.token) {
  
            const expirationTime = new Date();
            expirationTime.setHours(expirationTime.getHours() + 24);
  
            setCookie("token", response.data.token, { path: "/", expires: expirationTime });
            navigation("/")
            setError("");
          } else {
            setError("Invalid Credentials");
            setUser({ ...user, email: "", password: "" });
            setShowToast(true);
          }
        },
        function (error) {
          setLoading(false);
          setError(error.response.data.message)
          setShowToast(true);
          setUser({ ...user, email: "", password: "" });
          console.log("error: ", error);
        }
      );
    }
  }

  return (
    <>
      <Navbar />
      <div className="">
        <div className="row">
          <div className="col-lg-6 p-6" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img className="loginbanner" style={{ width: "600px", height: "400px" }} src={banner} alt="" />
          </div>
          <div className="col-lg-6">
            <div className="login-container">
              <div className="  loginform text-center">
                <div className=" my-3">
                  <h4 className="heading">Welcome to Star App</h4>
                </div>
                <div className="my-2">
                  <p className="subheading">Your ultimate shift companion</p>
                </div>
                <div className="my-3">
                  <input
                    className="login-input"
                    value={user.email}
                    type="email"
                    onChange={handleEmailChange}
                    placeholder="Email"
                  />
                </div>
                <div className="my-3 ">
                  <input
                    className="login-input"
                    value={user.password}
                    type="password"
                    onChange={handlePasswordChange}
                    placeholder="Password"
                  />
                </div>
                <div className="my-3">
                  {isLoading === false && (
                    <button type="button" onClick={login} className="button-primary">
                      Login
                    </button>
                  )}
                  {isLoading && (
                    <button type="button" disabled onClick={login} className="button-primary">
                      Please Wait
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Toast show={showToast} delay={5000} autohide onClose={toggleShowToast} style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
          <Toast.Body className="bg-danger text-white">
            <strong><MdInfoOutline size={25} /> {error}</strong>
            <button type="button" className="btn-close btn-close-white float-end" onClick={toggleShowToast}></button>
          </Toast.Body>
        </Toast>
      </div>
    </>
  );
}