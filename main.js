import { useStyle } from './src/components/styles';
import { kebabCase, addPurchase } from './src/utils';
import { removeLoader, addLoader } from './src/components/loader';  

// Navigate to a specific URL
function navigateTo(url) {
  history.pushState(null, null, url);
  renderContent(url);
}
// HTML templates
function getHomePageTemplate() {
  return `
   <div id="content" >
      <img src="./src/assets/Endava.png" alt="summer">
      <div class="events flex items-center justify-center flex-wrap">
      </div>
    </div>
  `;
}

function getOrdersPageTemplate() {
  return `
    <div id="content">
    <h1 class="text-2xl mb-4 mt-8 text-center">Purchased Tickets</h1>
    </div>
  `;
}

function setupNavigationEvents() {
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const href = link.getAttribute('href');
      navigateTo(href);
    });
  });
}

function setupMobileMenuEvent() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

function setupPopstateEvent() {
  window.addEventListener('popstate', () => {
    const currentUrl = window.location.pathname;
    renderContent(currentUrl);
  });
}

function setupInitialPage() {
  const initialUrl = window.location.pathname;
  renderContent(initialUrl);
}

async function renderHomePage() {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getHomePageTemplate();

  addLoader();

  console.log('function', fetchTicketEvents());
  fetchTicketEvents()
    .then((data) => {
      //events = data;
      setTimeout(() => {
        removeLoader();
      }, 200);
    addEvents(data);
  });
}

function addImage(name){
  var imagesrc;
  if(name =="Untold"){
    imagesrc ="https://viacluj.tv/wp-content/uploads/2022/08/untold-3.jpg";
  }
  else
  if(name =="Electric Castle"){
    imagesrc ="https://image.stirileprotv.ro/media/images/original/Jul2023/62367524.jpg";
  }
  else
  if(name =="Meci de fotbal"){
    imagesrc ="https://i.eurosport.com/2022/10/19/3475646-70860088-2560-1440.jpg";
  }
  else
  if(name =="Wine Festival"){
    imagesrc ="https://zcj.ro/images/db/1_3_250125_1688475563_06498.jpg"; 
  }
  return imagesrc;
}

async function fetchTicketEvents(){
  const response = await fetch('http://localhost:8082/api/allEvents',{mode:'cors'});
  const data = await response.json();
  console.log(data);
  return data;
}

const addEvents = (events) =>{
  const eventDiv = document.querySelector('.events');
  eventDiv.innerHTML = "No ivents";
  if(events.length){
    eventDiv.innerHTML = "";
    events.forEach(event =>{
      eventDiv.appendChild(createEvent(event));
    });
  }
};

const createEvent = (eventData) =>{
  //const title = kebabCase(eventData.eventType.name);
  const title = kebabCase(eventData.name);
  const eventElement = createEventElement(eventData, title);
  return eventElement;
};

