import React, { useState } from "react";
import Input from "../common/Input";
import validator from "validator";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  setError,
  setLoading,
  setUser,
} from "../../redux/slices/authSlice";
import { closeAuthModal, switchAuthMode } from "../../redux/slices/uiSlice";
import "../../css/auth/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const { authMode } = useSelector((state) => state.ui);

  const isForgot = authMode === "forgot";

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    if (!validator.isEmail(email)) {
      dispatch(setError("Please enter a valid email address"));
      return;
    }

    if (!password) {
      dispatch(setError("Please enter your password"));
      return;
    }

    dispatch(setLoading(true));

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/auth/login`,
        { email, password },
      );

      dispatch(setUser({ user: res.data.user, token: res.data.token }));
      dispatch(closeAuthModal());
    } catch (err) {
      dispatch(setError(err?.response?.data?.message || "Login failed"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setForgotMsg("Please enter your email");
      return;
    }

    try {
      setForgotMsg("Sending reset link...");
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/auth/forgot-password`,
        { email: forgotEmail },
      );
      setForgotMsg("Reset link sent! Check your email 📩");
    } catch (err) {
      setForgotMsg(
        err?.response?.data?.message || "Failed to send reset email",
      );
    }
  };

  return (
    <div className="login-wrapper">
      <h3 className="login-title">Welcome Back</h3>
      <p className="login-subtitle">Please enter your details to login</p>

      <form className="login-form" onSubmit={handleLogin}>
        {!isForgot && (
          <>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email Address"
              placeholder="johndoe@gmail.com"
              type="email"
            />

            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              placeholder="Min 8 characters"
              type="password"
            />
          </>
        )}

        {/* Forgot password section */}
        {!isForgot ? (
          <div className="forgot-wrapper">
            <span
              className="forgot-link"
              onClick={() => {
                dispatch(clearError());
                dispatch(switchAuthMode("forgot"));
              }}
            >
              Forgot Password?
            </span>

            <span
              className="forgot-link"
              onClick={() => {
                dispatch(clearError());
                dispatch(switchAuthMode("signup"));
              }}
            >
              Don't have an account? Sign up
            </span>
          </div>
        ) : (
          <div className="forgot-box">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your registered email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />

            {forgotMsg && <p className="forgot-msg">{forgotMsg}</p>}

            <button
              type="button"
              className="forgot-btn"
              onClick={handleForgotPassword}
            >
              Send Reset Link
            </button>
          </div>
        )}

        {error && <div className="login-error">{error}</div>}

        {!isForgot && (
          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        )}
      </form>
    </div>
  );
};

export default Login;
