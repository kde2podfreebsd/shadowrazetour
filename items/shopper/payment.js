const form = document.forms[0];
const container = document.getElementById('container');
const loading = `
<div class="loading">
  <div class="lds-default">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
  <p class="loading__title">Ожидание оплаты</p>
  <a class="loading__url" id="loadingURL" target="_blank">Ссылка на оплату</a>
</div>
`;

const succes = `        
<div class="succes">
  <img src="../../src/img/icons/Done.svg" alt="" />
  <div class="succes__title">Оплата прошла успешно</div>
  <div class="succes__text">На вашу почту было отправлено уведомление, в ближейшее время с вами свяжется наш менеджер.</div>
</div>`;

const getPaymentData = async (data) => {
  const response = await axios.post(
    'https://shadowrzetour-ru.vercel.app/create_payment',
    data,
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

const getPaymentStatus = async (transaction_id) => {
  const response = await axios.post(
    'https://shadowrzetour-ru.vercel.app/transaction_status',
    {
      transaction_id: transaction_id,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );
  const status = response.data.paid_status;
  return status;
};

const renderLoader = () => {
  container.innerHTML = loading;
};

const renderSuccess = () => {
  container.style.maxWidth = '950px';
  container.innerHTML = succes;
};

const formHandler = (e) => {
  e.preventDefault();

  const data = {
    amount: '1700.00',
    description: "ШОППЕР 'T-SHADOW'",
    full_name: form.fullName.value,
    email: form.email.value,
    phone: form.tel.value,
    size: 'УНИВЕРСАЛЬНЫЙ',
    address: document.getElementById('adress').value,
  };
  renderLoader();

  makePayment(data);
};

form.addEventListener('submit', formHandler);

const updatePaidStatus = async (transaction_id) => {
  const response = await axios.post(
    'https://shadowrzetour-ru.vercel.app/update_paid_status',
    {
      transaction_id: transaction_id,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );
};

const sendEmail = async (transaction_id) => {
  const response = await axios.post(
    'https://shadowrzetour-ru.vercel.app/send_mail',
    {
      transaction_id: transaction_id,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );
};

const sendOrder = async (transaction_id) => {
  const response = await axios.post(
    'https://shadowrzetour-ru.vercel.app/send_order_tgbot',
    {
      transaction_id: transaction_id,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );
};

const makePayment = async (data) => {
  const paymentData = await getPaymentData(data);
  const url = paymentData.payment_url;
  document.getElementById('loadingURL').setAttribute('href', url);
  const transaction_id = paymentData.payment_id;
  window.open(url);
  const interval = setInterval(function () {
    getPaymentStatus(transaction_id).then((result) => {
      if (result === 'True') {

        updatePaidStatus(transaction_id);
        sendEmail(transaction_id);
        sendOrder(transaction_id);

        renderSuccess();

        clearInterval(interval);
      } else {
      }
    });
  }, 4000);
};
