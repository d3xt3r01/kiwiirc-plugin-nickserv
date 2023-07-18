let data = {
    LoginText: 'Login into an account',
    RegisterText : 'Register an account',
    RegButton: 'Register',
    IDText : 'The nick is registered, enter the password to login.',
    IDButton : 'Login',
    ConfirmReqText : 'Insert the code received on email to complete the registration.',
    ConfirmButton : 'Confirm Registration'
};

export function getString(key) {
    return data[key];
}