const createEventElement = (eventData, title) =>{
  const { id, description, name, ticketCategories} = eventData;
  const eventDiv = document.createElement('div');
  const evenWrapperClasses = useStyle('eventWrapper');
  const actionsWrapperClasses = useStyle('actionsWrapper');
  const quantityClasses = useStyle('quantity');
  const inputClasses = useStyle('input');
  const quantityActionClasses = useStyle('quantityActions');
  const increaseBtnClasses = useStyle('increaseBtn');
  const decreaseBtnClasses = useStyle('decreaseBtn');
  const addToCartBtnClasses = useStyle('addToCartBtn');

  eventDiv.classList.add(...evenWrapperClasses);
  
  var imageurl = addImage(name);

  const contentMarkup = `
    <header>
      <h2 class="event-title text-2xl font-bold text-center"> ${name}</h2>
    </header>
    <div class="content w-full">
      <img src="${imageurl}" alt="${name}" class="event-image w-full height-auto rounded object-cover"></img>
      <p class="description text-gray-700 text-center font-bold">${description}</p>
      <p class="location text-gray-700 text-center  ml-2">${eventData.venue.location}</p>
      <p class="data text-gray-700 text-center ml-2">${eventData.startDate.slice(0, 10)} - ${eventData.startDate.slice(0, 10)}</p>

    </div>
  `;

  eventDiv.innerHTML = contentMarkup;

  const actions = document.createElement('div');

   actions.classList.add(...actionsWrapperClasses);

  const categoriesOptions = ticketCategories.map(tc =>
    `<option value="${tc.id}">${tc.description} - ${tc.price} $</option>`
  );

  const ticketTypeMarkup =`
      <h2 class="text-lg font-bold mb-2">Choose Ticket Type:</h2>
      <select id="ticketType" name="ticketType" class="select ${title}-ticket-type border border">     
        ${categoriesOptions.join('\n')}
      </select>
    `;

  actions.innerHTML = ticketTypeMarkup;

  const quantity = document.createElement('div');
  quantity.classList.add(...quantityClasses);

  const input = document.createElement('input');
  input.classList.add(...inputClasses);
  input.type = 'number';
  input.min = '0';
  input.value = '0';

  input.addEventListener('blur', () => {
    if(!input.value) {
      input.value = 0;
    }
  });

  input.addEventListener('input', () => {
    const currentQuantity = parseInt(input.value);
    if(currentQuantity > 0) {
      addToCart.disabled = false;
    } else {
      addToCart.disabled = true;
    }
  });

  quantity.appendChild(input);

  const quantityActions = document.createElement('div');
  quantityActions.classList.add(...quantityActionClasses);

  const increase = document.createElement('button');
  increase.classList.add(...increaseBtnClasses);
  increase.innerText = '+';
  increase.addEventListener('click', () => {
    input.value = parseInt(input.value) + 1;
    const currentQuantity = parseInt(input.value);
    if(currentQuantity > 0) {
      addToCart.disabled = false;
    } else {
      addToCart.disabled = true;
    }
  });

  const decrease = document.createElement('button');
  decrease.classList.add(...decreaseBtnClasses);
  decrease.innerText = '-';
  decrease.addEventListener('click', () => {
    const currentValue = parseInt(input.value);
    if(currentValue > 0) {
      input.value = currentValue -1;
    }
    const currentQuantity = parseInt(input.value);
    if(currentQuantity > 0) {
      addToCart.disabled = false;
    } else {
      addToCart.disabled = true;
    }
  });

  quantityActions.appendChild(increase);
  quantityActions.appendChild(decrease);

  quantity.appendChild(quantityActions);
  actions.appendChild(quantity);
  eventDiv.appendChild(actions);

  const eventFooter = document.createElement('footer');
  const addToCart = document.createElement('button');
  addToCart.classList.add(...addToCartBtnClasses);
  addToCart.innerText = 'Add To Cart';
  addToCart.disabled = true;

  addToCart.addEventListener('click', () => {
    handledAddToCart(title, id, input, addToCart);

    addToCart.disabled = true;
    decrease.disabled = true;
    input.value = '0';
    document.querySelector('#ticketType').selectedIndex = 0;
  });

  eventFooter.appendChild(addToCart);
  eventDiv.appendChild(eventFooter);

  return eventDiv;
};

const handledAddToCart = (title, id, input, addToCart) => {
  const ticketType = document.querySelector(`.${kebabCase(title)}-ticket-type`).value;
  const quantity = input.value;
  if(parseInt(quantity)) {
    addLoader();
    fetch('http://localhost:8082/api/orders',  {
      mode:'cors',
      method:"POST",
      headers:{
        "Content-Type":"application/json",
      },
      body:JSON.stringify( {
        ticketCategoryId:+ticketType,
        eventID:+id,
        numberOfTickets:+quantity,
      })
  }).then((response) => {
    return response.json().then((data) => {
      if(!response.ok) {
        console.log("Something went wrong...");
      }
      return data;
    })
  }).then((data) => {
    addPurchase(data);
    console.log("Done!");
    input.value = 0;
    addToCart.disabled = true;
  })
  .finally(() => {
    setTimeout(() => {
      removeLoader();
    }, 200);
    
  })


  } else {
  //Not int. TO BE TREATED
  }
};

function renderOrdersPage(categories) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getOrdersPageTemplate();
}

// Render content based on URL
function renderContent(url) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = '';

  if (url === '/') {
    renderHomePage();
  } else if (url === '/orders') {
    renderOrdersPage()
  }
}

// Call the setup functions
setupNavigationEvents();
setupMobileMenuEvent();
setupPopstateEvent();
setupInitialPage();
