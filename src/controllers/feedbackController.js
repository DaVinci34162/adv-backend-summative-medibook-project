const fs = require('fs');
const path = require('path');

async function getFeedback(req, res, next) {
  try {
    // 1. Determine language (fallback to English)
    let lang = req.query.lang || 'en';
    const validLangs = ['en', 'fr'];
    if (!validLangs.includes(lang)) {
      lang = 'en';
    }

    // 2. Load locale file
    const localePath = path.join(__dirname, `../../locales/${lang}.json`);
    const localeData = JSON.parse(fs.readFileSync(localePath, 'utf8'));

    // 3. Localize the date
    const today = new Date();
    const formattedDate = new Intl.DateTimeFormat(lang, { dateStyle: 'full' }).format(today);
    const dateString = localeData.date.replace('{date}', formattedDate);

    // 4. Generate HTML
    const questionsHtml = localeData.questions.map((q, i) => `
      <div class="question">
        <label>${i + 1}. ${q}</label>
        <textarea rows="4" name="q${i + 1}"></textarea>
      </div>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <title>${localeData.title}</title>
        <style>
          body { font-family: sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
          .question { margin-bottom: 1.5rem; display: flex; flex-direction: column; }
          textarea { width: 100%; padding: 0.5rem; margin-top: 0.5rem; }
          button { padding: 0.5rem 1rem; background: #007bff; color: white; border: none; cursor: pointer; }
          .lang-switch { margin-bottom: 1rem; }
        </style>
      </head>
      <body>
        <div class="lang-switch">
          <a href="/feedback?lang=en">English</a> | <a href="/feedback?lang=fr">Français</a>
        </div>
        <h1>${localeData.title}</h1>
        <p>${localeData.instructions}</p>
        <p><em>${dateString}</em></p>
        <form>
          ${questionsHtml}
          <button type="submit">Submit</button>
        </form>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    next(err);
  }
}

module.exports = { getFeedback };