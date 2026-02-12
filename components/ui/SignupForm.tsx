"use client";

import React, { useState, useEffect } from "react";
import { encryptRegistrationData, encryptUsernameData } from "@/lib/encryption";

export default function SignupForm() {
  // UI State
  const [step, setStep] = useState(1); // 1: Initial, 2: OTP & Details
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  // Form State
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    phoneNumber: "",
    otpCode: "",
    firstName: "",
    lastName: "",
    email: "",
  });

  // 1. Real-time Username Check (Debounced)
  useEffect(() => {
    if (formData.userName.length < 4) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    const timeoutId = setTimeout(async () => {
      try {
        const payload = {
          username: formData.userName,
          brand_id: "31",
          timestamp: Math.floor(Date.now() / 1000).toString(),
        };

        // Using your PHP proxy or direct endpoint as per logic
        const response = await fetch(
          "https://winner247.co/username-check.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ params: encryptUsernameData(payload) }),
          },
        );
        const data = await response.json();

        if (data?.message?.is_username_exists) {
          setUsernameStatus("taken");
        } else {
          setUsernameStatus("available");
        }
      } catch (err) {
        console.error("Username check failed", err);
        setUsernameStatus("idle");
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [formData.userName]);

  // 2. Send OTP logic
  const handleSendOTP = async () => {
    if (usernameStatus !== "available")
      return alert("Please choose a valid username first");
    if (formData.phoneNumber.length < 10)
      return alert("Enter valid phone number");

    setIsLoading(true);
    try {
      const payload = {
        phoneNumber: formData.phoneNumber,
        phoneCountry: "in",
        brandId: 31,
      };

      const res = await fetch("https://affiliate1.bbb365.link/user/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registerInfo: encryptRegistrationData(payload),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setStep(2);
        setTimer(70);
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      alert("Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Final Registration
  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const payload = {
        userName: formData.userName,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        otpCode: formData.otpCode,
        phoneCountry: "in",
        marketingSource: "",
        brandId: 31,
        clickid: "",
        fsource: "",
        voluum_click_id: "",
      };

      const res = await fetch(
        "https://affiliate1.bbb365.link/user/user-register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            registerInfo: encryptRegistrationData(payload),
          }),
        },
      );
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("user_token", data.token);
        alert("Registration Successful!");
        window.location.href = "https://www.yolo247.site/login";
      } else {
        alert(
          data.message ||
            "Registration failed. Mobile might already be registered.",
        );
      }
    } catch (err) {
      alert("Final registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Timer logic
  useEffect(() => {
    if (timer > 0) {
      const t = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(t);
    }
  }, [timer]);

  return (
    <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 shadow-2xl text-white">
      <h2 className="text-2xl font-black text-center mb-6 italic text-[#fbb03b]">
        SIGN UP
      </h2>

      <div className="space-y-4">
        {/* USERNAME */}
        <div className="relative">
          <input
            className={`w-full bg-black/50 border ${usernameStatus === "taken" ? "border-red-500" : "border-white/10"} rounded-lg px-4 py-3 outline-none transition-all`}
            placeholder="Create Username"
            value={formData.userName}
            onChange={(e) =>
              setFormData({ ...formData, userName: e.target.value })
            }
            disabled={step === 2}
          />
          {usernameStatus === "checking" && (
            <span className="absolute right-3 top-3 text-[10px] text-gray-500 animate-pulse">
              Checking...
            </span>
          )}
          {usernameStatus === "available" && (
            <span className="absolute right-3 top-3 text-[10px] text-green-500">
              Available
            </span>
          )}
          {usernameStatus === "taken" && (
            <span className="absolute right-3 top-3 text-[10px] text-red-500">
              Already exists
            </span>
          )}
        </div>

        {/* PASSWORD */}
        <input
          type="password"
          className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 outline-none"
          placeholder="Create Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

        {/* MOBILE & OTP BUTTON */}
        <div className="flex gap-2">
          <input
            type="tel"
            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 outline-none"
            placeholder="Mobile Number"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
            disabled={step === 2}
          />
          {step === 1 && (
            <button
              onClick={handleSendOTP}
              disabled={isLoading || usernameStatus !== "available"}
              className="bg-[#fbb03b] text-black font-bold px-4 rounded-lg text-xs hover:bg-yellow-600 disabled:opacity-50"
            >
              GET OTP
            </button>
          )}
        </div>

        {/* STEP 2 FIELDS */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] text-gray-400">
                Time remaining: {timer}s
              </span>
              {timer === 0 && (
                <button
                  onClick={handleSendOTP}
                  className="text-[10px] text-[#fbb03b] underline"
                >
                  Resend
                </button>
              )}
            </div>
            <input
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 outline-none"
              placeholder="Verify OTP"
              value={formData.otpCode}
              onChange={(e) =>
                setFormData({ ...formData, otpCode: e.target.value })
              }
            />
            <div className="flex gap-2">
              <input
                className="w-1/2 bg-black/50 border border-white/10 rounded-lg px-4 py-3 outline-none"
                placeholder="First Name"
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              <input
                className="w-1/2 bg-black/50 border border-white/10 rounded-lg px-4 py-3 outline-none"
                placeholder="Last Name"
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
            <input
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 outline-none"
              placeholder="Email (Optional)"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 py-4 rounded-xl font-black italic uppercase shadow-xl hover:scale-[1.02] transition-transform"
            >
              {isLoading ? "PROCESSING..." : "SUBMIT"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
