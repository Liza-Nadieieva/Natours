/* eslint-disable */
import axios from 'axios';

const login = async(email, password) => {
    console.log(email, password)
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/auth/login',
            data: {
                email,
                password
            }
        })
        console.log('dtata:', res.data)
    } catch(e){
        console.log(e.response.data)
    }
};

document.querySelector('.login-form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password)
});