int LDR_Pin = A0; //analog pin 0
int curr_value = 0;
int prev_value = 0;
const int delay_sec = 60*1000;

void setup(){
  Serial.begin(9600);
  
  prev_value = analogRead(LDR_Pin);
}

void loop(){
  curr_value = analogRead(LDR_Pin);
  
  Serial.println(curr_value);
  
  delay(delay_sec); //just here to slow down the output for easier reading
}

