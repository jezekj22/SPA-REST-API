function ShowSection(id) {
    document.querySelectorAll('.section').forEach(el => {
        el.classList.remove('d-flex'); // Odebereme flexbox, aby se neprojevoval
        el.classList.add('d-none');    // Skryjeme všechny sekce
    });

    let activeSection = document.getElementById(id);
    activeSection.classList.remove('d-none'); // Zobrazíme požadovanou sekci
    activeSection.classList.add('d-flex'); // Přidáme flexbox zarovnání pro střed
}




document.getElementById('prihlaseni').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('loginname').value;
    const password = document.getElementById('loginPassword').value;
    fetch('/api/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, password: password })
    })
});