// VARIABLES
let booksPerLoad;
let scrollPosition = 0; 
let favoriteBooks = new Set();
let allBooksData = [];
let isCartVisible = false;
let cartBooks = [];
let finalCartPrice = 0;
let adjustedFinalPrice = 0;
let isOrderViewVisible = false;
let basePrice = 0;


// BOOKS
function setBooksPerLoad() {
    const width = $(window).width();
    booksPerLoad = (width < 768) ? 40 : 60;
}

function fetchBooks() {
    const host = window.location.hostname;
    const port = 8001;
    const url = `http://${host}:${port}/getdata`;

    $.when(fetchFavorites()).done(() => {
        $.ajax({
            url: url,
            method: 'GET',
            success: function(data) {
                allBooksData = data;
                displayBooks(data);
            },
            error: function(xhr, status, error) {
                console.error('Chyba při načítání knih:', error);
            }
        });
    });
}

function fetchCategories() {
    const host = window.location.hostname;
    const port = 8001;
    const url = `http://${host}:${port}/categories`;

    $.ajax({
        url: url,
        method: 'GET',
        success: function(categories) {
            $('#category-filter').empty();
            $('#category-filter').append('<option value="">-</option>');
            categories.forEach(category => {
                $('#category-filter').append(`<option value="${category.trim()}">${category.trim()}</option>`);
            });
        },
        error: function(xhr, status, error) {
            console.error('Chyba při načítání kategorií:', error);
        }
    });
}

function fetchBooksWithFilters() {
    const host = window.location.hostname;
    const port = 8001;
    const url = new URL(`http://${host}:${port}/books`);
    console.log("Načítám knihy s filtry...");

    const category = $('#category-filter').val() || '';
    console.log(category);
    const sortByDate = $('#date-filter').val() || '';
    const title = $('#title-filter').val() || '';
    const author = $('#author-filter').val() || '';
    const favorites = $('#favorites-filter-btn').data('showing-favorites') || false;
    const userId = sessionStorage.getItem('user_id');

    if (category) url.searchParams.append('category', category);
    if (sortByDate) url.searchParams.append('sort_by_date', sortByDate);
    if (title) url.searchParams.append('title', title);
    if (author) url.searchParams.append('author', author);

    if (favorites) {
        url.searchParams.append('favorites', 'true');
        if (userId) {
            url.searchParams.append('user_id', userId);
        }
    }
    $.ajax({
        url: url.href,
        method: 'GET',
        success: function (data) {
            console.log("Knihy načteny:", data);
            allBooksData = data;
            data.forEach(book => {
                book.isFavorited = favoriteBooks.has(book.isbn13);
            });
            displayBooks(data);
            updateFavoriteButtons();
        },
        error: function (xhr, status, error) {
            console.error('Chyba při načítání knih:', error);
        }
    });
}



function displayBooks(books) {
    const bookList = $('#book-list');
    const translation = translations[currentLang];
    bookList.empty();
    books.slice(0, booksPerLoad).forEach(book => {
        const authors = Array.isArray(book.authors) ? book.authors.join(', ') : book.authors;
        const isFavorited = favoriteBooks.has(book.isbn13);
        const price = book.price;
        const bookCol = createBookTemplate(book, authors, translation, isFavorited, price);
        bookList.append(bookCol);
    });
    $('#load-more-area').toggle(books.length > booksPerLoad);

    $('.card').on('click', function(event) {
        if (!$(event.target).hasClass('favorite-toggle-btn') && !$(event.target).hasClass('add-to-cart-btn')) {
            scrollPosition = $(window).scrollTop();
            const isbn13 = $(this).closest('.book-card').data('isbn13');
            if (isbn13) {
                fetchBookDetails(isbn13);
            } else {
                console.error('ISBN nebylo nalezeno pro tuto knihu.');
            }
        }
    });

    $('.favorite-toggle-btn').each(function() {
        const button = $(this);
        const bookIsbn = button.data('isbn13');
        const isFavorited = favoriteBooks.has(bookIsbn);
        button.data('favorited', isFavorited);
        button.text(isFavorited
            ? (translation.removeFromFavorites || 'Odebrat z oblíbených')
            : (translation.addToFavorites || 'Přidat do oblíbených'));
    });
}

