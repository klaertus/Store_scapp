import { derived, writable } from 'svelte/store';

import axios from "axios";

const url = "http://192.168.1.36";



function createCart() {
	const { subscribe, set, update } = writable([]);

    
	return {
		subscribe,
		update,
        set,
        clean: () => {
            set([]); // Réinitialise le store à un tableau vide
        },
        updateRemote: (items) => {
            return new Promise((resolve, reject) => {
                axios.put(`${url}/cart/update/`, {items:items}, { params: { token: JSON.parse(window.localStorage.getItem('auth')).token } })
                .then((result) => {
                    resolve("Cart updated succesfully");
                })
                .catch((error) => {
                    console.error(error);
                    reject("Cant update the cart")
                    // Handle error, e.g., showing a toast notification
                });
            });
        },
        getCheckout: () => {
            return new Promise((resolve, reject) => {
                axios.get(`${url}/order/get/`, {params: { token: JSON.parse(window.localStorage.getItem('auth')).token} })
                .then((res) => {
					console.log(res.data.result)
					window.localStorage.setItem('checkout', JSON.stringify(res.data.result));
                })
                .catch((err) => {
                    console.error(err);
                });
            })
        },
        CreateCheckout: (checkout) => {
            return new Promise((resolve, reject) => {
                axios.put(`${url}/cart/update/`, {items:[]}, { params: { token: JSON.parse(window.localStorage.getItem('auth')).token } })
                .then((result) => {
                        axios.post(`${url}/order/create/`, {checkout:checkout}, {params: { token: JSON.parse(window.localStorage.getItem('auth')).token } })
                        .then((result) => {
                            resolve("Cart updated succesfully");
                            window.sessionStorage.removeItem('cart');
					        update((old) => []);
                        })
                        .catch((error) => {
                            console.error(error);
                            reject("Cant create checkout")
                            // Handle error, e.g., showing a toast notification
                        });
                })
                .catch((error) => {
                    console.error(error);
                    reject("Cant create checkout : update cart failed")
                    // Handle error, e.g., showing a toast notification
                });
            });
        }, 
        cleanRemote: (items) => {
            return new Promise((resolve, reject) => {
                axios.delete(`${url}/cart/remove/`, {items:items}, { params: { token: JSON.parse(window.localStorage.getItem('auth')).token } })
                .then((result) => {
                    resolve("Cart remove succesfully");
                })
                .catch((error) => {
                    console.error(error);
                    reject("Cant remove the item from the cart")
                    // Handle error, e.g., showing a toast notification
                });
            });
        },
        create: () => {
            return new Promise((resolve, reject) => {
                axios.post(`${url}/cart/create/`, null, { params: { token: JSON.parse(window.localStorage.getItem('auth')).token } })
                .then((result) => {
                    resolve("Cart created succesfully");
                })
                .catch((error) => {
                    console.error(error);
                    reject("Cant create a new cart")
                    // Handle error, e.g., showing a toast notification
                });
            });
        },
        loadCart: () => {
            return new Promise((resolve, reject) => {
                axios.get(`${url}/cart/get/`, {params: { token: JSON.parse(window.localStorage.getItem('auth')).token } })
                .then((res) => {
                    // Assuming res.data.result.items is the array of cart items
                    console.log(res.data.result.items)
                    set(res.data.result.items);
                })
                .catch((err) => {
                    console.error(err);
                    // Handle error, e.g., showing a toast notification
                });
            });
        },
		addToCart: (item) => {
            axios.put(`${url}/cart/add/`, {item:item}, { params: { token: JSON.parse(window.localStorage.getItem('auth')).token } })
            .catch((err) => {
                console.error(err);
                // Handle error, e.g., showing a toast notification
            });
			update((oldCart) => {
				const itemIndex = oldCart.findIndex((e) => e.id === item.id);
				if (itemIndex === -1) {
					return [...oldCart, item];
				} else {
					oldCart[itemIndex].quantity += item.quantity;
					return oldCart;
				}
			})
        }
	};  
}

export const cart = createCart();

export const totalQuantity = derived(cart, ($cart) =>
	$cart.reduce((acc, curr) => acc + curr.quantity, 0)
);

export const totalPrice = derived(cart, ($cart) =>
	$cart.reduce((acc, curr) => acc + curr.quantity * curr.price, 0)
);
