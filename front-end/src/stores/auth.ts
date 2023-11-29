import { writable } from 'svelte/store';
import { cart } from '@stores/cart';
import axios from 'axios';


const url = "http://192.168.1.36";


function createUserStore() {
    const { subscribe, set, update } = writable({ isLogged: false, isAdmin: false, token: null });

    return {
        subscribe,
        update,
        set,
        register: (username, password) => {
            return new Promise((resolve, reject) => {
                axios.post(`${url}/user/create/`, { username, password })
                .then((response) => {
                    // Assuming res.data.result.items is the array of cart items
                    const token = response.data.result;
                    axios.get(`${url}/user/level/`, { params: { token: token} })
                    .then((response) => {
                        window.localStorage.setItem('auth', JSON.stringify({isAdmin : response.data.result === 2, isLogged: true, token: token }));
                        set({isAdmin : response.data.result === 2, isLogged: true, token: token });
                        cart.create()
                        .then((responseCart) => {                            
                            resolve("success")
                        })
                        .catch((error) => {
                            console.error(error)
                            window.localStorage.setItem('auth', '');
                            set({isAdmin : false, isLogged: false, token: null });
                            reject('Cannot create a cart for the user')
                        })
                        
                    })
                    .catch((error) => {
                        console.error(error)
                        set({isAdmin : false, isLogged: false, token: null });
                        reject('Cannot check user autorizations')
                    });
                    
                })
                .catch((error) => {
                    console.error(error);
                    set({isAdmin : false, isLogged: false, token: null });
                    reject('Cannot register new user')
                });
            });
        },
        authenticate: (username, password) => {
            return new Promise((resolve, reject) => {
                axios.post(`${url}/user/authenticate/`, { username, password })
                .then((response) => {
                    // Assuming res.data.result.items is the array of cart items
                    const token = response.data.result;
                    axios.get(`${url}/user/level/`, { params: { token: token} })
                    .then((response) => {
                        window.localStorage.setItem('auth', JSON.stringify({isAdmin : response.data.result === 2, isLogged: true, token: token }));
                        cart.getCheckout();
                        set({isAdmin : response.data.result === 2, isLogged: true, token: token });
                        resolve("success")
                    })
                    .catch((error) => {
                        set({isAdmin : false, isLogged: false, token: null });
                        reject('Cannot check user authorizations')
                        console.error('Cant check user authorizations. Details : ', error);
                    });
                    
                })
                .catch((error) => {
                    console.error('Cannot authenticate user. Details : ', error);
                    reject('Cannot authenticate user')
                    set({isAdmin : false, isLogged: false, token: null });
                });
            });
        },
        logout: () => {
            window.localStorage.setItem('auth', '');
            set({ isLogged: false, isAdmin: false, token: null });
        },
        // Ajoutez d'autres méthodes au besoin
    };
}

export const user = createUserStore();