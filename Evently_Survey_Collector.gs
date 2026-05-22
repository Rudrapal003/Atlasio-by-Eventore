/**
 * Evently — Survey Response Collector (Google Apps Script)
 * ---------------------------------------------------------
 * This script turns a Google Sheet into the collection endpoint for the
 * Evently HTML surveys. Every submission becomes one row, which you can
 * download as a CSV anytime (File -> Download -> CSV).
 *
 * SETUP (one time, ~5 minutes) — full steps are in Evently_Survey_Setup_Guide:
 *  1. Create a new Google Sheet. Add two tabs named exactly:  customer   and   vendor
 *  2. Extensions -> Apps Script. Delete the sample code, paste THIS file in.
 *  3. Click Deploy -> New deployment -> type: Web app.
 *       Execute as: Me
 *       Who has access: Anyone
 *     Deploy, authorize, and COPY the Web app URL.
 *  4. Open each survey .html, find  const FORM_ENDPOINT = "";  near the top of
 *     the <script> block, and paste your URL between the quotes. Save.
 *  5. Submit a test response from each survey — a new row should appear.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheetName = (data.survey === 'vendor') ? 'vendor' : 'customer';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    var answers = data.answers || {};
    var keys = Object.keys(answers);

    // First write for this tab: lay down the header row.
    if (sheet.getLastRow() === 0) {
      var header = ['submitted_at'].concat(keys);
      sheet.appendRow(header);
      sheet.getRange(1, 1, 1, header.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Align this submission's values to the existing header order.
    var headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var row = headerRow.map(function (col) {
      if (col === 'submitted_at') return data.submitted_at || new Date().toISOString();
      return (answers[col] !== undefined) ? answers[col] : '';
    });

    // If a survey added new question ids not yet in the header, append them.
    keys.forEach(function (k) {
      if (headerRow.indexOf(k) === -1) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(k).setFontWeight('bold');
        row.push(answers[k]);
      }
    });

    sheet.appendRow(row);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Lets you confirm the web app is live by visiting the URL in a browser.
function doGet() {
  return ContentService
    .createTextOutput('Evently survey collector is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}
