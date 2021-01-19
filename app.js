'use strict';

// ****** SELECT ITEMS ******
const alerts = document.querySelector('.alert');
const form = document.querySelector('.grocery-form');
const grocery = document.getElementById('grocery');
const submitBtn = document.querySelector('.submit-btn');
const container = document.querySelector('.grocery-container');
const list = document.querySelector('.grocery-list');
const clearBtn = document.querySelector('.clear-btn');

// edit option
let editElement;
let editFlag = false; // 해당 값을 edit 할 것인지 하지 않을 것인지 결정하는 변수.
let editID = '';

// ****** EVENT LISTENERS ******
// 이 부분에서는 이벤트를 걸어 콜백함수를 호출만 함.
// submit form
form.addEventListener('submit', addItem); // 미리 정의한 함수명만 콜백함수로 호출할 때 (e) 이런식으로 파라미터를 전달하지 않아도 자동으로 전달됨. 
// clear items
clearBtn.addEventListener('click', clearItems);
// load items
window.addEventListener('DOMContentLoaded', setupItems);

// ****** FUNCTIONS ******
// 이 부분에서는 이벤트 리스너에서 호출할 콜백함수를 정의함.
function addItem(e){
  e.preventDefault();
  const value = grocery.value;

  // if(!value){
  //   console.log('value is falsy');
  // } 
  // 이거는 뭐냐면 js에서는 0, -0, '', null, undefined, NaN 등의 값이 조건문에 들어가면 
  // false 로 간주한다는 거를 보여주는 거. ellie 개념편에서 배웠음.
  // 그래서 이걸 이용해서 value !== '' 이 조건문은 value 이렇게만 써도 동일한 경과를 얻을 수 있음.
  // value의 값이 없다면 자동으로 false, 있다면 true로 인식할 테니까.
  // 또 editFlag === false 도 그냥 !editFlag 로 쉽게 작성할 수 있지? 'editFlag가 true가 아닌 것' 이 맞다면~ 이라는 뜻이니까. 

  const id = new Date().getTime().toString(); 
  // 특정 value를 input으로 입력받았을 때의 경과시간은 입력받는 순간마다 다르니까 unique number 라고 할 수 있지. 
  // 그래서 이 getTime() 값을 string으로 만들어서 고유한 id값으로 활용하려는 거 같음. 

  if (value && !editFlag) { // 입력받은 값이 존재하고, 해당 값을 edit 하지 않은 경우 -> 즉 입력받은 값을 그대로 리스트에 추가하려고 할 때!
    createListItem(id, value);

    // display alert
    displayAlert('item added to the list', 'success');

    // show container -> .grocery-container의 visibility: hidden 이었던 거 기억하지? 아이템이 성공적으로 추가되면 이걸 visible로 바꿔줄거임.
    container.classList.add('show-container');

    // add to local storage -> 입력받은 데이터를 로컬 저장소에도 보관해놓으려는 건가..?
    addToLocalStorage(id, value);

    // set back to default 
    setBackToDefault();
  }
  else if(value && editFlag) { // 입력받은 값이 존재하나, 해당 값을 edit 할 경우 -> 즉, 입력받은 값을 수정하고 싶을 때. edit 버튼을 누를때만 true가 되게 할거임.
    // editItem()에서와 완전 반대. 이제는 input에서 입력받은 value(수정한 아이템)를 editElement 즉, p태그에 다시 넣으라는 뜻이지.
    editElement.innerHTML = value; 
    displayAlert('value changed', 'success');

    // edit local storage -> 로컬 저장소에도 수정된 값으로 바꿔야겠지
    editLocalStorage(editID, value); // edit하고자 하는 아이템의 id값을 이용해 로컬의 list에서 해당 아이템을 찾아 사용자가 수정한 새로운 value를 넣으려는 거임.

    setBackToDefault(); // 마찬가지로 edit option들을 원 상태 즉, submit 할 수 있는 상태로 되돌리려는 거지
  }
  else { // 입력받은 값이 비어있는 경우
    displayAlert('please enter value', 'danger');
  }
}

