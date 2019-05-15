function TableToJson(workbook) {
    var items = {};

    / Get worksheet /
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];

    for (var i = 9; i <= 200; i++) {
      if (!getCellVal(worksheet, 'S' + i)) {
        continue;
      }
      var item = {};
      item.LOG_NM = getCellVal(worksheet, 'D' + i);
      item.PHY_NM = getCellVal(worksheet, 'S' + i);
      item.TYPE = getCellVal(worksheet, 'AG' + i);
      item.DIGIT = getCellVal(worksheet, 'AN' + i);
      item.NULLABLE = getCellVal(worksheet, 'BP' + i) ? false : true;
      item.DEFAULT = getCellVal(worksheet, 'BU' + i) == 'SPACE' ? ' ' : getCellVal(worksheet, 'BU' + i);

      items[item.PHY_NM] = item;
    }
    return items;
  }

                  function getCellVal(worksheet, cell) {
                return worksheet[cell] ? worksheet[cell].v : null;
  }