function createBookTemplate(book, authors, translation, isFavorited, price) {
    const isUserLoggedIn = sessionStorage.getItem('user_id') !== null;
    const buttonText = isFavorited
        ? (translation.removeFromFavorites || 'Odebrat z oblíbených')
        : (translation.addToFavorites || 'Přidat do oblíbených');
    
    const dostupnostText = book.is_hidden === 1 
        ? '<p class="text-danger">Nedostupné</p>' 
        : (book.dostupnost === 'Nedostupné' ? '<p class="text-danger">Nedostupné</p>' : '');
    
    const priceText = price 
        ? `<p class="card-text">${translation.price || 'Cena'}: ${price} Kč</p>` 
        : '<p>Dočasně mimo sklad</p>';
    
    const addToCartButtonText = translation.addToCart || 'Přidat do košíku';
    const isInCart = cartBooks.some(cartBook => cartBook.isbn13 === book.isbn13);
    const addedMessageText = translation.addedToCart || '✔';

    return `
        <div class="col-8 mb-4 book-card" data-isbn13="${book.isbn13}">
            <div class="card">
                <h5 class="card-title">${book.title}</h5>
                <img src="${book.thumbnail}" class="card-img-top" alt="${book.title}">
                <div class="card-body">
                    <p class="card-text">${translation.authors} ${authors}</p>
                    <p class="card-text">${translation.publishedDate} ${book.published_year}</p>
                    ${priceText}
                    ${dostupnostText}
                    ${isUserLoggedIn ? `<button class="btn favorite-toggle-btn" data-isbn13="${book.isbn13}" data-favorited="${isFavorited}">${buttonText}</button>` : ''}
                    ${isUserLoggedIn && price && book.is_hidden !== 1 ? `
                        ${isInCart
                            ? `<span class="added-message" style="color: green;">${addedMessageText}</span>`
                            : `<button class="add-to-cart-btn" data-isbn13="${book.isbn13}">${addToCartButtonText}</button>`
                        }
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}


function fetchBookDetails(isbn13) {
    const host = window.location.hostname;
    const port = 8001;
    const url = `http://${host}:${port}/book/${isbn13}`;
    const userId = sessionStorage.getItem('user_id');
    $.ajax({
        url: url,
        method: 'GET',
        success: function(book) {
            $('#book-detail').data('isbn13', isbn13);
            if (userId) {
                checkUserRating(userId, isbn13, book);
            } else {
                showBookDetails(book);
            }
            fetchBookComments(isbn13);
        },
        error: function(xhr, status, error) {
            console.error('Chyba při načítání detailů knihy:', error);
        }
    });
}

function showBookDetails(book) {
    $(window).scrollTop(0);
    const translation = translations[currentLang];
    const priceText = book.is_hidden === 1
        ? '<p class="text-danger">Nedostupné</p>'
        : (book.price ? `${translation.price || 'Cena'}: ${book.price} Kč` : translation.unavailable || 'Dočasně mimo sklad');

    $('#detail-title').text(book.title);
    $('#detail-authors').text(`${translation.authors} ${Array.isArray(book.authors) ? book.authors.join(', ') : book.authors}`);
    $('#detail-description').text(book.description || translation.noDescription);
    $('#detail-published-year').text(`${translation.publishedDate} ${book.published_year}`);
    $('#book-detail img').attr('src', book.thumbnail || '').toggle(!!book.thumbnail);
    $('#detail-pages').text(`${translation.pages} ${book.num_pages}`).toggle(!!book.num_pages);
    $('#detail-rating').text(translation.averageRatingDisplay.replace('{rating}', book.average_rating?.toFixed(2) || 'N/A')).toggle(!!book.average_rating);
    $('#detail-price').html(priceText);

    const isUserLoggedIn = sessionStorage.getItem('user_id') !== null;
    const isInCart = cartBooks.some(cartBook => cartBook.isbn13 === book.isbn13);
    const addToCartText = translation.addToCart || 'Přidat do košíku';
    const addedMessageText = translation.addedToCart || '✔';

    if (book.is_hidden === 1 || !book.price || !isUserLoggedIn) {
        $('#add-to-cart-button').hide();
    } else if (isInCart) {
        $('#add-to-cart-button').hide();
        if (!$('#add-to-cart-button').siblings('.added-message').length) {
            $('#add-to-cart-button').after(`<span class="added-message" style="color: green;">${addedMessageText}</span>`);
        }
    } else {
        $('#add-to-cart-button')
            .text(addToCartText)
            .show()
            .attr('data-isbn13', book.isbn13)
            .off('click')
            .on('click', function() {
                addToCart(book);
                $('#add-to-cart-button').hide();
                $('#add-to-cart-button').after(`<span class="added-message-details" style="color: green;">${addedMessageText}</span>`);
                updateHomepageButton(book.isbn13, true);
            });
        $('#add-to-cart-button').siblings('.added-message').remove();
    }

    if (book.is_hidden === 1) {
        $('#comment-form-section').hide();
        $('#rating-section').hide();
    } else {
        $('#comment-form-section').toggle(isUserLoggedIn);
        const userId = sessionStorage.getItem('user_id');
        const userHasRated = book.user_has_rated;
        if (userId && !userHasRated) {
            $('#rating-section').show();
        } else {
            $('#rating-section').hide();
        }
    }

    $('#lang-btn').hide();
    $('#main-content').hide();
    $('#book-detail').show();
}