// display alert
// 코드 여기저기서 alert 기능을 반복 사용할 것이기 때문에 재사용성을 위해 하나의 함수로 정의해 놓은 것.
function displayAlert(text, action){
  alerts.textContent = text;
  alerts.classList.add(`alert-${action}`);

  // remove alert
  // setTimeout() 타이머가 만료된 뒤 함수나 지정된 코드를 실행하는 타이머를 설정합니다.
  // 2개의 파라미터를 받음. 1. 타이머가 만료된 뒤 실행할 콜백함수 2. 함수를 실행하기 전 기다려야 할 ms단위의 시간
  setTimeout(function(){
    alerts.textContent = '';
    alerts.classList.remove(`alert-${action}`);
  }, 1000);
}

// clear items
function clearItems(){
  const items = document.querySelectorAll('.grocery-item'); // if 블록에서 동적으로 생성한 article 태그들을 모두 가져와서 없애려는 거

  if (items.length > 0) { // 즉, 동적으로 추가한 article이 1개라도 있다면~
    items.forEach(function(item){
      list.removeChild(item); // Node.removeChild(childNode) method removes a child node from the DOM and returns the removed node.
    });

    // 근데 clear-btn이 안 없어짐. 얘는 .grocery-list의 자식노드가 아니니까. 얘도 사라지게 하고 싶음.
    container.classList.remove('show-container'); // 그래서 .grocery-container visibility: hidden으로 해버려서 자식 노드인 clear-btn도 안보이게 한 것.
  
    // display alert
    displayAlert('empty list', 'danger');

    // clear items 하기 전에 edit 하는 등의 경우 edit option이 남아있을 수 있음. 이거를 전체 삭제하고 나서 원상복귀 하려는 것.
    setBackToDefault();

    // 삭제한 아이템들은 로컬 저장소에서도 지우려는 거
    // 그러려면 로컬에 저장된 list라는 키의 배열들을 전부 지우기로 함.
    // 이렇게 해서 굳이 개발자도구를 통하지 않더라도 로컬의 데이터들을 모두 지워서 처음 상태로 갱신할 수 있음.
    localStorage.removeItem('list');
  }
}

// delete function
function deleteItem(e){
  //currentTarget을 사용하는 이유는 target은 클릭한 요소 즉, 버튼안에 아이콘이 선택될수도 있으니까. 
  // 순전히 이벤트가 걸린 버튼을 선택하려는 것.
  const element = e.currentTarget.parentElement.parentElement; // 버튼의 부모의 부모 즉, 동적으로 생성된 article 태그를 의미!
  const id = element.dataset.id;
  list.removeChild(element); // list의 자식노드들 중 element를 지우라는 거

  // 남아있는 아이템이 있다면 상관없지만, 이거로 모든 아이템이 지워졌다면 container(정확히는 그 안의 clear-btn)를 안보이게 하고 싶은거임.
  if (list.children.length === 0) { // ParentNode.children은 호출된 요소의 모든 자식 노드의 elements를 담고있는 실시간 HTMLCollection을 반환합니다.
    container.classList.remove('show-container');
  }
  displayAlert('item removed', 'danger');
  setBackToDefault(); // 마찬가지로 혹시라도 남아있을 수 있는 edit option들을 전부 지워주는 것.
  
  // remove from local storage
  removeFromLocalStorage(id);
}

// edit function
function editItem(e){
  const element = e.currentTarget.parentElement.parentElement; 

  // set edit item
  // NonDocumentTypeChildNode.previousElementSibling 는 해당 노드의 부모노드의 자식리스트 중에서 해당 노드 이전에 있는 요소를 반환함.
  // 한마디로 해당 노드 앞에있는 형제 노드를 반환함. 그니까 p태그 말하는 거겠지?
  editElement = e.currentTarget.parentElement.previousElementSibling; 

  // set form value
  // 즉, edit하려고 선택한 item의 현재 text를 input창에 띄우라는 것.
  grocery.value = editElement.innerHTML; 
  editFlag = true; // 이제 else if 블록을 실행할 수 있게 해준다는 것.
  editID = element.dataset.id; // 수정하고자 하는 아이템의 id값을 할당함
  submitBtn.textContent = 'edit'; // submit버튼을 edit버튼으로 바꾼거
}

// set back to default -> value를 추가하고 나서도 input 창에 입력한 텍스트가 남아있음. 이걸 지우려고 만든 함수.
function setBackToDefault(){
  grocery.value = '';

  // 내 생각에는 여기서부터는 edit하는 시나리오에서 edit을 할 수 있도록 맞추어진 것들을 다시 아이템 추가할 수 있는 상태로 맞추는 작업인 듯.
  editFlag = false; 
  editID = '';
  submitBtn.textContent = 'submit';
}

