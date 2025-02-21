document.getElementById('generate').addEventListener('click', async () => {
    const response = await fetch('http://localhost:8080/random-quote');
    const data = await response.json();
    document.getElementById('quote').textContent = data.quote;
});
