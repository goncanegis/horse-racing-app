import { useToast } from "vue-toastification";

const toast = useToast();

interface ToastOptions {
  type?: "error" | "info" | "success";
  title: string;
  description?: string;
  timeout?: number;
}

const defaultToastOptions: Partial<ToastOptions> = {
  type: "success",
  description: "",
  timeout: 3000,
};

export const showToast = (options: ToastOptions) => {
  const finalOptions = { ...defaultToastOptions, ...options };

  if (finalOptions.type === "error") {
    toast.error(finalOptions.title, {
      timeout: finalOptions.timeout,
      closeOnClick: true,
      pauseOnHover: true,
    });
  } else if (finalOptions.type === "info") {
    toast.info(finalOptions.title, {
      timeout: finalOptions.timeout,
      closeOnClick: true,
      pauseOnHover: true,
    });
  } else {
    toast.success(finalOptions.title, {
      timeout: finalOptions.timeout,
      closeOnClick: true,
      pauseOnHover: true,
    });
  }
};
