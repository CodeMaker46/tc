import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useRoute } from '../context/RouteContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();


  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [otp, setOtp] = useState('');
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

  const {isLoading, setIsLoading} = useRoute();


  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      console.log(data);

      if (res.ok) {
        const token = data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('name',data.user.name)

        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error logging in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      const res = await fetch(`${backendUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Signup successful! Check your email for OTP.');
      } else {
        toast.error(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error signing up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();
      console.log(data);
      if (res.ok) {
        toast.success('Email verified! Please log in.');
        setIsLogin(true);
        setOtp('');
      } else {
        toast.error(data.message || 'OTP verification failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error verifying OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // *** Return JSX must be inside component function ***
  return (
    <div className="min-h-screen flex">
      {/* Loading overlay */}
      {isLoading && (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-white text-center font-semibold">
          <h1 className="text-lg mb-2">Loading Data...</h1>
          <p className="mb-4">Please wait while the data is loading.</p>
          <img src="/newpreeload.gif" alt="Loading..." className="w-12 h-12 mx-auto" />
        </div>
      </div>
    )}
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-primary-600 to-primary-800 p-12">
        <div className="w-full flex flex-col justify-between">
          <div>
            <Link to="/" className="text-white text-3xl font-bold">
              LogiTrack
            </Link>
            <h2 className="text-white text-4xl font-bold mt-10">Welcome Back</h2>
            <p className="text-primary-100 mt-4 text-lg">
              Access your logistics dashboard to track shipments, manage deliveries, and optimize your supply chain.
            </p>
          </div>
          <div className="bg-white/10 p-8 rounded-xl backdrop-blur-sm">
            <p className="text-white text-lg font-medium">
              "This platform has revolutionized how we manage our logistics. The toll calculator saves us both time and money."
            </p>
            <div className="mt-4 flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full"></div>
              <div className="ml-4">
                <p className="text-white font-medium">Rajesh Kumar</p>
                <p className="text-primary-100">Fleet Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Forms */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setOtp('');
                  setForm({ name: '', email: '', password: '', confirmPassword: '' });
                }}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          <div className="mt-8">
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>
                  <Link to='/forget-password'><button
                    type="button"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    Forgot password?
                  </button></Link>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Sign in
                </button>
              </form>
            ) : (
              <>
                <form onSubmit={handleSignup} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="you@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Sign up
                  </button>
                </form>

                {/* OTP verification */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="123456"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="mt-2 w-full flex justify-center py-2 px-4 rounded-lg bg-primary-500 text-white hover:bg-primary-600"
                  >
                    Verify OTP
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
