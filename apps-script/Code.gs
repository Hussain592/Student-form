const SHEET_NAME = 'Student Interests';
const HEADERS = ['Full name', 'Email address', 'Phone number', 'Education / current work', 'Do you have a laptop?', 'Why are you interested?'];

function doPost(event) {
  const parameters = event && event.parameter ? event.parameter : {};
  const nonce = String(parameters.nonce || '');

  try {
    if (!/^[a-f0-9]{32}$/.test(nonce)) throw new Error('Invalid submission. Please refresh the page and try again.');
    if (parameters.website) throw new Error('This submission could not be accepted.');

    const submission = {
      name: clean(parameters.name, 100),
      email: clean(parameters.email, 254),
      phone: clean(parameters.phone, 30),
      education: clean(parameters.education, 200),
      hasLaptop: clean(parameters.hasLaptop, 3),
      motivation: clean(parameters.motivation, 500),
    };

    if (submission.name.length < 2) throw new Error('Please enter your name.');
    if (submission.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email)) {
      throw new Error('Please enter a valid email address or leave it blank.');
    }
    if (!/^[+()\d\s.-]{7,30}$/.test(submission.phone) || (submission.phone.match(/\d/g) || []).length < 7) {
      throw new Error('Please enter a valid phone number.');
    }
    if (!submission.education || !submission.motivation || parameters.consent !== 'true') {
      throw new Error('Please complete all required fields and agree to the contact notice.');
    }
    if (!['yes', 'no'].includes(submission.hasLaptop.toLowerCase())) {
      throw new Error('Please select whether you have a laptop.');
    }
    submission.hasLaptop = submission.hasLaptop.toLowerCase() === 'yes' ? 'Yes' : 'No';

    const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (!spreadsheetId) throw new Error('The course team has not finished configuring the form.');

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      let sheet = spreadsheet.getSheetByName(SHEET_NAME);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(SHEET_NAME);
      }
      let lastRow = sheet.getLastRow();
      if (lastRow === 0) {
        sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
        sheet.setFrozenRows(1);
        lastRow = 1;
      }

      let lastColumn = Math.max(sheet.getLastColumn(), HEADERS.length);
      let headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
      const columns = [
        { key: 'name', names: ['full name', 'name'], header: HEADERS[0] },
        { key: 'email', names: ['email address', 'email'], header: HEADERS[1] },
        { key: 'phone', names: ['phone number', 'phone'], header: HEADERS[2] },
        { key: 'education', names: ['education / current work', 'current education or work', 'education/current work'], header: HEADERS[3] },
        { key: 'hasLaptop', names: ['do you have a laptop?', 'laptop', 'has laptop', 'laptop available?'], header: HEADERS[4] },
        { key: 'motivation', names: ['why are you interested?', 'why are you interested in this course?', 'course motivation'], header: HEADERS[5] },
      ];
      const indexes = {};

      let headersChanged = false;
      columns.forEach(({ key, names, header }) => {
        let index = findColumn(headers, names);
        if (index < 0) {
          index = headers.length;
          headers.push(header);
          headersChanged = true;
        }
        indexes[key] = index;
      });

      lastColumn = headers.length;
      if (headersChanged) {
        sheet.getRange(1, 1, 1, lastColumn).setValues([headers]);
      }
      const row = new Array(lastColumn).fill('');
      columns.forEach(({ key }) => {
        row[indexes[key]] = safeCell(submission[key]);
      });

      if (row.length !== sheet.getLastColumn()) {
        throw new Error('The Student Interests sheet columns could not be prepared.');
      }

      // Write directly to the next known row so Apps Script doesn't need to
      // rescan the sheet as appendRow does. The success response is sent only
      // after this write completes.
      const nextRow = lastRow + 1;
      sheet.getRange(nextRow, 1, 1, lastColumn).setValues([row]);
    } finally {
      lock.releaseLock();
    }

    return response(nonce, true, 'Thanks! Your interest has been recorded. The course team will be in touch.');
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'We could not save your details. Please try again.';
    return response(nonce, false, message);
  }
}

function clean(value, limit) {
  return String(value || '').trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, limit);
}

function findColumn(headers, names) {
  return headers.findIndex((header) => names.includes(String(header).trim().toLowerCase()));
}

function safeCell(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function response(nonce, ok, message) {
  const payload = JSON.stringify({
    type: 'course-interest-result',
    nonce: /^[a-f0-9]{32}$/.test(nonce) ? nonce : '',
    ok,
    message,
  }).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput(
    // HtmlService wraps this page in three nested frames before reaching the
    // page that submitted the form. Send the result back to that page directly.
    '<!doctype html><html><body><script>window.parent.parent.parent.postMessage(' + payload + ',"*");</script></body></html>',
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
