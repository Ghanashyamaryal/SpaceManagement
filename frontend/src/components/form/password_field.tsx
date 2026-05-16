import React from "react";
import { Input } from "../ui/Input";
import { Eye, EyeOff } from "lucide-react";

const PasswordField = ({
  form,
  ...field
}: {
  form: any;
  name: string;
  [key: string]: any;
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder={`Enter ${field.name}...`}
        className="h-9 border-input focus:border-ring focus:ring-1 focus:ring-ring shadow-sm text-foreground font-normal bg-background"
        {...field}
        disabled={field.disable}
      />
      {showPassword ? (
        <span onClick={() => setShowPassword(false)}>
          <EyeOff className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-primary w-4 h-4" />
        </span>
      ) : (
        <span onClick={() => setShowPassword(true)}>
          <Eye className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-primary w-4 h-4" />
        </span>
      )}
    </div>
  );
};
export default PasswordField;
