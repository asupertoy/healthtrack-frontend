export function isEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

export function isPhone(phone) {
    const re = /^[0-9]{7,15}$/
    return re.test(phone)
}

export function isNotEmpty(str) {
    return str && str.trim().length > 0
}
