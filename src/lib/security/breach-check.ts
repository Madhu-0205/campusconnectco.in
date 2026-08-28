import crypto from 'crypto';

/**
 * Checks if a password has been leaked in a data breach using HaveIBeenPwned API (k-anonymity).
 * This sends only the first 5 characters of the SHA-1 hash to the API.
 */
export async function checkPasswordBreach(password: string): Promise<boolean> {
 try {
 const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
 const prefix = hash.slice(0, 5);
 const suffix = hash.slice(5);

 const controller = new AbortController();
 const timeoutId = setTimeout(() => controller.abort(), 3000);

 const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
 signal: controller.signal
 });
 clearTimeout(timeoutId);
 if (!response.ok) return false;

 const data = await response.text();
 const hashes = data.split('\n');

 return hashes.some(h => h.split(':')[0] === suffix);
 } catch (error) {
 console.error('Breach check error:', error);
 return false; // Fail safe
 }
}
