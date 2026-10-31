// Baserow public-form integration. This file contains no credentials.
window.SaraBaserow = {
  async submit(formSlug, fields) {
    const url = 'https://api.baserow.io/api/database/views/form/' + encodeURIComponent(formSlug) + '/submit/';
    const metaResponse = await fetch(url);
    if (!metaResponse.ok) throw new Error('Could not load Baserow form: ' + metaResponse.status);
    const meta = await metaResponse.json();
    const mapped = {};
    for (const item of meta.fields || []) {
      const field = item.field || {};
      const name = String(field.name || item.name || '').toLowerCase().replace(/ё/g, 'е');
      const id = field.id;
      let value;
      if (/имя|name/.test(name)) value = fields.name;
      else if (/дата|date/.test(name)) value = fields.date;
      else if (/ошиб|mistake/.test(name)) value = fields.mistakes;
      else if (/правильн|верн|correct/.test(name)) value = fields.correct;
      else if (/звезд|star/.test(name)) value = fields.star;
      else if (/время|секунд|time/.test(name)) value = fields.seconds;
      else if (/балл|score/.test(name)) value = fields.score;
      if (value !== undefined && id != null) mapped['field_' + id] = value;
      else if (item.required) throw new Error('Unmapped required field: ' + name);
    }
    if (!Object.keys(mapped).length) throw new Error('No matching Baserow fields');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapped)
    });
    if (!response.ok) throw new Error('Baserow returned ' + response.status);
    return response.json();
  }
};
