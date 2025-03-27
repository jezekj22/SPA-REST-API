function ShowSection(id) {
    document.querySelectorAll('.section').forEach(el => {
        el.classList.remove('d-flex'); // Odebereme flexbox, aby se neprojevoval
        el.classList.add('d-none');    // Skryjeme všechny sekce
    });

    let activeSection = document.getElementById(id);
    activeSection.classList.remove('d-none'); // Zobrazíme požadovanou sekci
    activeSection.classList.add('d-flex'); // Přidáme flexbox zarovnání pro střed
}

function toggleAuthLinks() {
    const elements = {
        profile: document.getElementById('navProfile'),
        login: document.getElementById('navLogin'),
        register: document.getElementById('navRegister')
    };

    const showProfile = elements.profile.classList.toggle('d-none');
    elements.login.classList.toggle('d-none', showProfile);
    elements.register.classList.toggle('d-none', showProfile);
}






document.getElementById('prihlaseni').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('loginname').value;
    const passwd = document.getElementById('loginPassword').value;
    fetch('/api/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, passwd: passwd })
    })
    .then(response => response.json())
    .then(data => {
            toggleAuthLinks();
            ShowSection('profile');
    });
});

document.getElementById('registrace').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const passwd = document.getElementById('registerPassword').value;
    const checkpasswd = document.getElementById('registercheckPassword').value;
    fetch('/api/register', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, passwd: passwd, checkpasswd: checkpasswd })
    })
});







// reakce na kliknutí na elementy

document.getElementById('navProfile').addEventListener('click', function() {
    ShowSection('profile');
    
});

document.getElementById('navHome').addEventListener('click', function() {
    ShowSection('generator');
});

document.getElementById('navLogin').addEventListener('click', function() {
    ShowSection('login');
});

document.getElementById('navRegister').addEventListener('click', function() {
    ShowSection('register');
});