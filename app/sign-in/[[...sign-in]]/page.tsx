import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <SignIn
        // After login, send them to the external site:
        forceRedirectUrl="https://www.yolo247.site/login"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
