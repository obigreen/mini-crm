import bcrypt from "bcrypt";

const SALT_ROUNDS = 10; // чем больше, тем надёжнее, но медленнее

// Превращаем пароль в "отпечаток"
export async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

// Проверяем, совпадает ли введённый пароль с хэшом
export async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}