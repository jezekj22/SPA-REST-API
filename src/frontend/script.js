function ShowSection(id) {
    document.querySelectorAll('.section').forEach(el => {
        el.classList.remove('d-flex'); // Odebereme flexbox, aby se neprojevoval
        el.classList.add('d-none');    // Skryjeme všechny sekce
    });

    let activeSection = document.getElementById(id);
    activeSection.classList.remove('d-none'); // Zobrazíme požadovanou sekci
    activeSection.classList.add('d-flex'); // Přidáme flexbox zarovnání pro střed
}


function updateNav(prihlasen) {
    document.getElementById('navProfile').classList.toggle('d-none', !prihlasen);
    document.getElementById('navLogin').classList.toggle('d-none', prihlasen);
    document.getElementById('navRegister').classList.toggle('d-none', prihlasen);

    document.getElementById('navProfile').classList.toggle('d-inline', prihlasen);
    document.getElementById('navLogin').classList.toggle('d-inline', !prihlasen);
    document.getElementById('navRegister').classList.toggle('d-inline', !prihlasen);
}




function toggleAuthLinks() {
    const elements = {
        profile: document.getElementById('navProfile'),
        login: document.getElementById('navLogin'),
        register: document.getElementById('navRegister')
    };

    if (!elements.profile.classList.contains('d-none')) {
        elements.profile.classList.add('d-none');
        elements.login.classList.remove('d-none');
        elements.register.classList.remove('d-none');
    } else {
        elements.profile.classList.remove('d-none');
        elements.login.classList.add('d-none');
        elements.register.classList.add('d-none');
    }
}


document.getElementById('navProfile').addEventListener('click', function(){
    loadProfile();
    console.log("nacteni profilu");
});

document.getElementById('generate').addEventListener('click', function(e) {
    e.preventDefault();
    fetch('/random-quote', {
        method: 'GET',  
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('quoteText').innerText = data.quote; 
        document.getElementById('response').style.display = 'block';
    })
    .catch(error => {
        console.error('Chyba při načítání citátu:', error);
    });
});



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
        if (data.message) {
            document.getElementById('loginMessage').textContent = data.response;
            document.getElementById('saveQuote').style.display = 'block';
            updateNav(true);
            loadProfile(); // Načteme profil uživatele
            ShowSection('profile');
        } else {
            document.getElementById('loginMessage').textContent = data.error;
        }
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


document.getElementById('logout').addEventListener('click', function(e) {
    e.preventDefault();
    fetch('/api/logout', {
        method: 'GET',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            updateNav(false);
            ShowSection('generator');
            document.getElementById('saveQuote').style.display = 'none';
        } else {
            document.getElementById('logoutMessage').textContent = data.error;
        } 
    })
});

function loadProfile(){
    fetch('/api/profile', {
        method: 'GET',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.username) {
            document.getElementById('profileName').textContent = data.username;
            console.log("Profil");
            console.log(data.quotes);
            if (data.quotes.length > 0) {
                document.getElementById('favoriteQuotes').innerHTML = data.quotes
                    .map(quote => `<div class="card m-2 p-3" style="width: 18rem;"><p class="card-text">"${quote}"</p></div>`)
                    .join('');
            } else {
                document.getElementById('favoriteQuotes').innerHTML = '<p class="text-muted">Žádné oblíbené citáty</p>';
            }
        } else {
            document.getElementById('profileMessage').textContent = data.error;
        }
    })
    .catch(error => console.error('Chyba při načítání profilu:', error));
}





// reakce na kliknutí na elementy

document.getElementById('navProfile').addEventListener('click', function() {
    loadProfile();
    console.log("Profil");
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

document.getElementById('saveQuote').addEventListener('click', function() {
    const quote = document.getElementById('quoteText').innerText;
    fetch('/api/save-quote', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: quote })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            document.getElementById('saveQuoteMessage').textContent = data.message;
        } else {
            document.getElementById('saveQuoteMessage').textContent = data.error;
        }
    });
});



