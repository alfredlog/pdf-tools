/**
 * E-Mail-Versand. Mit SMTP_URL (z. B. smtps://user:pass@smtp.example.com:465) werden echte Mails verschickt.
 * Ohne SMTP_URL wird die Mail nur im Terminal ausgegeben – praktisch zum lokalen Testen.
 */
const nodemailer = require("nodemailer");

const transport = process.env.SMTP_URL ? nodemailer.createTransport(process.env.SMTP_URL) : null;
const FROM = process.env.MAIL_FROM || "PDF Libre <noreply@pdf-libre.de>";

async function send({ to, subject, text }) {
  if (!transport) {
    console.log(`\n📧 E-Mail (nicht versendet, SMTP_URL fehlt)\nAn: ${to}\nBetreff: ${subject}\n\n${text}\n`);
    return;
  }
  await transport.sendMail({ from: FROM, to, subject, text });
}

module.exports = { send };
