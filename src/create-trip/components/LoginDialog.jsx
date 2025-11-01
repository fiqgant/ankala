import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

function LoginDialog({ open, onLogin }) {
  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Sign In Required</DialogTitle>
          </VisuallyHidden>
          <DialogDescription>
            <img
              src="/logo.svg"
              alt="logo"
              width="100px"
              className="items-center"
            />
            <h2 className="font-bold text-lg">
              Sign In to check out your travel plan
            </h2>
            <p>Sign in to the App with Google authentication securely</p>
            <Button
              onClick={onLogin}
              className="w-full mt-6 flex gap-4 items-center"
            >
              <FcGoogle className="h-7 w-7" />
              Sign in With Google
            </Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default LoginDialog;
