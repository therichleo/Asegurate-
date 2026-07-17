const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../templates/contrato.hbs');
const templateSource = fs.readFileSync(templatePath, 'utf8');
const template = Handlebars.compile(templateSource);

// Opera GX (Chromium-based) como fallback si Puppeteer no tiene Chrome bundled
const OPERA_PATH = 'C:\\Users\\leona\\AppData\\Local\\Programs\\Opera GX\\opera.exe';

const generateContractPdf = async (data) => {
  const html = template({
    ...data,
    request_id_short: data.request_id.slice(0, 8).toUpperCase(),
    service_label: data.service_type === 'seguridad' ? 'Personal de Seguridad' : 'Auxiliares de Aseo',
    amount_formatted: Number(data.amount).toLocaleString('es-CL'),
  });

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: OPERA_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-features=WebUIDarkMode',
      '--force-color-profile=srgb',
    ],
  });

  try {
    const page = await browser.newPage();
    // Forzar modo claro para que el PDF no herede el dark mode de Opera GX
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '2.5cm', bottom: '2.5cm', left: '2cm', right: '2cm' },
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

module.exports = { generateContractPdf };
