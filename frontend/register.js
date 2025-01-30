document.addEventListener('DOMContentLoaded', () => {
    let currentLang = localStorage.getItem('language') || 'cz'; 

    setLanguage(currentLang);

    document.getElementById('register-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        const name = document.getElementById('fname').value.trim();
        const password = document.getElementById('pw').value.trim();

        const apiUrl = `${window.location.protocol}//${window.location.hostname}:8001/register`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, password: password })
        });

        const result = await response.json();
        if (response.status === 201) {
            const loginResponse = await fetch(`${window.location.protocol}//${window.location.hostname}:8001/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, password: password })
            });

            if (loginResponse.ok) {
                const loginResult = await loginResponse.json();
                sessionStorage.setItem('username', name);
                sessionStorage.setItem('user_id', loginResult.user_id);
                window.location.href = 'index.html';
            } else {
            }
        } else {
        }
    });

    function setLanguage(lang) {
        document.title = getTranslation('pageTitle', lang);
        document.getElementById('title').textContent = getTranslation('registrationTitle', lang);
        document.getElementById('fname').setAttribute('placeholder', getTranslation('namePlaceholder', lang));
        document.getElementById('pw').setAttribute('placeholder', getTranslation('passwordPlaceholder', lang));
        document.getElementById('submit-btn').textContent = getTranslation('confirmButton', lang);
        document.getElementById('login').innerHTML = getTranslation('loginLink', lang);
        document.getElementById('banner-title').textContent = getTranslation('catalogTitle', lang);
    }

    function getTranslation(key, lang) {
        const translations = {
            en: {
                pageTitle: "Register",
                registrationTitle: "Register",
                namePlaceholder: "Name",
                passwordPlaceholder: "Password",
                confirmButton: "Confirm",
                registrationSuccess: "User registered and logged in successfully!",
                registrationSuccessButLoginFailed: "Registration successful, but login failed. Please log in manually.",
                registrationError: "Error: ",
                loginLink: 'Already registered? <a href="login.html">Click here to login!</a>',
                catalogTitle: "BookStock"
            },
            cz: {
                pageTitle: "Registrace",
                registrationTitle: "Registrace",
                namePlaceholder: "Jméno",
                passwordPlaceholder: "Heslo",
                confirmButton: "Potvrdit",
                registrationSuccess: "Uživatel byl úspěšně registrován a přihlášen!",
                registrationSuccessButLoginFailed: "Registrace byla úspěšná, ale přihlášení selhalo. Přihlaste se prosím ručně.",
                registrationError: "Chyba: ",
                loginLink: 'Již registrováni? <a href="login.html">Klikněte zde pro přihlášení!</a>',
                catalogTitle: "BookStock"
            }
        };

        return translations[lang][key];
    }
});
