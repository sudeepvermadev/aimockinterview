import AuthForm from "@/components/AuthForm";
import AuthModal from "@/components/AuthModal";

export default function SignInModal() {
  return (
    <AuthModal>
      <AuthForm type="sign-in" />
    </AuthModal>
  );
}
