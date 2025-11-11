import mongoose from 'mongoose';

// Определяем схему (структуру данных)
// У каждого пользователя есть email, пароль, роль и дата регистрации
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,      // два одинаковых email быть не могут
        trim: true,        // убираем пробелы по краям
        lowercase: true    // приводим к нижнему регистру для унификации
    },

    passwordHash: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Создаём и экспортируем модель
export const User = mongoose.model('User', userSchema);


// TODO 1 - Пройтись подробнее по структуре
// TODO 2 - new mongoose.Schema({ и mongoose.model('User', userSchema); разобрать синтаксис по подробнее и не только в этом файле

