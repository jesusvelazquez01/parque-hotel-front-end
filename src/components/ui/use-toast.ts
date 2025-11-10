
// Re-export from the actual implementation in hooks folder
export { toast, useToast } from "@/hooks/use-toast";

// Also export the toast types but import from toast.tsx to avoid duplicates
import { type ToastProps } from "./toast";
export { type ToastProps };
