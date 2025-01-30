$(document).ready(function() {
    loadTranslations();
    setBooksPerLoad();
    fetchBooks();
    checkLoginStatus();

    $('#login-btn').on('click', function() {
        window.location.href = 'login.html';
    });

    $('#back-btn').on('click', function() {
        
        $('#book-detail').hide();
        $('#main-content').show();
        $('#lang-btn').show();
        $(window).scrollTop(scrollPosition);
    });

    $('#load-more-btn').on('click', function() {
        fetchBooks();
    });

    $('#lang-btn').on('click', function() {
        currentLang = currentLang === 'cz' ? 'en' : 'cz';
        localStorage.setItem('language', currentLang);
        updateLanguage(currentLang);
    });

    function checkLoginStatus() {
        const username = sessionStorage.getItem('username');
        const userId = sessionStorage.getItem('user_id');
        if (username && userId) {
            $('#login-btn').hide();
            $('#username-display').text(`Vítejte, ${username}`).show();
            $('#logout-area').show();
            $('#comment-form-section').show();
        } else {
            $('#login-btn').show();
            $('#username-display').hide();
            $('#logout-area').hide();
            $('#comment-form-section').hide();
        }
    }

    $('#logout-btn').on('click', function() {
        const host = window.location.hostname;
        const port = 8001;
        const url = `http://${host}:${port}/logout`;
    
        $.ajax({
            url: url,
            method: 'POST',
            success: function(response) {
                sessionStorage.removeItem('username');
                sessionStorage.removeItem('user_id');
                alert(response.message);
                window.location.reload();
            },
            error: function(xhr, status, error) {
                alert('Chyba při odhlašování: ' + error);
            }
        });
    });
    
    

});