function updateHomepageButton(isbn13, isAdded) {
    const button = $(`.add-to-cart-btn[data-isbn13="${isbn13}"]`);
    let addedMessage = button.siblings('.added-message');

    if (isAdded) {
        button.hide();

        if (addedMessage.length === 0) {
            addedMessage = $('<span class="added-message" style="color: green;">✔</span>');
            button.after(addedMessage);
        } else {
            addedMessage.show();
        }
    } else {
        button.show();
        addedMessage.remove();
    }
}

function updateDetailPageButton(isbn13, isAdded) {
    const button = $('#add-to-cart-button');
    const addedMessage = button.siblings('.added-message');

    if (isAdded && button.attr('data-isbn13') === isbn13) {
        button.hide();
        if (addedMessage.length === 0) {
            button.after('<span class="added-message-details" style="color: green;">✔</span>');
        }
    } else if (button.attr('data-isbn13') === isbn13) {
        button.show();
        addedMessage.remove();
    }
}

// RATING
function checkUserRating(userId, isbn13, book) {
    const host = window.location.hostname;
    const port = 8001;
    const url = `http://${host}:${port}/check-rating`;
    $.ajax({
        url: url,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ user_id: userId, isbn13: isbn13 }),
        success: function(response) {
            book.user_has_rated = response.user_has_rated;
            if (response.user_has_rated) {
                book.user_rating_value = response.rating_value;
            }

            showBookDetails(book);
        },
        error: function(xhr) {
            console.error('Chyba při kontrole hodnocení:', xhr.responseText);
            showBookDetails(book);
        }
    });
}


// FAVOURITE
function toggleFavorite(bookIsbn, isFavorited, button) {
    const host = window.location.hostname;
    const port = 8001;
    const url = `http://${host}:${port}/${isFavorited ? 'favoriteremove' : 'favoriteadd'}`;
    const userId = sessionStorage.getItem('user_id');
    const translation = translations[currentLang];

    $.ajax({
        url: url,
        method: isFavorited ? 'DELETE' : 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ user_id: userId, book_isbn: bookIsbn }),
        success: function() {
            const newFavoritedState = !isFavorited;
            if (newFavoritedState) {
                favoriteBooks.add(bookIsbn);
            } else {
                favoriteBooks.delete(bookIsbn);
            }

            button.data('favorited', newFavoritedState);
            button.text(newFavoritedState
                ? (translation.removeFromFavorites || 'Odebrat z oblíbených')
                : (translation.addToFavorites || 'Přidat do oblíbených'));
        },
        error: function(xhr, status, error) {
            console.error(`Chyba při ${isFavorited ? 'odebírání z' : 'přidávání do'} oblíbených:`, error);
        }
    });
}

function updateFavoriteButtons() {
    console.log("Aktualizuji tlačítka oblíbených knih...");
    $('.favorite-toggle-btn').each(function () {
        const button = $(this);
        const bookIsbn = normalizeIsbn(button.data('isbn13'));
        const isFavorited = favoriteBooks.has(bookIsbn);
        console.log(`Kniha ISBN ${bookIsbn} - Favorited: ${isFavorited}`);
        button.data('favorited', isFavorited);
        button.text(isFavorited
            ? translations[currentLang]?.removeFromFavorites || 'Odebrat z oblíbených'
            : translations[currentLang]?.addToFavorites || 'Přidat do oblíbených');
    });
}


function fetchFavorites() {
    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
        console.log("Uživatel není přihlášen, přeskočeno načítání oblíbených.");
        return $.Deferred().resolve();
    }

    const host = window.location.hostname;
    const port = 8001;
    const url = `http://${host}:${port}/favorite?user_id=${userId}`;

    return $.ajax({
        url: url,
        method: 'GET',
        success: function (data) {
            favoriteBooks.clear();
            data.forEach(fav => favoriteBooks.add(fav.isbn13));
            console.log("Stav favoriteBooks:", Array.from(favoriteBooks));
        },
        error: function (xhr, status, error) {
            console.error("Chyba při načítání oblíbených knih:", error);
        }
    });
}

