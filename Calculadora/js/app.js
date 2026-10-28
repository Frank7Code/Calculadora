const expressionEl=document.querySelector("#expression");
const resultEl=document.querySelector("#result");
const messageEl=document.querySelector("#message");
const keys=document.querySelector(".keys");
let current="0",storedValue=null,pendingOperator=null,waitingForNext=false,expressionText="";

function formatNumber(value){
  if(!Number.isFinite(value))return "Erro";
  const rounded=Math.abs(value)<1e-10?0:Number(value.toPrecision(11));
  return new Intl.NumberFormat("pt-BR",{maximumFractionDigits:8}).format(rounded);
}
function render(){resultEl.textContent=current;expressionEl.textContent=expressionText}
function showMessage(text=""){messageEl.textContent=text}
function numericValue(text){return Number(text.replace(/\./g,"").replace(",", "."))}
function inputDigit(digit){
  showMessage();
  if(waitingForNext){current=digit==="."?"0,":digit;waitingForNext=false;expressionText="";render();return}
  if(digit==="."){if(current.includes(","))return;current+=","}
  else if(current==="0")current=digit;
  else if(current==="-0")current="-"+digit;
  else current+=digit;
  render();
}
function calculate(a,b,operator){
  switch(operator){
    case "+":return a+b;
    case "−":return a-b;
    case "×":return a*b;
    case "÷":if(b===0)throw Error("Não é possível dividir por zero.");return a/b;
    default:return b;
  }
}
function setFromNumber(value){current=formatNumber(value)}
function chooseOperator(operator){
  showMessage();const input=numericValue(current);
  if(pendingOperator&&!waitingForNext){
    try{const value=calculate(storedValue,input,pendingOperator);setFromNumber(value);storedValue=value}
    catch(error){showMessage(error.message);reset();return}
  }else storedValue=input;
  pendingOperator=operator;waitingForNext=true;expressionText=`${formatNumber(storedValue)} ${operator}`;render();
}
function equals(){
  showMessage();if(!pendingOperator||storedValue===null)return;
  const second=waitingForNext?storedValue:numericValue(current);
  const oldExpression=`${formatNumber(storedValue)} ${pendingOperator} ${formatNumber(second)} =`;
  try{setFromNumber(calculate(storedValue,second,pendingOperator));expressionText=oldExpression;storedValue=null;pendingOperator=null;waitingForNext=true}
  catch(error){showMessage(error.message);current="Erro";storedValue=null;pendingOperator=null;waitingForNext=true}
  render();
}
function reset(){current="0";storedValue=null;pendingOperator=null;waitingForNext=false;expressionText="";showMessage();render()}
function deleteLast(){
  showMessage();
  if(waitingForNext||current==="Erro"){current="0";waitingForNext=false;expressionText=""}
  else if(current.length<=1||(current.length===2&&current.startsWith("-")))current="0";
  else current=current.slice(0,-1);
  render();
}
function changeSign(){showMessage();if(current==="0"||current==="Erro")return;current=current.startsWith("-")?current.slice(1):"-"+current;render()}
function percent(){showMessage();setFromNumber(numericValue(current)/100);render()}
function handleValue(value){
  if(/^\d$/.test(value)||value===".")inputDigit(value);
  else if(["+","−","×","÷"].includes(value))chooseOperator(value);
  else if(value==="%")percent();
}
keys.addEventListener("click",event=>{
  const button=event.target.closest("button");if(!button)return;
  if(button.dataset.action==="clear")reset();
  else if(button.dataset.action==="delete")deleteLast();
  else if(button.dataset.action==="sign")changeSign();
  else if(button.dataset.action==="equals")equals();
  else if(button.dataset.value)handleValue(button.dataset.value);
});
document.addEventListener("keydown",event=>{
  const map={"*":"×","/":"÷","-":"−",",":".","Enter":"=","=":"=","Backspace":"BACKSPACE","Escape":"ESCAPE"};
  const key=map[event.key]||event.key;
  if(/^\d$/.test(key)||key===".")inputDigit(key);
  else if(["+","−","×","÷","%"].includes(key))handleValue(key);
  else if(key==="="){event.preventDefault();equals()}
  else if(key==="BACKSPACE")deleteLast();
  else if(key==="ESCAPE")reset();
  else return;
});
render();