// ****** LOCAL STORAGE ******
function addToLocalStorage(id, value){
  const grocery = {
    id,
    value 
    // ES6에서는 이렇게 key와 parameter 이름이 같으면 그냥 {id, value} 이런식으로 하나로 퉁쳐서 써줘도 됨.
  };

  // 만약 list라는 이름의 배열이 있다면 가져오고, 없다면 새로운 빈 배열을 하나 만들어서 items에 할당하라는 거. 
  let items = getLocalStorage();

  // 어쨋든 item에는 빈 배열이든, 기존에 있던 list 배열이든, 리턴받은 배열이 들어가있는 상태인데, 
  // 거기에 새로 입력받은 아이템을 object로 저장한 형태인 grocery를 추가하라는 뜻이지.
  items.push(grocery);

  // 어쨋든 loalStorage에는 빈 배열이 있거나 가장 최근에 저장된 list 배열이 있는 상태인데,
  // 그걸 가져와서 .push(grocery) 해서 새로 입력받은 아이템에 대한 object가 추가로 갱신된 list를
  // 다시 localStorage에 override 하려는 거
  localStorage.setItem('list', JSON.stringify(items));

  // console.log('added to local storage');
}

function removeFromLocalStorage(id){
  let items = getLocalStorage();

  // 로컬 저장소에 저장된 데이터는 브라우저를 새로고침하거나 종료해도 삭제되지 않기 때문에 이전에 저장한 데이터가 다 남아있음.
  // 근데 개발자도구 Application 탭에서 확인해보면 로컬에 저장된 데이터를 모두 지울 수 있는 'Clear all' 버튼이 있긴 함. 
  // 어쨋든 remove하려면 기존의 list가 있어야 remove를 할 수 있잖아>
  // 이 리스트를 가져와서 id값이 겹치는 아이, 즉, 내가 지우고자 하는 아이템의 id값과 같은 애들은 '빼고'
  // list들을 다시 filter해서 반환해 주는거지. 즉, 지우려는 item만 빼고 새로운 리스트를 만든 것.
  items = items.filter(function(item){
    if (item.id !== id) {
      return item;
    }
  });

  // 그리고 지우려는 item만 뺀 list를 다시 local storage에 override하는 거임.
  localStorage.setItem('list', JSON.stringify(items));
}

function editLocalStorage(id, value){
  let items = getLocalStorage();

  // 그니까 여기서는 edit하고자 하는 아이템의 id와 동일한 녀석이라면, 그 녀석의 value에는 사용자가 새롭게 수정한 value를 넣어주라는 뜻.
  // 그렇게 edit하고자 하는 아이템과 동일한 녀석만 수정하고, 그렇지 않은 녀석은 list에 원래 있던 item을 리턴해서 새로운 배열을 만들어 return 해주는거 
  items = items.map(function(item){
    if (item.id === id) {
      item.value = value;
    }
    return item;
  });

  // 위에서 새롭게 반환받은 list를 다시 local에 override하는 거지?
  localStorage.setItem('list', JSON.stringify(items));
}

// 즉, list라는 key값의 배열을 가져오는 거를 자주 사용할거 같으니 따로 함수로 만든거임.
function getLocalStorage(){
  return localStorage.getItem('list') ? JSON.parse(localStorage.getItem('list')) : [];
}

// localStorage API
// setItem
// getItem
// removeItem
// save as strings
// localStorage는 오로지 문자열로만 저장할 수 있기 때문에, 배열이나 오브젝트형 데이터를 저장하면 그냥 [object Object] 이딴 식으로 저장되어 버림.
// 그래서 이걸 해결하기 위해 value는 JSON.stringfy(배열이나 오브젝트형 데이터) 로 저장한 뒤
// JSON.parse(localStorage.getItem('key')) 이걸로 가져오는 방식으로 
// 온전하게 배열이나 오브젝트형 데이터를 저장하고 가져올 수 있음.
// 그니까 꼭 배열이나 오브젝트형 데이터가 아니더라도, 문자열이 아닌 데이터들을 온전하게 로컬저장소에서 저장하고 가져오고 하고 싶다면
// JSON.stringfy, JSON.parse를 이용하면 되겠지?
// localStorage.setItem('orange', JSON.stringify(['item', 'item2']));
// const oranges = JSON.parse(localStorage.getItem('orange'));
// console.log(oranges);
// localStorage.removeItem('orange');

