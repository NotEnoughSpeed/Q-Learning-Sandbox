function get_simluation_field(){
  var field_Sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('map_simulation')
  var field = field_Sheet.getRange(1,1,field_Sheet.getLastRow(), field_Sheet.getLastColumn()).getValues();
  
  return field;
}


function set_simluation_field(field){
  var field_Sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('map_simulation')
  field_Sheet.getRange(1,1,field.length, field[0].length).setValues(field);
}


function find_x(field){
  for(var row = 0; row < field.length; row++){
    for(var col = 0; col < field[row].length; col++){
      if(field[row][col] == 'x') return [row, col];
    }
  }
  return [1,1];
}


function simulate_move() {
  
  var q_Sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Q')
  var q = q_Sheet.getRange(1,1,q_Sheet.getLastRow(), q_Sheet.getLastColumn()).getValues();
  
  var setup_Sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('setup');
  var setup = setup_Sheet.getRange(1,1,setup_Sheet.getLastRow(), setup_Sheet.getLastColumn()).getValues();
  var epsilon = setup[6][1];
  
  var field = get_simluation_field();
  
  var position = find_x(field);
  var position_x = position[0];
  var position_y = position[1];
  
  var reward = 0;
  var turn = 0;
  
  // state bestimmen für die aktuelle position
  var state = get_state(field, position_x, position_y);
  
  // wählt aktion mit höchstem erwarteten reward
  var rand_num = Math.random();
  if (epsilon > rand_num){
    var action = Math.floor(Math.random()*4);
  } else {
    // wählt aktion mit höchstem erwarteten reward
    var action = indexOfMax(q[state]);
  }
  Logger.log('action: ' + action);
  
  var reward_return = get_reward(field, position_x, position_y, action);
  field[position_x][position_y] = 0;
  var reward = reward_return[0];
  position_x = reward_return[1];
  position_y = reward_return[2];
  Logger.log('x: ' + position_x);
  Logger.log('y: ' + position_y);
  
  field[position_x][position_y] = 'x';
  set_simluation_field(field);
}
