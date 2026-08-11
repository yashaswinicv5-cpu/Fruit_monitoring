export const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem("localUsers") || "{}");
  } catch (e) {
    return {};
  }
};

export const saveUsers = (users) => {
  localStorage.setItem("localUsers", JSON.stringify(users));
};

export const signUpLocal = async (email, password) => {
  if (!email || !password) throw new Error("Email and password are required.");
  const users = getUsers();
  if (users[email]) throw new Error("User already exists.");
  users[email] = { password, createdAt: Date.now() };
  saveUsers(users);
  const user = { uid: `local:${email}`, email };
  localStorage.setItem("fruitAppUser", JSON.stringify(user));
  return { user };
};

export const signInLocal = async (email, password) => {
  if (!email || !password) throw new Error("Email and password are required.");
  const users = getUsers();
  const record = users[email];
  if (!record || record.password !== password) throw new Error("Invalid email or password.");
  const user = { uid: `local:${email}`, email };
  localStorage.setItem("fruitAppUser", JSON.stringify(user));
  return { user };
};

export const signOutLocal = async () => {
  localStorage.removeItem("fruitAppUser");
};

export const resetPasswordLocal = async (email, newPassword) => {
  if (!email || !newPassword) throw new Error("Email and new password are required.");
  const users = getUsers();
  const record = users[email];
  if (!record) throw new Error("No user found with that email.");
  record.password = newPassword;
  record.updatedAt = Date.now();
  users[email] = record;
  saveUsers(users);
  return { ok: true };
};
