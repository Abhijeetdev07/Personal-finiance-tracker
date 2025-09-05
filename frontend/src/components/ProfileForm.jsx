import { useEffect, useState } from "react";

export default function ProfileForm({ initialValues, onCancel, onSubmit, submitting }) {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setValues((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateName = (name, fieldName) => {
    if (!name) return ""; // Empty is allowed
    if (!/^[a-zA-Z]+$/.test(name)) {
      return `${fieldName} can only contain letters (no spaces, numbers, or symbols)`;
    }
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone) return ""; // Empty is allowed
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return "Phone number must be exactly 10 digits starting with 6, 7, 8, or 9";
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Remove spaces from first name, last name, and phone
    const cleanedValues = {
      ...values,
      firstName: values.firstName?.replace(/\s/g, '') || '',
      lastName: values.lastName?.replace(/\s/g, '') || '',
      phone: values.phone?.replace(/\s/g, '') || ''
    };
    
    // Validate all fields with cleaned values
    const firstNameError = validateName(cleanedValues.firstName, "First name");
    const lastNameError = validateName(cleanedValues.lastName, "Last name");
    const phoneError = validatePhone(cleanedValues.phone);
    
    const newErrors = {};
    if (firstNameError) newErrors.firstName = firstNameError;
    if (lastNameError) newErrors.lastName = lastNameError;
    if (phoneError) newErrors.phone = phoneError;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Update the form values to show cleaned versions
    setValues(cleanedValues);
    
    onSubmit?.(cleanedValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            disabled={submitting}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.firstName ? "border-red-500" : ""
            }`}
            placeholder="John"
            pattern="[a-zA-Z]+"
            title="First name can only contain letters (no spaces)"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            disabled={submitting}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.lastName ? "border-red-500" : ""
            }`}
            placeholder="Doe"
            pattern="[a-zA-Z]+"
            title="Last name can only contain letters (no spaces)"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={values.phone}
            onChange={handleChange}
            disabled={submitting}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? "border-red-500" : ""
            }`}
            placeholder="9876543210"
            maxLength="10"
            pattern="[6-9][0-9]{9}"
            title="Enter 10-digit mobile number starting with 6, 7, 8, or 9"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          name="bio"
          value={values.bio}
          onChange={handleChange}
          rows={4}
          disabled={submitting}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tell something about yourself..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}


