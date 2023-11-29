import { derived, writable } from 'svelte/store';
import axios from "axios";
const url = "http://192.168.56.103"; // URL de l'API

export const products = createDynamicProducts(); // Export le catalogue

// Initialise le catalogue
function createDynamicProducts() {
	const { subscribe, set, update } = writable([]); // Initialise le catalogue

	dynamicCatalog().then((items) => { // Récupère les items
		console.log(items); // Affiche les items dans la console
		set(items); // Initialise le catalogue avec les items récupérés
	});

	return {
		subscribe,
		update,
		set,
		__addProduct: (product) =>
			update((oldProducts) => {
				var id_hash = crypto.randomUUID();
				if (!(product.category in oldProducts)) {
					oldProducts[product.category] = [];
				}
				oldProducts[product.category].push({ ...product, id: id_hash });
				return oldProducts; // Ajoute le produit au catalogue
			})
	};
}

// Set up the dynamic catalog
function dynamicCatalog() {
	return axios
		.get(`${url}/product/items/`) // Get the items
		.then((res) => {
			return res.data.items;
		})
		.catch((error) => {
			console.error(error);
		});
}

export const productsMerged = derived(products, ($products) => {
	return Object.values($products).flat();
});

