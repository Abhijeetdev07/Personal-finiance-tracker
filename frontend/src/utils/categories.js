export const DEFAULT_CATEGORIES = [
  "Salary",
  "Bonus",
  "Freelance",
  "Interest",
  "Dividends",
  "Refunds",
  "Reimbursements",
  "Investments",
  "Savings",
  "Food",
  "Dining",
  "Groceries",
  "Transport",
  "Fuel",
  "Travel",
  "Bills",
  "Electricity",
  "Water",
  "Internet",
  "Mobile",
  "Rent",
  "EMI/Loan",
  "Insurance",
  "Healthcare",
  "Medical",
  "Education",
  "Subscriptions",
  "Shopping",
  "Personal Care",
  "Gifts/Donations",
  "Repairs & Maintenance",
  "Entertainment",
  "Taxes",
  "Fees",
  "Kids",
  "Pets",
  "Other"
];

const STORAGE_KEY = "fintracker.categories";

function dedupe(list) {
  return Array.from(new Set(list.filter(Boolean)));
}

export function loadCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [...DEFAULT_CATEGORIES];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((c) => typeof c === "string")) {
      // Merge saved categories with any new defaults added in code updates
      return dedupe([...parsed, ...DEFAULT_CATEGORIES]);
    }
  } catch (_) {
    // ignore parse errors
  }
  return [...DEFAULT_CATEGORIES];
}

export function saveCategories(categories) {
  try {
    const unique = dedupe(categories);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    return unique;
  } catch (_) {
    return categories;
  }
}

export function addCategory(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return loadCategories();
  const categories = loadCategories();
  if (!categories.includes(trimmed)) {
    categories.push(trimmed);
    return saveCategories(categories);
  }
  return categories;
}

export function removeCategory(name) {
  const categories = loadCategories().filter((c) => c !== name);
  return saveCategories(categories);
}
