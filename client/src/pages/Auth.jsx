import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRoute } from "../context/RouteContext";
import { auth, googleProvider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";
import { useState } from "react";
import axios from "axios";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isUser, setIsUser] = useState(true); // true = User, false = Admin
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
   //const [otp, setOtp] = useState('');
   const [otpToken, setOtpToken] = useState('');// Track if OTP has been sent
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

  const [otp, setOtp] = useState('');
  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

  const { isLoading, setIsLoading } = useRoute();

  // User handlers (same as your existing ones)
  const handleGoogleLogin = async () => {
    if (!isUser) return; // Only allow google login for users

    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch(`${backendUrl}/api/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: result.user.email,
          name: result.user.displayName,
          googleId: result.user.uid,
          profileImage: result.user.photoURL,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("name", data.user.name || result.user.displayName || "User");
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem(
          "profileImage",
          data.user.profileImage || result.user.photoURL
        );
        localStorage.setItem("isAdmin", data.user.isAdmin ? "true" : "false");
        toast.success("Google login successful!");
        navigate("/");
      } else {
        throw new Error(data.message || "Failed to login with Google");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Error logging in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("name", data.user.name);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("profileImage", data.user.profileImage || "");
        localStorage.setItem("isAdmin", data.user.isAdmin ? "true" : "false");

        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Error logging in");
    } finally {
      setIsLoading(false);
    }
  };

 const handleAdminLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const res = await fetch(`${backendUrl}/api/auth/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.password }),
    });

    const data = await res.json();
    console.log('data:', data);

    if (res.ok) {
      toast.success("OTP sent to admin email!");
      setOtpSent(true); // show the OTP input UI
    } else {
      toast.error(data.message || "Admin login failed");
    }
  } catch (err) {
    console.error("Admin login error:", err);
    toast.error("Something went wrong during admin login");
  } finally {
    setIsLoading(false);
  }
};

const handleVerifyAdminOtp = async () => {
  if (!otp || !form.email) {
    toast.error("Please enter the OTP and email.");
    return;
  }

  setIsLoading(true);

  try {
    const res = await fetch(`${backendUrl}/api/auth/admin-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp, email: form.email }), 
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId); // userId now holds the admin's user ID
      localStorage.setItem("name", data.name); 
      localStorage.setItem("email", data.email);
      localStorage.setItem("isAdmin", data.isAdmin ? "true" : "false"); // Store isAdmin as a boolean string
      toast.success("Admin login successful!");
      navigate("/");
    } else {
      toast.error(data.error || "Invalid OTP");
    }
  } catch (err) {
    console.error("OTP verification error:", err);
    toast.error("Error verifying OTP");
  } finally {
    setIsLoading(false);
  }
};




  const handleUserSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords don't match");
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(`${backendUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Signup successful! Check your email for OTP.");
      } else {
        toast.error(data.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error signing up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Email verified! Please log in.");
        setIsLogin(true);
        setOtp("");
      } else {
        toast.error(data.message || "OTP verification failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error verifying OTP");
    } finally {
      setIsLoading(false);
    }
  };

 

  // JSX form for user login/signup or admin login
  return (
    <div className="min-h-screen flex">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-white text-center font-semibold">
            <h1 className="text-lg mb-2">Loading Data...</h1>
            <p className="mb-4">Please wait while the data is loading.</p>
            <img
              src="/newpreeload.gif"
              alt="Loading..."
              className="w-12 h-12 mx-auto"
            />
          </div>
        </div>
      )}

      {/* Left side image & info */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center p-12"
        style={{ backgroundImage: "url('/public/trucks.jpg')" }}
      >
        <div className="w-full flex flex-col justify-between p-6 rounded-xl ">
          <div>
            <Link to="/" className="text-white text-3xl font-bold">
              TollTrack
            </Link>
            <h2 className="text-white text-4xl font-bold mt-10">
              Welcome Back
            </h2>
            <p className="text-red-100 mt-4 text-lg">
              Your smart logistics hub - plan routes, minimize tolls, and
              deliver faster.
            </p>
          </div>
          <div className="bg-white/10 p-8 rounded-xl backdrop-blur-sm">
            <p className="text-white text-lg font-medium">
              "This platform has revolutionized how we manage our logistics. The
              toll calculator saves us both time and money."
            </p>
            <div className="mt-4 flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full"></div>
              <div className="ml-4">
                <p className="text-white font-medium">Rajesh Kumar</p>
                <p className="text-red-100">Fleet Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        {/* User/Admin toggle buttons */}
        <div className="flex space-x-4 mb-6 justify-center">
          <button
            onClick={() => {
              setIsUser(true);
              setIsLogin(true);
              setOtp("");
              setForm({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
              });
            }}
            className={`px-6 py-2 rounded-lg font-semibold ${
              isUser ? "bg-red-600 text-white" : "bg-gray-300 text-gray-700"
            }`}
          >
            User
          </button>
          <button
            onClick={() => {
              setIsUser(false);
              setIsLogin(true);
              setOtp("");
              setForm({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
              });
            }}
            className={`px-6 py-2 rounded-lg font-semibold ${
              !isUser ? "bg-red-600 text-white" : "bg-gray-300 text-gray-700"
            }`}
          >
            Admin
          </button>
        </div>

        <div className="mx-auto w-full max-w-sm lg:w-96 bg-transparent">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-black dark:text-black">
              {isUser
                ? isLogin
                  ? "Sign in to your account"
                  : "Create your account"
                : "Admin Login"}
            </h2>
            {isUser ? (
              <p className="mt-2 text-sm text-black dark:text-black">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setOtp("");
                    setForm({
                      name: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                    });
                  }}
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            ) : null}
          </div>

          <div className="mt-8">
            {/* For User: Google login */}
            {isUser && (
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center py-2 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mb-4"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                Continue with Google
              </button>
            )}

            {/* User forms */}
            {isUser ? (
              isLogin ? (
                <form onSubmit={handleUserLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-black">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="you@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-black">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <label className="ml-2 block text-sm text-black dark:text-black">
                        Remember me
                      </label>
                    </div>
                    <Link to="/forget-password">
                      <button
                        type="button"
                        className="text-sm font-medium text-red-600 hover:text-red-500"
                      >
                        Forgot password?
                      </button>
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Sign in
                  </button>
                </form>
              ) : (
                <>
                  <form onSubmit={handleUserSignup} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-black">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black dark:text-black">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="you@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black dark:text-black">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                        className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black dark:text-black">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        required
                        value={form.confirmPassword}
                        onChange={(e) =>
                          setForm({ ...form, confirmPassword: e.target.value })
                        }
                        className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex justify-center py-3 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Sign up
                    </button>
                  </form>

                  {/* OTP verification */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-black dark:text-black">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="123456"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="mt-2 w-full flex justify-center py-2 px-4 rounded-lg bg-red-500 text-white hover:bg-red-600"
                    >
                      Verify OTP
                    </button>
                  </div>
                </>
              )
            ) : (
              // Admin login form
              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-black">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-gray-900 dark:text-white"
                    placeholder="admin@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-black">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-gray-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Verify Email
                </button>

                {otpSent && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-black dark:text-black">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-gray-900 dark:text-white"
                      placeholder="123456"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyAdminOtp}
                      className="mt-2 w-full flex justify-center py-2 px-4 rounded-lg bg-red-500 text-white hover:bg-red-600"
                    >
                      Verify OTP
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