function normalizeIsbn(isbn) {
    return isbn.toString().replace(/\s|-/g, "").trim();
}


// COMMENTS
function fetchBookComments(isbn13) {
    const host = window.location.hostname;
    const port = 8001;
    const url = `http://${host}:${port}/comments/${isbn13}`;
    const commentsList = $('#comments-list');
    commentsList.empty();
    $.ajax({
        url: url,
        method: 'GET',
        success: function(data) {
            displayComments(data);
        },
        error: function(xhr, status, error) {
            console.error('Chyba při načítání komentářů:', xhr.responseText);
        }
    });
}

function displayComments(comments) {
    const commentsList = $('#comments-list');
    commentsList.empty();
    if (comments.length === 0) {
        commentsList.append(`<p>${translations[currentLang].noComments}</p>`);
    } else {
        comments.forEach(comment => {
            const commentHtml = createCommentTemplate(comment);
            commentsList.append(commentHtml);
        });
    }
}

function createCommentTemplate(comment) {
    return `
        <div class="comment-item">
            <p><strong>${comment.user_name}</strong> (${new Date(comment.date_added).toLocaleDateString()}):</p>
            <p>${comment.comment_text}</p>
        </div>
    `;
}

// EVENTS

$('#apply-filters-btn').on('click', function() {
    fetchBooksWithFilters();
});

$('#favorites-filter-btn').on('click', function() {
    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
        return;
    }

    const showingFavorites = $(this).data('showing-favorites');
    $(this).data('showing-favorites', !showingFavorites);
    $(this).text(showingFavorites ? 'Zobrazit oblíbené' : 'Zobrazit všechny knihy');
    if (!showingFavorites) {
        favoriteBooksData = [];
    }

    fetchBooksWithFilters();
});


$('#submit-comment-btn').on('click', function() {
    const commentText = $('#new-comment').val().trim();
    const userId = sessionStorage.getItem('user_id');
    const isbn13 = $('#book-detail').data('isbn13');
    if (!commentText) {
        return;
    }
    if (!userId) {
        return;
    }
    const host = window.location.hostname;
    const port = 8001;
    const url = `http://${host}:${port}/add-comment`;
    $.ajax({
        url: url,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ user_id: userId, book_isbn: isbn13, comment_text: commentText }),
        success: function() {
            $('#new-comment').val('');
            fetchBookComments(isbn13);
        },
        error: function(xhr) {
            console.error('Chyba při přidávání komentáře:', xhr.responseText);
        }
    });
});

$('#submit-rating-btn').on('click', function() {
    const ratingValue = parseInt($('#rating-select').val());
    const userId = sessionStorage.getItem('user_id');
    const isbn13 = $('#book-detail').data('isbn13');
    if (!userId) {
        return;
    }
    const host = window.location.hostname;
    const port = 8001;
    const url = `http://${host}:${port}/rate-book`;
    $.ajax({
        url: url,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            user_id: userId,
            isbn13: isbn13,
            rating_value: ratingValue
        }),
        success: function(response) {
            $('#rating-section').hide();
            $('#previous-rating').show();
            $('#user-rating-value').text(`${ratingValue}`);

            if (response.new_average_rating !== undefined) {
                $('#detail-rating').text(`Průměrné hodnocení: ${response.new_average_rating.toFixed(2)}`).show();
            }
            
            $('#book-detail').data('user_has_rated', true);
        },        
        error: function(xhr) {
        }
    });
});

$('#back-btn').on('click', function() {
    $('#book-detail').hide();
    $('#main-content').show();
    $('#lang-btn').show();
    $(window).scrollTop(scrollPosition);
});

$('#confirm-order-btn').on('click', function() {
    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
        return;
    }

    fetchUserDetails(userId).then(userDetails => {
        $('#personal-address-order').val(userDetails.personal_address || '');
        $('#billing-address-order').val(userDetails.billing_address || '');
        $('#same-as-personal-order').prop('checked', userDetails.billing_same_as_personal || false);
        $('#email-order').val(userDetails.email || '');
    }).always(() => {
        $('#order-confirmation-form').show();
        $('#cart-content').hide();
        $('#confirm-order-btn').hide();
    });
});


$('#close-order-form-btn').on('click', function() {
    $('#order-confirmation-form').hide();
    $('#cart-content').show();
    $('#confirm-order-btn').show();
});

