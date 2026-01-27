export function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('');
}

export function formatPhone(phone) {
  return phone.replace(/[^0-9]/g, '');
}
