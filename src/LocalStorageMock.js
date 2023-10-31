export const localStorageMock = (function () {
    let store = {};

    return {
        getItem(key) {
            return store[key];
        },

        setItem(key, value) {
            if (key === 'simStorage' && value === undefined) {
                monyo()
            }
            store[key] = value;
        },

        clear() {
            miniyo()
            store = {};
        },

        removeItem(key) {
            delete store[key];
        },

        getAll() {
            return store;
        },
    };
})();