$('#cart-btn').on('click', function() {
    if (isCartVisible) {
        $('#cart-content').hide();
        $('#main-content').show();
        $('#confirm-order-btn').hide();
        $('#order-confirmation-form').hide();
        $('#user-detail').hide();
        $('#order-group').hide();
        $('#lang-btn').show();
        isCartVisible = false;
    } else {
        $('#main-content').hide();
        $('#book-detail').hide();
        $('#cart-content').show();
        $('#user-detail').hide();
        $('#order-group').hide();
        $('#lang-btn').hide();
        isCartVisible = true;
        displayCartBooks();

        if (cartBooks.length > 0) {
            $('#confirm-order-btn').show();
        } else {
            $('#confirm-order-btn').hide();
        }
    }
});

$('#confirm-order-btn').on('click', function() {
    const userId = sessionStorage.getItem('user_id');
    const translation = translations[currentLang];
    const finalPriceLabel = translation?.finalPriceLabel || 'Celková cena';
    if (!userId) {
        return;
    }

    fetchUserDetails(userId).then(userDetails => {
        if (userDetails) {
            $('#personal-address-order').val(userDetails.personal_address || '');
            $('#billing-address-order').val(userDetails.billing_address || '');
            $('#same-as-personal-order').prop('checked', userDetails.billing_same_as_personal || false);
            $('#email-order').val(userDetails.email || '');
            $('#final-price-display').text(`${finalPriceLabel}: ${finalCartPrice} Kč`);

            
        }
        $('#order-confirmation-form').show();
        $('#cart-content').hide();
        $('#confirm-order-btn').hide();
    }).catch(error => {
        console.error("Chyba při načítání uživatelských detailů:", error);
    });
});

$('#order-form').on('submit', function(event) {
    event.preventDefault();

    const userId = sessionStorage.getItem('user_id');
    const personalAddress = $('#personal-address-order').val().trim();
    const billingAddress = $('#same-as-personal-order').is(':checked')
        ? personalAddress
        : $('#billing-address-order').val().trim();
    const email = $('#email-order').val().trim();
    const paymentMethod = $('#payment-method').val();
    const dataProcessingConsent = $('#data-processing-consent-order').is(':checked');

    if (!personalAddress || !billingAddress || !email || !paymentMethod || !dataProcessingConsent) {
        return;
    }

    const orderData = {
        user_id: userId,
        personal_address: personalAddress,
        billing_address: billingAddress,
        email: email,
        payment_method: paymentMethod,
        cart: cartBooks
    };

    const host = window.location.hostname;
    const port = 8001; //
    const url = `http://${host}:${port}/confirm-order`;

    $.ajax({
        url: url,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(orderData),
        success: function(response) {
            cartBooks = [];
            saveCartToLocalStorage();
            resetAddToCartButtons();
            $('#order-confirmation-form').hide();
            $('#cart-content').show();
            displayCartBooks();
        },
        error: function(xhr) {
            console.error(`Chyba při potvrzování objednávky: ${xhr.responseText}`);
        }
    });
});

$('#order-btn').on('click', function () {
    if (isOrderViewVisible) {
        $('#order-group').hide();
        $('#main-content').show();
        $('#book-detail').hide();
        $('#cart-content').hide();
        $('#confirm-order-btn').hide();
        $('#user-detail').hide();
        $('#order-confirmation-form').hide();
        $('#lang-btn').show();
        isOrderViewVisible = false;
    } else {
        $('#main-content').hide();
        $('#book-detail').hide();
        $('#cart-content').hide();
        $('#confirm-order-btn').hide();
        $('#order-group').show();
        $('#user-detail').hide();
        $('#order-confirmation-form').hide();
        $('#lang-btn').hide();
        

        fetchAndDisplayOrders();

        isOrderViewVisible = true;
    }
});

// DOCUMENT

$(document).ready(function() {
    fetchCategories();
    fetchBooksWithFilters();

    $('#favorites-filter-btn').data('showing-favorites', false);
});

$(document).on('click', '.favorite-toggle-btn', function(event) {
    event.preventDefault();
    event.stopPropagation();

    const button = $(this);
    const bookIsbn = button.data('isbn13');
    const isFavorited = button.data('favorited');
    const userId = sessionStorage.getItem('user_id');

    if (!userId) {
        return;
    }

    toggleFavorite(bookIsbn, isFavorited, button);
});

