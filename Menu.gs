function onOpen() {
    SpreadsheetApp.getUi()
      .createMenu('Funktionen')
      .addItem('learn', 'learn')
      .addItem('simulate move', 'simulate_move')
      .addToUi();
}
