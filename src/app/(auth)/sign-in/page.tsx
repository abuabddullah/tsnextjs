import { Button } from "@/components/ui/button";
import Link from "next/link";

const SignInPage = () => {
  return (
    <div>
      <h1>Sign In Page</h1>
      <Link href="/sign-up">
        <Button>Sign UP</Button>
      </Link>
    </div>
  );
};

export default SignInPage;
