let translations = {};
let currentLang = localStorage.getItem('language') || 'cz';

function loadTranslations() {
    return $.getJSON('translations.json')
        .then((data) => {
            translations = data;
            updateLanguage(currentLang);
        })
        .catch((error) => {
            console.error('Chyba při načítání překladů:', error);
        });
}

function updateLanguage(lang) {
    const translation = translations[lang];
    if (!translation) return;

    document.title = translation.catalogTitle;
    $('#catalog-title').text(translation.catalogTitle);
    $('#login-btn').text(translation.loginButton);
    $('#search-input').attr('placeholder', translation.searchPlaceholder);
    $('#new-comment').attr('placeholder', translation.commentPlaceholder);
    $('#lang-btn').text(translation.langButton);
    $('#date-filter-label').text(translation.dateFilterLabel);
    $('#newest-option').text(translation.newestOption);
    $('#oldest-option').text(translation.oldestOption);
    $('#load-more-btn').text(translation.loadMoreButton);
    $('#back-btn').text(translation.backButton);
    $('#comment-banner').text(translation.commentBanner);
    $('#banner-comment').text(translation.bannerComment);
    $('#submit-comment-btn').text(translation.submitCommentButton);
    $('#logout-btn').text(translation.logoutButton);
    $('#comments-list').html(`<p>${translation.noComments}</p>`);
    $('#username-display').text(`${translation.welcomeMessage} ${sessionStorage.getItem('username') || ''}`);
    $('#rating-title').text(translation.ratingTitle);
    $('#rating-section label[for="rating-select"]').text(`${translation.ratingLabel}:`);
    $('#submit-rating-btn').text(translation.submitRatingButton);
    $('#user-title').text(translation.userDetailTitle);
    $('label[for="personal-address"]').text(translation.personalAddressLabel);
    $('#personal-address').attr('placeholder', translation.personalAddressPlaceholder);
    $('label[for="billing-address"]').text(translation.billingAddressLabel);
    $('#billing-address').attr('placeholder', translation.billingAddressPlaceholder);
    $('label[for="same-as-personal"]').text(translation.sameAsPersonalLabel);
    $('label[for="data-processing-consent"]').text(translation.dataProcessingConsentLabel);
    $('label[for="gender"]').text(translation.genderLabel);
    $('#gender').find('option[value=""]').text(translation.genderPlaceholder);
    $('#gender').find('option[value="male"]').text(translation.genderMale);
    $('#gender').find('option[value="female"]').text(translation.genderFemale);
    $('#gender').find('option[value="other"]').text(translation.genderOther);
    $('label[for="age"]').text(translation.ageLabel);
    $('#age').attr('placeholder', translation.agePlaceholder);
    $('label[for="favorite-genres"]').text(translation.favoriteGenresLabel);
    $('#favorite-genres').attr('placeholder', translation.favoriteGenresPlaceholder);
    $('label[for="reference"]').text(translation.referenceLabel);
    $('#reference').attr('placeholder', translation.referencePlaceholder);
    $('#user-submit').text(translation.saveChangesButton);
    $('#close-user-detail-btn').text(translation.closeUserDetailButton);
    $('#date-filter-label').text(translation.dateFilterLabel);
    $('#newest-option').text(translation.newestOption);
    $('#oldest-option').text(translation.oldestOption);
    $('#category-filter-label').text(translation.categoryFilterLabel);
    $('#author-filter-label').text(translation.authorFilterLabel);
    $('#author-filter').attr('placeholder', translation.authorFilterPlaceholder);
    $('#title-filter-label').text(translation.titleFilterLabel);
    $('#title-filter').attr('placeholder', translation.titleFilterPlaceholder);
    $('#favorites-filter-btn').text(translation.favoritesFilterButton);
    $('#apply-filters-btn').text(translation.applyFiltersButton);
    $('#order-confirmation-form h2').text(translation.orderConfirmationTitle);
    $('label[for="personal-address-order"]').text(translation.personalAddressLabel);
    $('#personal-address-order').attr('placeholder', translation.personalAddressPlaceholder);
    $('label[for="billing-address-order"]').text(translation.billingAddressLabel);
    $('#billing-address-order').attr('placeholder', translation.billingAddressPlaceholder);
    $('label[for="same-as-personal-order"]').text(translation.sameAsPersonalLabel);
    $('label[for="email-order"]').text(translation.emailLabel);
    $('#email-order').attr('placeholder', translation.emailPlaceholder);
    $('label[for="data-processing-consent-order"]').text(translation.dataProcessingConsentLabel);
    $('label[for="payment-method"]').text(translation.paymentMethodLabel);
    $('#payment-method option[value=""]').text(translation.paymentOptionDefault);
    $('#payment-method option[value="dobirka"]').text(translation.paymentOptionDobirka);
    $('#payment-method option[value="prevod"]').text(translation.paymentOptionPrevod);
    $('#payment-method option[value="kartou"]').text(translation.paymentOptionKartou);
    $('#confirm-order-btn').text(translation.confirmOrderButton);
    $('#confirm-order-submit').text(translation.confirmOrderButton);
    $('#close-order-form-btn').text(translation.cancelOrderButton);

    $('.favorite-toggle-btn').each(function() {
        const button = $(this);
        const isFavorited = button.data('favorited');
        button.text(isFavorited
            ? (translation.removeFromFavorites || 'Odebrat z oblíbených')
            : (translation.addToFavorites || 'Přidat do oblíbených'));
    });

    $('.add-to-cart-btn').text(translation.addToCart || 'Přidat do košíku');
    $('.added-message').text(translation.addedToCart || 'Přidáno do košíku');

    updateBookListLanguage(translation);
    updateBookDetailLanguage(translation);
}


function updateBookListLanguage(translation) {
    $('#book-list .book-card').each(function () {
        const cardTexts = $(this).find('.card-text');

        if (cardTexts.length >= 3) {
            const authorsText = cardTexts.eq(0).text().split(': ')[1] || '';
            const publishedDateText = cardTexts.eq(1).text().split(': ')[1] || '';
            const priceText = cardTexts.eq(2).text().split(': ')[1] || '';

            cardTexts.eq(0).text(`${translation.authors} ${authorsText}`);
            cardTexts.eq(1).text(`${translation.publishedDate} ${publishedDateText}`);
            cardTexts.eq(2).text(`${translation.price}: ${priceText}`);
        } else {
            console.warn('Unexpected card structure detected. Skipping...');
        }
    });
}



function updateBookDetailLanguage(translation) {
    $('#detail-title').text(translation.bookTitle || $('#detail-title').text());
    $('#detail-authors').text(translation.authors || $('#detail-authors').text());
    $('#detail-description').text(translation.noDescription || $('#detail-description').text());
    $('#detail-published-year').text(translation.publishedDate || $('#detail-published-year').text());
    $('#detail-pages').text(translation.pages || $('#detail-pages').text());
    $('#detail-rating').text(translation.averageRating || $('#detail-rating').text());
}
