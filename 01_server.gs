function doGet(e) {
  const mode = e.parameter.mode;
  if (mode === 'products') {
    return handleGetProducts();
  } else if (mode === 'receipt') {
    return HtmlService.createTemplateFromFile('receipt').evaluate();
  }
  return HtmlService.createTemplateFromFile('index').evaluate();
}

function handleGetProducts() {
  const ss = SpreadsheetApp.openById('1w5c355oPxWZSb8XVJehqSQG0nEOhBOBsCEDCOY7brm4');
  const sheet = ss.getSheetByName('data');
  const values = sheet.getDataRange().getValues();
  
  const data = values.slice(1).map(row => {
    const productKeigen = row[3];
    // productKeigenが"1"なら軽減税率対象とする例
    const reducedTax = (productKeigen === '●');

    return {
      productId: row[0],
      productOrigin: row[1],
      productName: row[2],
      productStatus: row[4],
      productKeigen: productKeigen,
      productWeight: row[5],
      productStocks: row[6],
      productOption: row[7],
      productPriceWithoutTax: row[8],
      productPriceWithTax: row[9],
      reducedTax: reducedTax // ここでreducedTaxフィールドを追加
    };
  });

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', data }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 送信ボタンクリック時に呼び出す関数
function writeToSheet(records) {
  const ss = SpreadsheetApp.openById('1h6f_LxWY2pt2b9lImFa52-QYBom9aKmhm4BlkMe5Vzo');
  const sheet = ss.getSheetByName('data');

  const rows = records.map(r => [
    r.dateTime,
    r.productId,
    r.productName,
    r.reducedTax,
    r.qty,
    r.unitPrice,
    r.subtotal,
    r.tax,
    r.total,
    r.paymentMethod,
    r.operatorId,
    r.userAttrs
  ]);

  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow()+1, 1, rows.length, rows[0].length).setValues(rows);
  }
  return {status:'ok'};
}
