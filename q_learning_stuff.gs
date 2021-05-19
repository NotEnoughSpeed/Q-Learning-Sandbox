function get_reward(field, x, y, action){
  var x_new = x;
  var y_new = y;
  if(action == 0){
    y_new = y + 1; // nach unten
  }else if(action == 1){
    x_new = x + 1; // nach rechts
  }else if(action == 2){
    y_new = y - 1; // nach oben
  }else if(action == 3){
    x_new = x - 1; // nach links
  }
  
  if(field[x_new][y_new] == 0) return [-1, x_new, y_new];
  if(field[x_new][y_new] == 1) return [-20, x, y];
  if(field[x_new][y_new] == 2) return [300, x_new, y_new];
}

function get_field(){
  var field_Sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('map')
  var field = field_Sheet.getRange(1,1,field_Sheet.getLastRow(), field_Sheet.getLastColumn()).getValues();
  
  return field;
}

function get_state(field, x, y){
  // unten, rechts, oben, links
  state = field[x][y + 1] * Math.pow(3,0) + field[x + 1][y + 1] * Math.pow(3,1) + field[x + 1][y] * Math.pow(3,2) + field[x + 1][y - 1] * Math.pow(3,3) + field[x][y - 1] * Math.pow(3,4) + field[x - 1][y - 1] * Math.pow(3,5) + field[x - 1][y] * Math.pow(3,6) + field[x - 1][y + 1] * Math.pow(3,7);
  return state;
}

function max_expected_reward_function(array){
  var max = array[0];
  for(var index = 1; index < array.length; index++){
    if(array[index] > max) max = array[index];
  }
  return max;
}

function weighted_best_action(array){
  var min = 0;
  for(var index = 1; index < array.length; index++){
    if(array[index] < min) min = array[index];
  }
  var sum = 0;
  for(var index = 1; index < array.length; index++){
    array[index] -= min;
    sum += array[index];
  }
}


function learn(){
  // 3 Arten von Feldern in 8 Richtungen
  var statespacesize = 3*3*3*3*3*3*3*3;
  // 4 Richtungen
  var actionspacesize = 4;
  
  var q_Sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Q');
  var q = q_Sheet.getRange(1,1,q_Sheet.getLastRow(), q_Sheet.getLastColumn()).getValues();
  
  
  var setup_Sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('setup');
  var setup = setup_Sheet.getRange(1,1,setup_Sheet.getLastRow(), setup_Sheet.getLastColumn()).getValues();
  
  var max_attempts = setup[1][1];
  var alpha = setup[2][1];
  var gamma = setup[3][1];
  var epsilon = setup[4][1];
  var reset = setup[5][1];
  
  if(reset == true){
    q = [];
    for(var row = 0; row < statespacesize; row++){
      var row_of_zeros = [];
      for(var col = 0; col < actionspacesize; col++){
        row_of_zeros.push(0);
      }
      q.push(row_of_zeros);
    }
  }
  
  var field = get_field();
  var position = find_x(field);
  var start_position_x = position[0];
  var position_x = position[0];
  var start_position_y = position[1];
  var position_y = position[1];
  field[position_x][position_y] = 0;
  
  var attempts = 0;
  var wins = 0;
  var turns = 0;
  while(attempts < max_attempts){
    turns++;
    // state bestimmen für die aktuelle position
    var state = get_state(field, position_x, position_y);
    
    // wahl zwischen exploration <-> exploitation
    var rand_num = Math.random();
    if (epsilon > rand_num){
      var action = Math.floor(Math.random()*4);
    } else {
      // wählt aktion mit höchstem erwarteten reward
      var action = indexOfMax(q[state]);
    }
    
    var reward_return = get_reward(field, position_x, position_y, action);
    var reward = reward_return[0];
    position_x = reward_return[1];
    position_y = reward_return[2];
    
    var state_new = get_state(field, position_x, position_y);
    var max_expected_reward = max_expected_reward_function(q[state_new]);
    q[state][action] = (1 - alpha) * q[state][action] + alpha * (reward + gamma * max_expected_reward);
    
    if(reward == 300){
      attempts = attempts + 1;
      position_x = start_position_x;
      position_y = start_position_y;
      wins = wins + 1;
    } else {
      attempts = attempts + 0.1;
    }
  }
  //print('wins')
  //print(wins)
  
  q_Sheet.getRange(1,1,q.length, q[0].length).setValues(q);
  SpreadsheetApp.getUi().alert('average turns per win: ' + (turns / wins));
}