$(document).ready(function() {
    loadCartFromLocalStorage();
    $('#username-display').on('click', function() {
        $('#main-content').hide();
        $('#book-detail').hide();
        $('#cart-content').hide();
        $('#confirm-order-btn').hide();
        $('#order-confirmation-form').hide();
        $('#order-group').hide();
        $('#user-detail').show();
        $('#lang-btn').hide();
        const userId = sessionStorage.getItem('user_id');
        if (userId) {
            fetchUserDetails(userId);
        }
    });

    function fetchUserDetails(userId) {
        const host = window.location.hostname;
        const port = 8001;
        const url = `http://${host}:${port}/user-details/${userId}`;

        $.ajax({
            url: url,
            method: 'GET',
            success: function(data) {
                $('#personal-address').val(data.personal_address || '');
                $('#billing-address').val(data.billing_address || '');
                $('#same-as-personal').prop('checked', data.billing_same_as_personal);
                $('#data-processing-consent').prop('checked', data.data_processing_consent);
                $('#gender').val(data.gender || '');
                $('#age').val(data.age || '');
                $('#favorite-genres').val(data.favorite_genres || '');
                $('#reference').val(data.reference || '');
            },
            error: function(xhr) {
                console.error('Chyba při načítání detailů uživatele:', xhr.responseText);
            }
        });
}
});

$(document).ready(function() {
    $('#same-as-personal').on('change', function() {
        if ($(this).is(':checked')) {
            $('.billing-address-group').hide();
            $('#billing-address').val($('#personal-address').val());
        } else {
            $('.billing-address-group').show();
            $('#billing-address').val('');
        }
    });

    $('#user-detail-form').on('submit', function(event) {
        event.preventDefault();

        const userId = sessionStorage.getItem('user_id');
        if (!userId) {
            return;
        }

        const personalAddress = $('#personal-address').val().trim();
        const billingAddress = $('#same-as-personal').is(':checked') ? personalAddress : $('#billing-address').val().trim();
        const billingSameAsPersonal = $('#same-as-personal').is(':checked');
        const dataProcessingConsent = $('#data-processing-consent').is(':checked');
        const gender = $('#gender').val();
        const age = parseInt($('#age').val());
        const favoriteGenres = $('#favorite-genres').val().trim();
        const reference = $('#reference').val().trim();

        if (!dataProcessingConsent || !personalAddress) {
            return;
        }

        const host = window.location.hostname;
        const port = 8001;
        const url = `http://${host}:${port}/user-details`;

        $.ajax({
            url: url,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                user_id: userId,
                personal_address: personalAddress,
                billing_address: billingAddress,
                billing_same_as_personal: billingSameAsPersonal,
                data_processing_consent: dataProcessingConsent,
                gender: gender,
                age: age,
                favorite_genres: favoriteGenres,
                reference: reference
            }),
            success: function(response) {
            },
            error: function(xhr) {
            }
        });
    });

    $('#close-user-detail-btn').on('click', function() {
        $('#user-detail').hide();
        $('#main-content').show();
        $('#lang-btn').show();
        $(window).scrollTop(0);
    });
});

$(document).on('click', '.remove-from-cart-btn', function(event) {
    event.preventDefault();
    event.stopPropagation();

    const bookIsbn = $(this).data('isbn13').toString().replace(/\s|-/g, "");
    const bookIndex = cartBooks.findIndex(book => book.isbn13.toString().replace(/\s|-/g, "") === bookIsbn);

    if (bookIndex > -1) {
        cartBooks.splice(bookIndex, 1);

        updateHomepageButton(bookIsbn, false);

        updateDetailPageButton(bookIsbn, false);

        displayCartBooks();
        saveCartToLocalStorage();
        updateAddToCartButtons();
    } else {
        console.error("Kniha s tímto ISBN nebyla nalezena v košíku.");
    }
});

$(document).on('click', '.add-to-cart-btn', function(event) {
    event.preventDefault();
    event.stopPropagation();

    const button = $(this);
    const bookIsbn = button.data('isbn13');
    const cleanedBookIsbn = bookIsbn.toString().replace(/\s|-/g, "");
    const bookData = allBooksData.find(book => book.isbn13.toString().replace(/\s|-/g, "") === cleanedBookIsbn);

    if (bookData) {
        cartBooks.push(bookData);
        saveCartToLocalStorage();
        updateAddToCartButtons();
        button.hide();
        button.after('<span class="added-message-details">✔</span>');
    } else {
        console.error("Kniha s tímto ISBN nebyla nalezena v seznamu knih.");
    }
});

