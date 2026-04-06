import AuthForm from "@/components/AuthForm";
import AuthModal from "@/components/AuthModal";

export default function SignUpModal() {
  return (
    <AuthModal>
      <AuthForm type="sign-up" />
    </AuthModal>
  );
}
