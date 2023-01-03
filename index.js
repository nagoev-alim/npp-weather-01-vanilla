// ⚡️ Import Styles
import './style.scss';
import feather from 'feather-icons';
import axios from 'axios';
import { showNotification } from './modules/showNotification.js';

// ⚡️ Render Skeleton
document.querySelector('#app').innerHTML = `
<div class='app-container'>
  <div class='weather'>
    <h2 class='title'>Weather</h2>
    <header>
      <p>
        ${new Date().getDate()},
        ${new Date().toLocaleString('en-En', { month: 'short' })},
        ${new Date().getFullYear()}
      </p>
      <form data-form=''>
        <label>
          <span class='label'>Search for city</span>
          <input type='text' name='query' placeholder='Enter city name' />
        </label>
        <button type='submit'>Submit</button>
      </form>
    </header>
    <div class='detail' data-detail=''></div>
  </div>

  <a class='app-author' href='https://github.com/nagoev-alim' target='_blank'>${feather.icons.github.toSvg()}</a>
</div>
`;

// ⚡️Create Class
class App {
  constructor() {
    this.DOM = {
      detail: document.querySelector('[data-detail]'),
      form: document.querySelector('[data-form]'),
    };

    this.PROPS = {
      axios: axios.create({
        baseURL: 'https://api.weatherapi.com/v1/forecast.json?key=2260a9d16e4a45e1a44115831212511&q=',
      }),
    };

    this.storageGet();

    this.DOM.form.addEventListener('submit', this.onSubmit);
  }

  /**
   * @function storageGet - Get value from LocalStorage
   * @returns {Promise<void>}
   */
  storageGet = async () => {
    if (localStorage.getItem('city')) {
      try {
        this.DOM.form.querySelector('button').textContent = 'Loading...';
        const { data } = await this.PROPS.axios.get(`${localStorage.getItem('city')}&days=5&aqi=no&alerts=no`);
        this.DOM.form.querySelector('button').textContent = 'Submit';
        this.renderData(data);
      } catch (e) {
        showNotification('danger', `${JSON.parse(e.request.response).error.message}`);
        this.DOM.form.querySelector('button').textContent = 'Submit';
        this.DOM.form.reset();
        console.log(e);
      }
    }
  };

  /**
   * @function onSubmit - Form submit handler
   * @param event
   */
  onSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const city = Object.fromEntries(new FormData(form).entries()).query.trim().toLocaleLowerCase();

    if (city.length === 0) {
      showNotification('warning', 'Please fill the field.');
      return;
    }

    try {
      form.querySelector('button').textContent = 'Loading...';
      const { data } = await this.PROPS.axios.get(`${city}&days=5&aqi=no&alerts=no`);

      form.querySelector('button').textContent = 'Submit';
      this.renderData(data);
      localStorage.setItem('city', city);
    } catch (e) {
      showNotification('danger', `${JSON.parse(e.request.response).error.message}`);
      form.querySelector('button').textContent = 'Submit';
      form.reset();
      return;
    }

    form.reset();
  };

  /**
   * @function renderData - Render result HTML
   * @param data
   */
  renderData = (data) => {
    if (Object.keys(data).length === 0) return;

    const {
      current: { condition: { text, icon }, is_day, temp_c },
      forecast: { forecastday },
      location: { name, region, country },
    } = data;

    return this.DOM.detail.innerHTML = `
      <h3 class='h5'>
        <span>${name}</span> ${region}, ${country}
      </h3>
      <p class='type'>${text}</p>
      <img src='${icon}' alt='${text}'>
      <p class='h5'>${is_day ? 'Day' : 'Night'}</p>
      <p class='temp'><span>${temp_c}</span><sup>&deg</sup></p>
      <ul>
        ${forecastday.map(({ date, day: { mintemp_c, maxtemp_c } }) => `
          <li>
            <p>${date}</p>
            <div>
              <p><span>Min:</span>${mintemp_c}<sup>&deg</sup></p>
              <p><span>Max:</span>${maxtemp_c}<sup>&deg</sup></p>
            </div>
          </li>`).join('')}
      </ul>
    `;
  };
}

// ⚡️Class instance
new App();
