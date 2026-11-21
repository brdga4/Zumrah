import FormField from "./FormField";

export default function SelectField({
  options = [],
  placeholder = "اختر من القائمة",
  placeholderDisabled = true,
  ...props
}) {
  return (
    <FormField {...props} as="select">
      <option value="" disabled={placeholderDisabled}>{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </FormField>
  );
}
