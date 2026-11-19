interface CreateUserInput {
  name: string;
  email: string;
}

export const validateCreateUser = (input: CreateUserInput): string | null => {
  if (!input.name || typeof input.name !== "string") {
    return "Name is required";
  }

  if (input.name.trim().length < 2) {
    return "Name must contain at least 2 characters";
  }

  if (!input.email || typeof input.email !== "string") {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(input.email)) {
    return "Invalid email address";
  }

  return null;
};
