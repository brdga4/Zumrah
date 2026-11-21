import FormField from "./FormField";

export default function InputField({ type = "text", ...props }) {
  return <FormField {...props} as="input" type={type} />;
}
