import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <SignUp
        // After they create an account, send them here:
        forceRedirectUrl="https://www.yolo247.site/login"
        // If they click "Already have an account", send them here:
        signInUrl="https://www.yolo247.site/login"
      />
    </div>
  );
}
