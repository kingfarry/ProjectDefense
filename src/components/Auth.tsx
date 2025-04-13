import { useState } from "react";
import { Loader2 } from "lucide-react";

interface AuthProps {
  onLogin: (email: string, username: string) => void;
}

interface UserData {
  email: string;
  username: string;
  password: string;
}

export function Auth({ onLogin }: AuthProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email format
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate username during signup
    if (!isLogin && username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    // Validate password
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Check password match during signup
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!isLogin) {
        // Check if user already exists
        const existingUser = localStorage.getItem(`user_${email}`);
        if (existingUser) {
          throw new Error("Email already registered");
        }

        // Create new user
        const userData: UserData = {
          email,
          username,
          password // Note: In production, never store plain passwords!
        };
        localStorage.setItem(`user_${email}`, JSON.stringify(userData));
      }

      // Get user data (either newly created or from storage)
      const userDataString = localStorage.getItem(`user_${email}`);
      const userData: UserData = isLogin
        ? userDataString 
          ? JSON.parse(userDataString) 
          : { username: "", email: "", password: "" }
        : { email, username, password };

      if (isLogin && (!userData || userData.password !== password)) {
        throw new Error("Invalid email or password");
      }

      onLogin(email, userData.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      {/* App Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
          Pronunciation Coach
        </h1>
        <p className="text-gray-600 mt-2">
          {isLogin ? "Login to continue your practice" : "Create your account to get started"}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          <p className="mt-4 text-purple-600">
            {isLogin ? "Logging in..." : "Creating your account..."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field (Signup only) */}
          {!isLogin && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your username"
                required
              />
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
              required
            />
          </div>

          {/* Confirm Password (Signup only) */}
          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            disabled={isLoading}
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
      )}

      <div className="mt-4 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
          }}
          className="text-sm text-purple-600 hover:text-purple-500 focus:outline-none"
          disabled={isLoading}
        >
          {isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}

export default Auth;