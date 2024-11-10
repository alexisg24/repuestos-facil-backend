import * as bcrypt from 'bcryptjs';

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};