$(document).ready(function() {
    function updateBillingAddressField() {
        if ($('#same-as-personal-order').is(':checked')) {
            $('#billing-address-order').hide().val($('#personal-address-order').val());
        } else {
            $('#billing-address-order').show().val('');
        }
    }

    $('#same-as-personal-order').on('change', updateBillingAddressField);

    updateBillingAddressField();
});

$(document).ready(function() {
    updateBasePrice(500);

    $('#payment-method').on('change', function() {
        updateFinalPrice();
    });
});

$(document).ready(function() {
    checkUserLoggedIn();
});

$(document).ready(function() {
    const translation = translations[currentLang];
    const finalPriceLabel = translation?.finalPriceLabel || 'Celková cena';
    const currencyLabel = translation?.currency || 'Kč';

    $('#final-price-display').text(`${finalPriceLabel}: ${finalCartPrice.toFixed(2)} ${currencyLabel}`);

    $('#payment-method').on('change', function() {
        updateFinalPriceWithPayment();
    });
});

$(document).ready(function() {
    loadCartFromLocalStorage();
    fetchFavorites().done(() => {
        fetchBooksWithFilters();
    });
    updateAddToCartButtons();
});

//CART

function resetAddToCartButtons() {
    $('.added-message').remove();
    $('.add-to-cart-btn').show();
    $('#add-to-cart-button').show();
}

function saveCartToLocalStorage() {
    localStorage.setItem('cartBooks', JSON.stringify(cartBooks));
}

function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cartBooks');
    if (savedCart) {
        cartBooks = JSON.parse(savedCart);
    }
}

function displayCartBooks() {
    const cartItems = $('#cart-items');
    const cartSummary = $('#cart-summary');
    const totalPriceElement = $('#total-price');
    const totalQuantityElement = $('#total-quantity');
    const translation = translations[currentLang];
    cartItems.empty();

    if (cartBooks.length === 0) {
        cartItems.append(`<p>${translation.emptyCartMessage || 'Košík je prázdný'}</p>`);
        $('#confirm-order-btn').hide();
        cartSummary.hide();
    } else {
        let totalQuantity = 0;
        let totalPrice = 0;

        cartBooks.forEach((book, index) => {
            const authors = Array.isArray(book.authors) ? book.authors.join(', ') : book.authors;
            const quantity = book.quantity || 1;
            const bookPrice = parseFloat(book.price) || 0; // Zajištění, že book.price je číslo

            totalQuantity += quantity;
            totalPrice += quantity * bookPrice;

            const bookHtml = `
                <div class="cart-item">
                    <h5>${book.title}</h5>
                    <img src="${book.thumbnail}" alt="${book.title}" class="cart-item-thumbnail">
                    <p>${translation.author}: ${authors || translation.authorUnavailable || 'Autor není k dispozici'}</p>
                    <p>${translation.price}: ${bookPrice.toFixed(2)} Kč</p>
                    <div class="quantity-container">
                        <label for="quantity-${index}">${translation.quantity}:</label>
                        <input type="number" id="quantity-${index}" class="book-quantity-input" value="${quantity}" min="1" max="99" data-index="${index}">
                    </div>
                    <button class="btn btn-danger remove-from-cart-btn" data-isbn13="${book.isbn13}">${translation.removeButton || 'Odebrat'}</button>
                </div>
            `;
            cartItems.append(bookHtml);
        });

        totalPrice = parseFloat(totalPrice).toFixed(2);

        finalCartPrice = totalPrice;

        totalPriceElement.text(`${translation.price}: ${totalPrice} Kč`);
        totalQuantityElement.text(`${translation.quantity}: ${totalQuantity}`);
        cartSummary.show();

        $('#confirm-order-btn').show();

        $('.book-quantity-input').on('change', function() {
            const index = $(this).data('index');
            const newQuantity = parseInt($(this).val());
            if (newQuantity > 0) {
                cartBooks[index].quantity = newQuantity;
                saveCartToLocalStorage();
                displayCartBooks();
            } else {
                $(this).val(cartBooks[index].quantity || 1);
            }
        });
    }
}


function addToCart(book) {
    if (book) {
        if (!cartBooks.some(cartBook => cartBook.isbn13 === book.isbn13)) {
            cartBooks.push(book);
            saveCartToLocalStorage();
            updateHomepageButton(book.isbn13, true);
        }
    } else {
        console.error("Kniha nebyla nalezena pro přidání do košíku.");
    }
}

function fetchUserDetails(userId) {
    const host = window.location.hostname;
    const port = 8001;
    const url = `http://${host}:${port}/user-details/${userId}`;

    return $.ajax({
        url: url,
        method: 'GET'
    }).catch(() => {
        return {};
    });
}

