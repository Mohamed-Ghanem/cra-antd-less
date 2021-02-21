import axios from 'axios';

class Http {
  constructor() {
    const BASE_API_URL =
      process.env.REACT_APP_ENVIRONMENT === 'production'
        ? process.env.REACT_APP_BASE_API_URL
        : '';

    const initialClient = axios.create({
      baseURL: process.env.REACT_APP_BASE_API_URL || BASE_API_URL,
      timeout: 800000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    initialClient.interceptors.request.use(this.handleRequestHeader);

    initialClient.interceptors.response.use(
      this.handleSuccess,
      this.handleError,
    );

    this.client = initialClient;
  }

  handleRequestHeader = config => {
    const API_KEY = localStorage.getItem('token')
      ? localStorage.getItem('token')
      : '';

    if (API_KEY) {
      config.headers.Authorization = API_KEY;
    }
    return config;
  };

  handleSuccess = response => {
    return response.data;
  };

  handleError = error => {
    let errorTemp = null;

    if (error.response?.status === 404) {
      errorTemp = {
        status: error.status,
        message: 'Cannot find endpoint',
      };
    } else if (error.response) {
      // Request was made but server responded with something
      // other than 2xx
      errorTemp = {
        status: error.response.status,
        message: Array.isArray(error.response.data)
          ? getErrorsString(error.response.data)
          : error.response.data.error || error.response.data.message,
      };
    } else {
      // Something else happened while setting up the request
      // triggered the error
      errorTemp = {
        status: -1,
        message: error.message,
      };
    }

    return Promise.reject(errorTemp);
  };

  get = (url, payload, headers = null) => {
    return this.client.get(url, { params: payload, ...headers });
  };

  post = (url, payload, headers = null) => {
    return this.client.post(url, payload, { ...headers });
  };

  put = (url, payload) => {
    return this.client.put(url, { ...payload });
  };

  delete = (url, payload) => {
    return this.client.delete(url, { ...payload });
  };

  all = promises => {
    return executeAllPromises(promises);
  };

  // all = promises => {
  //   return Promise.all(promises);
  // };
}

const getErrorsString = errorArray => {
  return errorArray.reduce(
    (accumulator, currentValue) => accumulator + currentValue.message + '\n',
    '',
  );
};

const executeAllPromises = promises => {
  // Wrap all Promises in a Promise that will always "resolve"
  const resolvingPromises = promises.map(promise => {
    return new Promise(resolve => {
      // const payload = new Array(2);
      let payload = null;
      promise
        .then(result => {
          // payload[0] = result;
          payload = result;
        })
        .catch(error => {
          // payload[1] = error;
          payload = error;
        })
        .then(() => {
          /*
           * The wrapped Promise returns an array:
           * The first position in the array holds the result (if any)
           * The second position in the array holds the error (if any)
           */
          resolve(payload);
        });
    });
  });

  // const errors = [];
  // const results = [];

  // Execute all wrapped Promises
  return Promise.all(resolvingPromises);
  // .then(items => {
  //   items.forEach(payload => {
  //     if (payload[1]) {
  //       errors.push(payload[1]);
  //     } else {
  //       results.push(payload[0]);
  //     }
  //   });

  //   return {
  //     errors,
  //     results,
  //   };
  // });
};

export default new Http();
