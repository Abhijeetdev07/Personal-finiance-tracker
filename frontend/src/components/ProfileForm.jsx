import { useEffect, useState } from "react";
import CountryCodeSelector from "./CountryCodeSelector";

export default function ProfileForm({ initialValues, onCancel, onSubmit, submitting }) {
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    countryCode: "+91",
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

  const validateCountryCode = (countryCode) => {
    if (!countryCode) return ""; // Empty is allowed
    if (!/^\+\d{1,4}$/.test(countryCode)) {
      return "Country code must start with + followed by 1-4 digits (e.g., +91, +1, +44)";
    }
    return "";
  };

  const validatePhone = (phone, countryCode) => {
    if (!phone) return ""; // Empty is allowed
    
    // Remove any non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Different validation rules based on country code
    switch (countryCode) {
      case '+91': // India
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
          return "Indian mobile number must be 10 digits starting with 6, 7, 8, or 9";
        }
        break;
      case '+1': // US/Canada
        if (!/^\d{10}$/.test(cleanPhone)) {
          return "US/Canada number must be 10 digits";
        }
        break;
      case '+44': // UK
        if (!/^\d{10,11}$/.test(cleanPhone)) {
          return "UK number must be 10-11 digits";
        }
        break;
      case '+86': // China
        if (!/^1[3-9]\d{9}$/.test(cleanPhone)) {
          return "Chinese mobile number must be 11 digits starting with 1";
        }
        break;
      case '+49': // Germany
        if (!/^\d{10,12}$/.test(cleanPhone)) {
          return "German number must be 10-12 digits";
        }
        break;
      case '+33': // France
        if (!/^\d{9,10}$/.test(cleanPhone)) {
          return "French number must be 9-10 digits";
        }
        break;
      case '+81': // Japan
        if (!/^\d{10,11}$/.test(cleanPhone)) {
          return "Japanese number must be 10-11 digits";
        }
        break;
      case '+82': // South Korea
        if (!/^\d{10,11}$/.test(cleanPhone)) {
          return "South Korean number must be 10-11 digits";
        }
        break;
      case '+61': // Australia
        if (!/^\d{9,10}$/.test(cleanPhone)) {
          return "Australian number must be 9-10 digits";
        }
        break;
      case '+55': // Brazil
        if (!/^\d{10,11}$/.test(cleanPhone)) {
          return "Brazilian number must be 10-11 digits";
        }
        break;
      case '+7': // Russia
        if (!/^\d{10}$/.test(cleanPhone)) {
          return "Russian number must be 10 digits";
        }
        break;
      default:
        // Generic validation for other countries
        if (cleanPhone.length < 7 || cleanPhone.length > 15) {
          return "Phone number must be 7-15 digits";
        }
        if (!/^\d+$/.test(cleanPhone)) {
          return "Phone number must contain only digits";
        }
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
      phone: values.phone?.replace(/\s/g, '') || '',
      countryCode: values.countryCode?.trim() || '+91'
    };
    
    // Validate all fields with cleaned values
    const firstNameError = validateName(cleanedValues.firstName, "First name");
    const lastNameError = validateName(cleanedValues.lastName, "Last name");
    const countryCodeError = validateCountryCode(cleanedValues.countryCode);
    const phoneError = validatePhone(cleanedValues.phone, cleanedValues.countryCode);
    
    const newErrors = {};
    if (firstNameError) newErrors.firstName = firstNameError;
    if (lastNameError) newErrors.lastName = lastNameError;
    if (countryCodeError) newErrors.countryCode = countryCodeError;
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

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Country Code Selector */}
            <div className="w-full sm:w-32 flex-shrink-0">
              <CountryCodeSelector
                value={values.countryCode}
                onChange={(code) => handleChange({ target: { name: 'countryCode', value: code } })}
                disabled={submitting}
                hasError={!!errors.countryCode}
              />
              {errors.countryCode && (
                <p className="mt-1 text-xs text-red-600">{errors.countryCode}</p>
              )}
            </div>
            
            {/* Phone Number Input */}
            <div className="flex-1 min-w-0">
              <input
                type="tel"
                name="phone"
                value={values.phone}
                onChange={handleChange}
                disabled={submitting}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={values.countryCode === '+91' ? '9876543210' : 'Enter phone number'}
                maxLength={values.countryCode === '+91' ? '10' : '15'}
                pattern={values.countryCode === '+91' ? '[6-9][0-9]{9}' : '\\d+'}
                title={values.countryCode === '+91' ? 'Enter 10-digit mobile number starting with 6, 7, 8, or 9' : 'Enter phone number'}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>
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


