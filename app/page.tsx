"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import CryptoJS from "crypto-js";

interface Game {
  _id: string;
  name: string;
  link: string;
  image?: string;
}

// --- ENCRYPTION UTILS ---
const OTP_REG_KEY = CryptoJS.enc.Latin1.parse(
  "aNdRfUjXn2r5u8x/A?D(G+KbPeShVkYp",
);
const USERNAME_KEY = CryptoJS.enc.Latin1.parse(
  "Rp}ex:?zG0=&m&,DOX$X<:HI>G=LNKeL",
);
const AES_IV = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");

function encryptData(data: object) {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), OTP_REG_KEY, {
    iv: AES_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
}

function encryptUsernamePayload(data: object) {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), USERNAME_KEY, {
    iv: AES_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
}

// THIS IS THE DEFAULT EXPORT NEXT.JS IS LOOKING FOR
export default function LandingPage() {
  const { isLoaded, user, isSignedIn } = useUser();
  const router = useRouter();
  const games = useQuery(api.games.get);
  const currentUser = useQuery(api.users.getMe);

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [selectedGame, setSelectedGame] = useState<null | {
    name: string;
    link: string;
  }>(null);

  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isPlatformAdmin =
    userEmail === "nrnbmadmal@gmail.com" ||
    userEmail === "baani@baazidaily.com" ||
    currentUser?.role === "admin";

  useEffect(() => {
    if (username.length < 4) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    const delayDebounce = setTimeout(() => {
      checkUsername(username);
    }, 600);
    return () => clearTimeout(delayDebounce);
  }, [username]);

  const checkUsername = async (val: string) => {
    try {
      const payload = {
        username: val,
        brand_id: "31",
        timestamp: Math.floor(Date.now() / 1000).toString(),
      };
      const res = await fetch("https://winner247.co/username-check.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ params: encryptUsernamePayload(payload) }),
      });
      const data = await res.json();
      const exists = data?.message?.is_username_exists === true;
      setUsernameStatus(exists ? "taken" : "available");
    } catch (err) {
      setUsernameStatus("idle");
    }
  };

  const handleGetOTP = async () => {
    if (usernameStatus !== "available" && step === 1)
      return alert("Username is not available.");
    if (mobile.length !== 10) return alert("Enter valid 10-digit number.");

    setIsLoading(true);
    try {
      const payload = { phoneNumber: mobile, phoneCountry: "in", brandId: 31 };
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registerInfo: encryptData(payload) }),
      });
      const data = await res.json();

      if (data.success) {
        setStep(2);
        setTimer(70);
      } else {
        alert(data.error || data.message || "OTP Request Failed.");
      }
    } catch (err) {
      alert("Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!otp || !firstName || !lastName)
      return alert("Please fill all fields.");
    setIsLoading(true);
    try {
      const payload = {
        userName: username,
        phoneNumber: mobile,
        password: password,
        otpCode: otp.trim(),
        phoneCountry: "in",
        marketingSource: "",
        brandId: 31,
        clickid: "",
        fsource: "",
        voluum_click_id: "",
      };
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registerInfo: encryptData(payload) }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Registration Successful!");
        window.location.href = "https://www.yolo247.site/login";
      } else {
        alert(data.error || data.message || "Registration failed.");
      }
    } catch (err) {
      alert("Registration failed. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const displayGames = games ? [...games].reverse().slice(0, 12) : [];
  const leftGames = displayGames.slice(0, Math.ceil(displayGames.length / 2));
  const rightGames = displayGames.slice(Math.ceil(displayGames.length / 2));

  if (!isLoaded) return null;

  return (
    <main className="h-screen w-full bg-black text-white relative overflow-hidden flex flex-col font-sans">
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-yellow-600 rounded-full blur-[120px]" />
      </div>

      <header className="relative z-30 flex justify-between items-center px-6 py-3 border-b border-white/5 bg-black/80 backdrop-blur-md">
        <div className="flex items-center">
          <img
            src="/Yolo247-Logo.png"
            alt="Yolo247 Logo"
            className="h-8 md:h-10 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-2">
          {isPlatformAdmin && (
            <Button
              onClick={() => router.push("/admin-dashboard")}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase text-[9px] h-7 px-3 rounded-lg"
            >
              Admin Panel
            </Button>
          )}
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <Button
              onClick={() =>
                (window.location.href = "https://www.yolo247.site/login")
              }
              variant="outline"
              className="h-7 text-[9px] font-bold border-gray-700 text-white"
            >
              LOGIN
            </Button>
          )}
        </div>
      </header>

      <div className="relative z-10 flex-1 w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-6 gap-3 p-4 overflow-hidden">
        <div className="hidden lg:grid grid-cols-2 grid-rows-3 gap-3 col-span-2 content-start">
          {leftGames.map((game) => (
            <GameCard
              key={game._id}
              game={game}
              onClick={() =>
                setSelectedGame({ name: game.name, link: game.link })
              }
            />
          ))}
        </div>

        <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center z-20">
          <div className="w-full max-w-[380px] bg-[#121212] border border-white/10 p-6 rounded-2xl shadow-2xl">
            <h3 className="text-center font-black text-xl italic text-orange-500 mb-6 uppercase tracking-tighter">
              Sign Up
            </h3>

            <div className="space-y-4">
              {step === 1 && (
                <>
                  <div className="relative">
                    <input
                      className={`w-full bg-black/50 border ${usernameStatus === "taken" ? "border-red-500" : "border-white/10"} rounded-lg px-4 py-3 text-xs outline-none transition-all`}
                      placeholder="Create Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    {usernameStatus === "checking" && (
                      <span className="absolute right-3 top-3 text-[9px] text-gray-500 animate-pulse">
                        Checking...
                      </span>
                    )}
                    {usernameStatus === "available" && (
                      <span className="absolute right-3 top-3 text-[9px] text-green-500">
                        Available
                      </span>
                    )}
                    {usernameStatus === "taken" && (
                      <span className="absolute right-3 top-3 text-[9px] text-red-500">
                        Exists
                      </span>
                    )}
                  </div>

                  <input
                    type="password"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-xs outline-none"
                    placeholder="Create Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <div className="flex gap-2">
                    <input
                      type="tel"
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-xs outline-none"
                      placeholder="Mobile Number"
                      value={mobile}
                      maxLength={10}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                    <Button
                      onClick={handleGetOTP}
                      disabled={
                        isLoading ||
                        usernameStatus !== "available" ||
                        mobile.length !== 10
                      }
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] h-auto px-4"
                    >
                      {isLoading ? "..." : "GET OTP"}
                    </Button>
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                  <div className="flex flex-col items-center gap-2 mb-2">
                    {timer > 0 ? (
                      <span className="text-[10px] text-gray-400">
                        Time remaining:{" "}
                        <b className="text-orange-500">{timer}s</b>
                      </span>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] text-red-500 font-bold uppercase">
                          OTP Expired
                        </span>
                        <Button
                          onClick={handleGetOTP}
                          variant="outline"
                          className="h-7 text-[9px] border-orange-500 text-orange-500 hover:bg-orange-500/10 px-4"
                        >
                          RESEND OTP
                        </Button>
                      </div>
                    )}
                  </div>

                  <input
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-xs outline-none"
                    placeholder="Verify OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <input
                      className="w-1/2 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-xs outline-none"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <input
                      className="w-1/2 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-xs outline-none"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-black italic uppercase shadow-xl hover:opacity-90 transition-all text-sm"
                  >
                    {isLoading ? "PROCESSING..." : "SUBMIT"}
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-[10px] text-orange-500 font-bold uppercase mt-3 tracking-widest animate-pulse">
            Join to unlock full library
          </p>
        </div>

        <div className="hidden lg:grid grid-cols-2 grid-rows-3 gap-3 col-span-2 content-start">
          {rightGames.map((game) => (
            <GameCard
              key={game._id}
              game={game}
              onClick={() =>
                setSelectedGame({ name: game.name, link: game.link })
              }
            />
          ))}
        </div>
      </div>

      {selectedGame && (
        <div className="fixed inset-0 bg-black/98 flex items-center justify-center z-[100] p-4 backdrop-blur-xl">
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-white/10 p-3 max-w-5xl w-full relative">
            <button
              className="absolute -top-3 -right-3 bg-red-600 text-white w-8 h-8 rounded-full font-black shadow-xl"
              onClick={() => setSelectedGame(null)}
            >
              ×
            </button>
            <h2 className="text-lg font-black text-orange-400 uppercase italic mb-3 tracking-tight px-2">
              {selectedGame.name}
            </h2>
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10">
              <iframe
                src={selectedGame.link}
                title={selectedGame.name}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// HELPER COMPONENT (Not default exported)
function GameCard({ game, onClick }: { game: Game; onClick: () => void }) {
  return (
    <div
      className="group bg-gray-900/60 rounded-xl p-2 border border-white/5 hover:border-orange-500/50 transition-all cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-lg aspect-video bg-black flex-1">
        <img
          src={game.image || "https://placehold.co/400x225"}
          alt={game.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-all opacity-80"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-[7px] font-black bg-orange-600 px-3 py-1 rounded-full uppercase italic">
            Play
          </span>
        </div>
      </div>
      <h3 className="text-center mt-2 font-black text-gray-400 group-hover:text-orange-400 transition-colors text-[8px] uppercase tracking-tighter truncate px-1">
        {game.name}
      </h3>
    </div>
  );
}
