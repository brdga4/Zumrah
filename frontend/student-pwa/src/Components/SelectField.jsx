import "./SelectField.css";
export default function SelectField({
  id,
  label,
  options = [],
  value,
  onChange,
  placeholder = "اختر من القائمة"
}) {
  return (
    <div className="zumrah-field">
      <label htmlFor={id} className="zumrah-label">
        {label}
      </label>

      <select
        id={id}
        className="zumrah-select"
        value={value}
        onChange={onChange}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
