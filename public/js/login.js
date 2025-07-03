/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfuly');

      window.setTimeout(() => {
        // in order to load another page
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message); //if problem happened like refuse... go to in app.js helmet
  }

  //   when ever error happen axios throw error
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout'
    });

    if (res.data.status === 'success') location.reload(true); //set true force reload from server not from browser catch
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};
