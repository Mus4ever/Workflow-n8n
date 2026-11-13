import { load, save } from './storage';

const ANIMALS = ['Fennec', 'Gazelle', 'Faucon', 'Lynx', 'Caracal', 'Mouflon', 'Cigogne', 'Dauphin', 'Chacal', 'Guépard'];

function randomId(length) {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

export function suggestPseudo() {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${animal} ${10 + Math.floor(Math.random() * 90)}`;
}

// Un identifiant par appareil : il sert à compter les participants et à garder un vote par personne.
export function getDevice() {
  let device = load('salle_device', '');
  if (!device) {
    device = randomId(10);
    save('salle_device', device);
  }
  return device;
}

// Adresse fictive, propre à chaque appareil : personne ne saisit sa vraie adresse,
// et la limite de débit d'un participant ne bloque pas les autres.
export function emailFor(prefix, device) {
  const slug = prefix
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'invite';
  return `${slug}.${device.slice(0, 5)}@salle.example`;
}
