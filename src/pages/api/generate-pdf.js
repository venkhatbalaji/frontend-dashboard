import puppeteer from 'puppeteer';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '7mb', // Set limit to 5MB
    },
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { html, css, tokens = {}, lang = "en", direction = "ltr" } = req.body;
    const isArabic = lang === "ar" || direction === "rtl";
    const fontFamily = isArabic
      ? "sans-serif"
      : "'SF Pro Text', 'sf-pro-text', 'Arial', 'Helvetica Neue', Helvetica, sans-serif";
    const fontFace = !isArabic ? `
      @font-face {
        font-family: 'SF Pro Text';
        src: url('/fonts/sf-pro-text.woff2') format('woff2'),
             url('/fonts/sf-pro-text.woff') format('woff');
        font-weight: normal;
        font-style: normal;
      }
    ` : '';
    const simpleHtml = `<!DOCTYPE html>
        <html lang="${lang}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PDF Test</title>
            <style>
              ${fontFace}
              ${css}

              body {
                font-family: ${fontFamily} !important;
                ${Object.keys(tokens || {})?.map((v) => `--${v}: ${tokens[v]}`)?.join(";")}
              }
            </style>
        </head>
        <body>
          ${html}
        </body>
        </html>
        `;

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer'
        ]
      });
      const page = await browser.newPage();
      await page.setContent(simpleHtml, { waitUntil: 'domcontentloaded', timeout: 120000 });
      await page.waitForSelector('body', { visible: true });
      const contentDimensions = await page.evaluate(() => {
        const body = document.body;
        return {
          width: body.scrollWidth,
          height: body.scrollHeight
        };
      });

      let pdfBuffer = await page.pdf({
        // path: filePath,
        width: `${contentDimensions.width}px`,
        height: `${contentDimensions.height}px`,
        printBackground: true,
      });
      await browser.close();
      if (!Buffer.isBuffer(pdfBuffer)) {
        pdfBuffer = Buffer.from(pdfBuffer)
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Content-Disposition', 'attachment; filename=download.pdf');
      res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: error?.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
