import { useStyle } from './src/components/styles';
import { kebabCase, addPurchase } from './src/utils';
import { removeLoader, addLoader } from './src/components/loader';
import { createEventElement } from './src/components/createEvent';
import { createOrder } from './src/components/createOrder';


let events = null;

// Navigate to a specific URL
function navigateTo(url) {
  history.pushState(null, null, url);
  renderContent(url);
}
// HTML templates
// function getHomePageTemplate() {
//   return `
//    <div id="content" >
//       <img src="./src/assets/Endava.png" alt="summer">
//       <div class="events flex items-center justify-center flex-wrap">
//       </div>
//     </div>
//   `;
// }

function getHomePageTemplate() {
  return `
    <div id="content" class="hidden">
      <img src="./src/assets/Endava.png" alt="summer">
      <div class="flex flex-col items-center">
        <div class="w-80">
          <h1>Explore Events</h1>
          <div class="filters flex flex-col">
            <input type="text" id="filter-name" placeholder="Filter by name" class="px-4 mt-4 mb-4 py-2 border" />
            <button id="filter-button" class="filter-btn px-4 py-2 text-white rounded-lg">Filter</button>
          </div>
        </div>
      </div>
      <div class="events flex items-center justify-center flex-wrap">
      </div>
      <div class="cart"></div>
    </div>
    `;
}

function getOrdersPageTemplate() {
  return `
    <div id="content" class="hidden">
      <h1 class="text-2xl mb-4 mt-8 text-center">Purchased Tickets</h1>
      <div class="purchases ml-6 mr-6">
        <div class="bg-white px-4 py-3 gap-x-4 flex font-bold">
          <button class="flex flex-1 text-center justify-center" id="sorting-button-1">
            <span >Name</span>
            <i class="fa-solid fa-arrow-up-wide-short text-xl" id="sorting-icon-1"></i>
          </button>
          <span class="flex-1">Nr tickets</span>
          <span class="flex-1">Category</span>
          <span class="flex-1 hidden md:flex">Date</span>
          <button class="hidden md:flex text-center justify-center" id="sorting-button-2">
            <span>Price</span>
            <i class="fa-solid fa-arrow-up-wide-short text-xl" id="sorting-icon-2"></i>
          </button>
          <span class="w-28 sm:w-8"></span>
        </div>
        <div id="purchases-content"></div>
      </div>
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

  console.log('function', fetchEvents());
  fetchEvents()
    .then((data) => {
      events = data;
      setTimeout(() => {
        removeLoader();
      }, 200);
    addEvents(data);
  });
}

async function fetchEvents(){
  const response = await fetch('http://localhost:8082/api/allEvents',{mode:'cors'});
  const events = await response.json();
  return events;
}

async function fetchOrders(){
  const response = await fetch('http://localhost:8082/api/allOrders',{mode:'cors'});
  const orders = await response.json();
  return orders;
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
  const title = kebabCase(eventData.name);
  const eventElement = createEventElement(eventData, title);
  return eventElement;
};

function liveSearch() {
  const filterInput = document.querySelector('#filter-name');

  if(filterInput) {
    const searchValue = filterInput.value;

    if(searchValue !== undefined) {
      const filteredEvents = events.filter((event) =>
        event.name.toLowerCase().includes(searchValue.toLowerCase())
      );

      addEvents(filteredEvents);
    }
  }
}

function setupFilterEvents() {
  const nameFilterInput = document.querySelector('#filter-name');

  if(nameFilterInput) {
    const filterInterval = 500;
    nameFilterInput.addEventListener('keyup', () => {
      setTimeout(liveSearch, filterInterval);
    });
  }
}

function renderOrdersPage(categories) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getOrdersPageTemplate();
  const purchasesDiv = document.querySelector('.purchases');
  const purchasesContent = document.getElementById('purchases-content');
  addLoader();
  if(purchasesDiv) {
    fetchOrders().then((orders) => {
      if(orders.length) {
        //allOrders = [...orders];
        setTimeout(() => {
          removeLoader();
        },200);  
        orders.forEach((order) => {
          const newOrder = createOrder(categories, order);
          purchasesContent.appendChild(newOrder);
        });
        purchasesDiv.appendChild(purchasesContent);
      } else {
        removeLoader();
        //MessageChannel("No purchases");
      }
    })
   
  } 
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
setupFilterEvents();
