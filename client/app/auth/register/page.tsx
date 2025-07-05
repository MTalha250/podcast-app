"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, Music, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import useAuthStore from "@/store/authStore";
import { RegisterRequest } from "@/types";

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterRequest>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const { register, isLoading, error, clearError, isAuthenticated } =
    useAuthStore();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // First name validation
    if (!formData.first_name.trim()) {
      errors.first_name = "First name is required";
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      errors.last_name = "Last name is required";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    // Password confirmation validation
    if (!formData.password_confirm) {
      errors.password_confirm = "Please confirm your password";
    } else if (formData.password !== formData.password_confirm) {
      errors.password_confirm = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
      toast.success(
        "Account created successfully! Welcome to our podcast community."
      );
      router.push("/");
    } catch (error: any) {
      // Error is handled by the store, but we can show a toast too
      toast.error(
        "Registration failed. Please check your information and try again."
      );
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="min-h-[85vh] bg-background flex items-center justify-center py-10 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo */}
        <div className="text-center mt-10">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30 mb-2">
            <Music className="h-8 w-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Create Account
            </h2>
            <Sparkles className="h-6 w-6 text-purple-400 animate-pulse" />
          </div>
          <p className="text-muted-foreground">
            Join us and start discovering amazing podcasts!
          </p>
        </div>

        {/* Form */}
        <Card className="bg-card/80 backdrop-blur-xl border-white/10 shadow-xl shadow-purple-500/10">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Global Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
                  {error}
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="first_name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    First Name
                  </label>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="First name"
                    className={`bg-card/50 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 ${
                      validationErrors.first_name
                        ? "border-red-500/50 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {validationErrors.first_name && (
                    <p className="text-red-400 text-sm mt-1">
                      {validationErrors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="last_name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Last Name
                  </label>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    className={`bg-card/50 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 ${
                      validationErrors.last_name
                        ? "border-red-500/50 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {validationErrors.last_name && (
                    <p className="text-red-400 text-sm mt-1">
                      {validationErrors.last_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username"
                  className={`bg-card/50 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 ${
                    validationErrors.username
                      ? "border-red-500/50 focus:border-red-500"
                      : ""
                  }`}
                />
                {validationErrors.username && (
                  <p className="text-red-400 text-sm mt-1">
                    {validationErrors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`bg-card/50 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 ${
                    validationErrors.email
                      ? "border-red-500/50 focus:border-red-500"
                      : ""
                  }`}
                />
                {validationErrors.email && (
                  <p className="text-red-400 text-sm mt-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a password"
                    className={`bg-card/50 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 pr-10 ${
                      validationErrors.password
                        ? "border-red-500/50 focus:border-red-500"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-red-400 text-sm mt-1">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="password_confirm"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="password_confirm"
                    name="password_confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password_confirm}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className={`bg-card/50 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300 pr-10 ${
                      validationErrors.password_confirm
                        ? "border-red-500/50 focus:border-red-500"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {validationErrors.password_confirm && (
                  <p className="text-red-400 text-sm mt-1">
                    {validationErrors.password_confirm}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 border-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create Account
                    <Sparkles className="h-4 w-4" />
                  </span>
                )}
              </Button>

              {/* Terms */}
              <p className="text-xs text-muted-foreground/80 text-center">
                By creating an account, you agree to our Terms of Service and
                Privacy Policy.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-blue-300 transition-all duration-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
