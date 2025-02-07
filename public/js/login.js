/* eslint-disable */
const login = (email, password) => {
    console.log(email, password);
    axious({
        method: 'POST',
        url: 
    })
};

document.querySelector('.login-form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password)
})