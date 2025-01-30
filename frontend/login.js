document.addEventListener('DOMContentLoaded', () => {
    let currentLang = localStorage.getItem('language') || 'cz'; 

    setLanguage(currentLang);

    document.getElementById('login-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        const name = document.getElementById('fname').value.trim();
        const password = document.getElementById('pw').value.trim();

        const backendUrl = `${window.location.protocol}//${window.location.hostname}:8001/login`;

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, password: password })
        });

        if (response.ok) {
            const result = await response.json();
            sessionStorage.setItem('username', name);
            sessionStorage.setItem('user_id', result.user_id);
            window.location.href = 'index.html';
        } else {
            const errorResult = await response.json();
        }
    });

    function setLanguage(lang) {
        document.title = getTranslation('pageTitle', lang);
        document.getElementById('title').textContent = getTranslation('loginTitle', lang);
        document.getElementById('fname').setAttribute('placeholder', getTranslation('namePlaceholder', lang));
        document.getElementById('pw').setAttribute('placeholder', getTranslation('passwordPlaceholder', lang));
        document.getElementById('submit-btn').textContent = getTranslation('confirmButton', lang);
        document.getElementById('banner-title').textContent = getTranslation('catalogTitle', lang);
        document.getElementById('register').innerHTML = getTranslation('registerLink', lang);
    }

    function getTranslation(key, lang) {
        const translations = {
            en: {
                pageTitle: "Login",
                loginTitle: "Login",
                namePlaceholder: "Name",
                passwordPlaceholder: "Password",
                confirmButton: "Confirm",
                loginSuccess: "Login successful!",
                loginError: "Error: ",
                registerLink: 'Not registered? <a href="register.html">Click here to register!</a>',
                catalogTitle: "BookStock"
            },
            cz: {
                pageTitle: "Přihlášení",
                loginTitle: "Přihlášení",
                namePlaceholder: "Jméno",
                passwordPlaceholder: "Heslo",
                confirmButton: "Potvrdit",
                loginSuccess: "Přihlášení úspěšné!",
                loginError: "Chyba: ",
                registerLink: 'Ještě nejste registrováni? <a href="register.html">Klikněte zde pro registraci!</a>',
                catalogTitle: "BookStock"
            }
        };

        return translations[lang][key];
    }
});