function checkUserLoggedIn() {
    const userId = sessionStorage.getItem('user_id');
    if (userId) {
        $('#cart-btn').show();
        $('#favorites-filter-btn').show();
        $('#order-btn').show();
        $('#order-group').hide();
    } else {
        $('#favorites-filter-btn').hide();
        $('#cart-btn').hide();
        $('#order-btn').hide();
        $('#order-group').hide();
    }
}

function resetAddToCartButtons() {
    $('.added-message').remove();
    $('.add-to-cart-btn').show();
}

function updateBasePrice(price) {
    basePrice = price;
    updateFinalPrice();
}

function updateFinalPrice() {
    const selectedPayment = $('#payment-method').val();
    let finalPrice = parseFloat(basePrice) || 0;

    if (selectedPayment === 'dobirka') {
        finalPrice += 50;
    } else if (selectedPayment === 'kartou') {
        finalPrice += finalPrice * 0.01;
    }

    const translation = translations[currentLang];
    const finalPriceLabel = translation?.finalPriceLabel || 'Celková cena';
    const currencyLabel = translation?.currency || 'Kč';

    $('#final-price-display').text(`${finalPriceLabel}: ${finalPrice.toFixed(2)} ${currencyLabel}`);
}


function updateFinalPriceWithPayment() {
    const selectedPayment = $('#payment-method').val();
    adjustedFinalPrice = parseFloat(finalCartPrice);

    if (selectedPayment === 'dobirka') {
        adjustedFinalPrice += 50;
    } else if (selectedPayment === 'kartou') {
        adjustedFinalPrice += finalCartPrice * 0.01;
    }

    const translation = translations[currentLang];
    const finalPriceLabel = translation?.finalPriceLabel || 'Celková cena';
    const currencyLabel = translation?.currency || 'Kč';

    $('#final-price-display').text(`${finalPriceLabel}: ${adjustedFinalPrice.toFixed(2)} ${currencyLabel}`);
}

function fetchAndDisplayOrders() {
    const userId = sessionStorage.getItem('user_id');

    if (!userId) {
        return;
    }

    const host = window.location.hostname;
    const port = 8001;
    const url = `http://${host}:${port}/orders/${userId}`;

    $.ajax({
        url: url,
        method: 'GET',
        success: function (orders) {
            renderOrderList(orders);
        },
        error: function (xhr, status, error) {
            console.error("Chyba při načítání objednávek:", error);
            $('#list-order').html('<p>Nepodařilo se načíst objednávky.</p>');
        }
    });
}

function renderOrderList(orders) {
    const listOrder = $('#list-order');
    const translation = translations[currentLang];
    listOrder.empty();

    if (orders.length === 0) {
        listOrder.html(`<p>${translation.noOrdersFound || 'Žádné objednávky nebyly nalezeny.'}</p>`);
        return;
    }

    orders.forEach(order => {
        const bookItems = order.books.map(book => {
            const bookPrice = parseFloat(book.price) || 0;
            return `
                <li>
                    <strong>${book.title}</strong> - ${book.quantity} ks, ${translation.orderTotalPrice || 'Cena'}: ${bookPrice.toFixed(2)} Kč
                </li>
            `;
        }).join('');

        const totalPrice = parseFloat(order.total_price) || 0;

        const orderElement = `
            <div class="order-item">
                <h3>${translation.orderId || 'Objednávka #'}${order.id}</h3>
                <p><strong>${translation.orderDate || 'Datum:'}</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                <p><strong>${translation.orderStatus || 'Stav:'}</strong> ${order.status}</p>
                <p><strong>${translation.orderTotalPrice || 'Celková cena:'}</strong> ${totalPrice.toFixed(2)} Kč</p>
                <h4>${translation.orderBookList || 'Seznam knih:'}</h4>
                <ul>${bookItems}</ul>
            </div>
            <hr>
        `;

        listOrder.append(orderElement);
    });
}

function updateAddToCartButtons() {
    $('.add-to-cart-btn').each(function() {
        const button = $(this);
        const bookIsbn = button.data('isbn13');
        const isInCart = cartBooks.some(cartBook => cartBook.isbn13 === bookIsbn);

        const addedMessage = button.siblings('.added-message');
        if (isInCart) {
            button.hide();
            if (addedMessage.length === 0) {
                button.after('<span class="added-message" style="color: green;">✔</span>');
            }
        } else {
            button.show();
            addedMessage.remove();
        }
    });
}
