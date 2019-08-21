import * as request from 'request-promise-native';

const IsbnList = [
    '9780385541183',
    '9780385542692',
    '9780316508810',
    '9780399593499',
    '9781780621791',
    '9781101883983',
    '9780735215900',
    '9780399179204',
    '9780553448139',
    '9780316225908',
    '9780765399830',
    '9781501163425',
    '9780735224308',
    '9780735224476',
    '9781101946169',
];

export class BookListHandler {
    private bookDetailsEndpoint = 'http://itunes.apple.com/lookup?isbn=';

    private bookList: any = [];

    private totalBooks: number;

    public constructor() {
        this.loadBooksDetails().then(() => {
            this.totalBooks = this.bookList.length;
        });
    }

    private async loadBooksDetails() {
        for (let i = 0; i < IsbnList.length; i++) {
            const isbn = IsbnList[i];
            // eslint-disable-next-line no-await-in-loop
            const bookDetails = await this.getBookDetailsForIsbn(isbn);
            this.bookList.push(bookDetails);
        }
    }

    private async getBookDetailsForIsbn(isbn: string) {
        const endpoint = this.bookDetailsEndpoint + isbn;
        const bookDetail: any = {};

        const options = {
            uri: endpoint,
        };

        let result = await request.get(options);
        result = JSON.parse(result);
        if (result.resultCount !== 0) {
            const bookData = result.results[0];
            bookDetail.isbn = isbn;
            bookDetail.cover = bookData.artworkUrl100;
            bookDetail.title = bookData.trackName;
            bookDetail.author = bookData.artistName;
            bookDetail.publishDate = new Date(bookData.releaseDate).getFullYear();
            bookDetail.rating = this.calculateBase10Rating(bookData.averageUserRating);
            bookDetail.description = bookData.description;
            bookDetail.shops = this.generateShopsEntries(bookData);
        }

        return bookDetail;
    }

    private calculateBase10Rating(rating: number): string {
        let base10Rating = 'Unknown';
        if (rating) {
            base10Rating = `${(rating * 10) / 5}/10`;
        }
        return base10Rating;
    }

    private generateShopsEntries(bookData: any) {
        const shopUrls = [];
        const generators = [
            this.generateIBookEntryForBook,
            this.generateAmazonEntryForBook,
            this.generateEbayEntryForBook,
        ];

        const numberOfShops = Math.floor(Math.random() * 3 + 1);
        const startingFrom = Math.floor(Math.random() * 3);
        for (let i = startingFrom; i < 3 && i <= startingFrom + numberOfShops; i++) {
            shopUrls.push(generators[i](bookData));
        }

        return shopUrls;
    }

    private generateIBookEntryForBook(bookData: any): object {
        return {
            name: 'iBooks',
            url: bookData.trackViewUrl,
        };
    }

    private generateAmazonEntryForBook(bookData: any): object {
        const title = bookData.trackName;
        return {
            name: 'Amazon',
            url: `https://www.amazon.com/s?k=${title.replace(/ /g, '+')}&ref=nb_sb_noss_2`,
        };
    }

    private generateEbayEntryForBook(bookData: any): object {
        const title = bookData.trackName;
        return {
            name: 'Ebay',
            url: `https://www.ebay.com/sch/i.html?&sacat=267&_nkw=${title.replace(/ /g, '+')}`,
        };
    }

    public getBookListFromOffset(offset: number, limit: number): object {
        return {
            totalBooks: this.totalBooks,
            booksList: this.bookList.slice(offset, offset + limit),
        };
    }
}
