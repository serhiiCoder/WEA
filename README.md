# WEA Aplikace na knihy

## Popis

Toto je aplikace pro správu knih, která umožňuje ukládat a načítat informace o knihách z databáze.

## Endpoint pro příjem dat

### `/upload`

- **Metoda:** `POST`
- **Popis:** Tento endpoint přijímá JSON pole knih a ukládá je do databáze. Před přidáním nových dat se předchozí data v tabulce `books` odstraní.
- **Příklad požadavku:**
```json
[
    {
        "isbn13": "9781556434241",
        "isbn10": "1556434243",
        "title": "Kniha 7",
        "categories": "Fiction",
        "subtitle": "",
        "authors": "Theodore Sturgeon",
        "thumbnail": "http://books.google.com/books/content?id=amWBa48lb6AC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
        "description": "Kurt Vonnegut cites Theodore Sturgeon as the inspiration for his character Kilgore Trout.",
        "published_year": "2004",
        "average_rating": "4.41",
        "num_pages": "400",
        "ratings_count": "137"
    }
]
