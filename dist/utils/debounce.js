export function debounce(cb, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => cb(...args), delay);
    };
}
//# sourceMappingURL=debounce.js.map