// ****** SETUP ITEMS ******
// 이건 뭐냐면, 브라우저를 새로 로드했을 때, 로컬에 저장되어있는 list, 즉 이전에 내가 추가해놨던 리스트들이
// HTML 화면에도 로컬에 저장된 그대로, 내가 예전에 추가해놨던 그대로 보여질 수 있게 만든 함수인 거지.
// 그니까 윈도우에 이벤트를 걸어서 해당 HTML 문서가 로드될 때 해당 함수를 콜백함수로 실행할 수 있도록 하는거지. 
function setupItems(){
  let items = getLocalStorage();

  if (items.length > 0) { // 즉, 로컬 저장소에 남아있는 list가 있다면~ 이라는 뜻이겠지
    items.forEach(function(item){
      createListItem(item.id, item.value);
    });
    container.classList.add('show-container');
  }
}

// if 블록에서 정의한 article을 동적으로 추가해주는 기능들을 함수로 따로 만든거임.
// 왜냐면 이걸 setupItems에도 재사용해야 하니까. 기존의 로컬 저장소에 안지워지고 보존된 list들을
// 다시 처음 윈도우창을 로드할 때 html로 화면에 뿌려줘야 되니까.
function createListItem(id, value){
  // 입력받은 값으로 새로운 article을 동적으로 만들어 보자
  const element = document.createElement('article'); // Document.createElement() 메서드는 지정한 tagName의 HTML 요소를 만들어 반환합니다.
    
  // add class
  element.classList.add('grocery-item');
  
  // add id
  // dataset 속성을 만들어서 거기에 getTime()으로 만든 고유의 값을 id로 할당하려는 거임.
  const attr = document.createAttribute('data-id');
  attr.value = id;
  element.setAttributeNode(attr); // setAttributeNode() method adds a new Attr node to the specified element.
  element.innerHTML = ` 
  <p class="title">${value}</p>
  <div class="btn-container">
    <button type="button" class="edit-btn">
      <i class="fas fa-edit"></i>
    </button>
    <button type="button" class="delete-btn">
      <i class="fas fa-trash"></i>
    </button>
  </div>
  `; // innerHTML에는 article 요소를 제외하고, 그 안에만 있는 것들을 HTMLString들을 넣어줘야 함. article은 이미 이 블록안에서 동적으로 만들어졌으니까.
  
  // edit-btn, delete-btn 둘 다 동적으로 생성되는 요소이므로, 이것들이 동적으로 생성되는 블록에서만 해당 버튼에 접근하거나 이벤트를 걸 수 있음.
  // 또는 부모 태그인 .grocery-list에 이벤트를 걸어놓고 이벤트 버블링을 활용해 부모 태그 안에 동적으로 생성된 버튼들에 대해 e.target으로도 접근할 수 있음. 
  // 여기서는 전자의 방법을 사용할 것임.
  // Element.querySelector() returns the first element that is a descendant of the element on which it is invoked that matches the specified group of selectors.
  // document.querySelector()는 현재 DOM 구조에서 선택하는거라서 가져올 수 없고, 
  // element 즉, 동적으로 생성된 article이 여기 담겨있지? 이 안에 있는 btn 들을 선택한다는 뜻이여! 그니까 article.querySelector('.~-btn') 이랑 똑같은겨!
  const deleteBtn = element.querySelector('.delete-btn');
  const editBtn = element.querySelector('.edit-btn');
  deleteBtn.addEventListener('click', deleteItem);
  editBtn.addEventListener('click', editItem);

  // append child -> 새로운 article을 만들기는 했는데, 만들어만 진거죠. 이거를 .grocery-list 컨테이너의 자식노드로 넣어줘야 우리가 처음에 만들었던 html 문서 흐름에 맞는거고, 리스트에 보일거니까.
  list.appendChild(element); 
  // Node.appendChild() 메소드는 한 노드를 특정 부모 노드의 자식 노드 리스트 중 마지막 자식으로 붙입니다.
  // ParentNode.append() 와 차이점 MDN 참고.
}