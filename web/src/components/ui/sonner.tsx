import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = (props: ToasterProps) => <Sonner className="toaster group" richColors {...props} />;

export { Toaster };
