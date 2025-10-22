Google Sheets integration (Google Apps Script)

Goal
- Send contact form submissions from the static site to a Google Sheet.

Overview
- The client (browser) will POST JSON to a Google Apps Script web app URL. The Apps Script will append the data into a Google Sheet.
- You must deploy the Apps Script web app and set access to "Anyone, even anonymous" (or use appropriate OAuth/protection if required).

Steps to create the Apps Script web app
1. Create a new Google Sheet (e.g., "IPS Salon Contacts").
2. From the spreadsheet: Extensions -> Apps Script.
3. Replace the default Code.gs with the script below.

Apps Script (Code.gs)

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({success:false, error: 'Invalid JSON'})).setMimeType(ContentService.MimeType.JSON);
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Responses');
+  if (!sheet) {
+    sheet = ss.insertSheet('Responses');
+    sheet.appendRow(['Timestamp','Name','Phone','Service','Message']);
+  }
+
+  // Append row
+  sheet.appendRow([data.timestamp || new Date().toISOString(), data.name || '', data.phone || '', data.service || '', data.message || '']);
+
+  return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
}

4. Save the script.
5. Deploy -> New deployment -> Select "Web app".
   - For "Execute as" choose: "Me".
   - For "Who has access" choose: "Anyone" (or "Anyone with the link"; older UI: "Anyone, even anonymous").
6. Click Deploy and copy the Web app URL.

Client-side changes
- In `script.js`, replace the placeholder URL in `SHEET_ENDPOINT` with your deployed Apps Script URL.

Security notes
- Setting the web app to be accessible by anyone allows unauthenticated writes to your sheet. If you want authentication, consider:
  - Using an intermediate server with an API key / server-side security
  - Using Google OAuth (more complex) or restricting the Apps Script to authenticated users only

Troubleshooting
- If submissions fail with CORS or 403: check deployment access and that you used the correct web app URL. For CORS errors, Apps Script web apps generally allow cross-origin requests when deployed as "Anyone".
- Check the Apps Script "Executions" logs for details.

If you'd like, I can:
- Add client-side form validation before submit.
- Add a small success message element in the page instead of an alert.
- Create a serverless proxy or use Google Forms as an alternative (simpler to set up).