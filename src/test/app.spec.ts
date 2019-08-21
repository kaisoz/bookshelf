/* eslint-disable no-multi-str */
/* eslint-disable no-undef */
import sinon from 'sinon';
import { App } from '../app';

/* 
    ES6 import is broken in chai-http:
    https://github.com/DefinitelyTyped/DefinitelyTyped/issues/19480

    And chai doesn't seem to work if you mix both import syntax...
*/
// eslint-disable-next-line @typescript-eslint/no-var-requires
const chai = require('chai');

const { expect } = chai;
chai.use(require('chai-http'));

describe('/export', () => {
    let clock: any;
    let theApp: App;
    const expectedDate = new Date('2011-12-10T23:00:00.000Z');

    beforeEach(() => {
        theApp = new App(8000, 'static');
        clock = sinon.useFakeTimers(expectedDate.getTime());
    });

    afterEach(() => {
        if (clock) {
            clock.restore();
            clock = undefined;
        }
    });

    it('POST should return 200 if a export job with correct values is requested', done => {
        chai.request(theApp.app)
            .post('/export')
            .send({
                bookId: '1',
                type: 'epub',
            })
            .then((res: any) => {
                expect(res.status).to.equal(200);
                expect(res.text).to.equal('');
                done();
            });
    });

    it('POST should return 500 and an error message if a export job with incorrect type is requested', done => {
        chai.request(theApp.app)
            .post('/export')
            .send({
                bookId: '1',
                type: 'foo',
            })
            .then((res: any) => {
                expect(res.status).to.equal(500);
                expect(res.text).to.equal(JSON.stringify({ error: 'Invalid export type: foo' }));
                done();
            });
    });

    it('POST should return 500 and an error message if a export job with missing type is requested', done => {
        chai.request(theApp.app)
            .post('/export')
            .send({
                bookId: '1',
            })
            .then((res: any) => {
                expect(res.status).to.equal(500);
                expect(res.text).to.equal(JSON.stringify({ error: 'Invalid export type: undefined' }));
                done();
            });
    });

    it('POST should return 500 and an error message if a export job with incorrect book id is requested', done => {
        chai.request(theApp.app)
            .post('/export')
            .send({
                bookId: 'foo',
                type: 'pdf',
            })
            .then((res: any) => {
                expect(res.status).to.equal(500);
                expect(res.text).to.equal(JSON.stringify({ error: 'Invalid book id: foo' }));
                done();
            });
    });

    it('POST should return 500 and an error message if a export job with missing book id is requested', done => {
        chai.request(theApp.app)
            .post('/export')
            .send({
                type: 'pdf',
            })
            .then((res: any) => {
                expect(res.status).to.equal(500);
                expect(res.text).to.equal(JSON.stringify({ error: 'Invalid book id: undefined' }));
                done();
            });
    });

    it('GET should return 200 and an empty array if no export jobs where requested yet', done => {
        chai.request(theApp.app)
            .get('/export')
            .then((res: any) => {
                expect(res.status).to.equal(200);
                expect(res.text).to.equal('[]');
                done();
            });
    });

    it('GET should return 200 and a array with all pending jobs', done => {
        let expectedJson =
            '[{\
            "bookId": "2",\
            "type": "pdf",\
            "state": "pending",\
            "createdAt": "2011-12-10T23:00:00.000Z"\
        }, {\
            "bookId": "1",\
            "type": "pdf",\
            "state": "pending",\
            "createdAt": "2011-12-10T23:00:00.000Z"\
        }, {\
            "bookId": "0",\
            "type": "pdf",\
            "state": "pending",\
            "createdAt": "2011-12-10T23:00:00.000Z"\
        }]';

        // Remove JSON spaces. Was shown expanded for readability purposes
        expectedJson = expectedJson.replace(/\s/g, '');

        for (let i = 0; i < 3; i++) {
            chai.request(theApp.app)
                .post('/export')
                .send({
                    bookId: String(i),
                    type: 'pdf',
                })
                .then((res: any) => {
                    expect(res.status).to.equal(200);
                });
        }

        chai.request(theApp.app)
            .get('/export')
            .then((res: any) => {
                expect(res.status).to.equal(200);
                expect(res.text).to.equal(expectedJson);
                done();
            });
    });

    it('GET should return 200 and a array with all finished jobs', done => {
        const twentyFiveSecsInMs = 25 * 1000;
        clock.restore();
        const testData = [
            {
                bookId: '2',
                type: 'epub',
                state: 'finished',
                processingTimeInMs: 10 * 1000,
            },
            {
                bookId: '1',
                type: 'pdf',
                state: 'finished',
                processingTimeInMs: 25 * 1000,
            },
            {
                bookId: '0',
                type: 'epub',
                state: 'finished',
                processingTimeInMs: 10 * 1000,
            },
        ];

        for (let i = 2; i >= 0; i--) {
            chai.request(theApp.app)
                .post('/export')
                .send({
                    bookId: testData[i].bookId,
                    type: testData[i].type,
                })
                .then((res: any) => {
                    expect(res.status).to.equal(200);
                });
        }

        setTimeout(() => {
            chai.request(theApp.app)
                .get('/export')
                .then((res: any) => {
                    expect(res.status).to.equal(200);
                    const returnedJobArray = JSON.parse(res.text);
                    expect(returnedJobArray.length).to.equal(3);
                    // Per object, check the number of properties and the difference between createdAt and updatedAt
                    for (let i = 0; i < 3; i++) {
                        const currentJob = returnedJobArray[i];
                        const expectedJob = testData[i];
                        expect(Object.keys(currentJob).length).to.be.equal(5);
                        expect(currentJob.bookId).to.be.equal(expectedJob.bookId);
                        expect(currentJob.type).to.be.equal(expectedJob.type);
                        expect(currentJob.state).to.be.equal(expectedJob.state);

                        const datesDifferenceInMs =
                            new Date(currentJob.updatedAt).valueOf() - new Date(currentJob.createdAt).valueOf();
                        expect(datesDifferenceInMs).to.be.at.least(expectedJob.processingTimeInMs);
                        expect(datesDifferenceInMs - expectedJob.processingTimeInMs).to.be.lessThan(100);
                    }
                    done();
                });
        }, 27 * 1000);
    }).timeout(30 * 1000);
});

describe('/import', () => {
    let clock: any;
    let theApp: App;
    const expectedDate = new Date(2011, 11, 11);

    beforeEach(() => {
        theApp = new App(8000, 'static');
        clock = sinon.useFakeTimers(expectedDate.getTime());
    });

    afterEach(() => {
        if (clock) {
            clock.restore();
            clock = undefined;
        }
    });

    it('POST should return 200 if a import job with correct values is requested', done => {
        chai.request(theApp.app)
            .post('/import')
            .send({
                bookId: '1',
                type: 'pdf',
                url: 'https://reedsy.com',
            })
            .then((res: any) => {
                expect(res.status).to.equal(200);
                expect(res.text).to.equal('');
                done();
            });
    });

    it('POST should return 500 and an error message if a import job with incorrect type is requested', done => {
        chai.request(theApp.app)
            .post('/import')
            .send({
                bookId: '1',
                type: 'foo',
                url: 'https://reedsy.com',
            })
            .then((res: any) => {
                expect(res.status).to.equal(500);
                expect(res.text).to.equal(JSON.stringify({ error: 'Invalid import type: foo' }));
                done();
            });
    });

    it('POST should return 500 and an error message if a import job with missing type is requested', done => {
        chai.request(theApp.app)
            .post('/import')
            .send({
                bookId: '1',
                url: 'https://reedsy.com',
            })
            .then((res: any) => {
                expect(res.status).to.equal(500);
                expect(res.text).to.equal(JSON.stringify({ error: 'Invalid import type: undefined' }));
                done();
            });
    });

    it('POST should return 500 and an error message if a import job with a malformed url is requested', done => {
        chai.request(theApp.app)
            .post('/import')
            .send({
                bookId: '1',
                type: 'pdf',
                url: 'foo',
            })
            .then((res: any) => {
                expect(res.status).to.equal(500);
                expect(res.text).to.equal(JSON.stringify({ error: 'Invalid url: foo' }));
                done();
            });
    });

    it('POST should return 500 and an error message if a import job with a missing url is requested', done => {
        chai.request(theApp.app)
            .post('/import')
            .send({
                bookId: '1',
                type: 'pdf',
            })
            .then((res: any) => {
                expect(res.status).to.equal(500);
                expect(res.text).to.equal(JSON.stringify({ error: 'Invalid url: undefined' }));
                done();
            });
    });

    it('POST should return 500 and an error message if a export job with incorrect book id is requested', done => {
        chai.request(theApp.app)
            .post('/import')
            .send({
                bookId: 'foo',
                type: 'pdf',
                url: 'https://reedsy.com',
            })
            .then((res: any) => {
                expect(res.status).to.equal(500);
                expect(res.text).to.equal(JSON.stringify({ error: 'Invalid book id: foo' }));
                done();
            });
    });

    it('POST should return 500 and an error message if a export job with missing book id is requested', done => {
        chai.request(theApp.app)
            .post('/export')
            .send({
                type: 'pdf',
                url: 'https://reedsy.com',
            })
            .then((res: any) => {
                expect(res.status).to.equal(500);
                expect(res.text).to.equal(JSON.stringify({ error: 'Invalid book id: undefined' }));
                done();
            });
    });

    it('GET should return 200 and an empty array if no export jobs where requested yet', done => {
        chai.request(theApp.app)
            .get('/import')
            .then((res: any) => {
                expect(res.status).to.equal(200);
                expect(res.text).to.equal('[]');
                done();
            });
    });

    it('GET should return 200 and a array with all pending jobs', done => {
        let expectedJson =
            '[{\
            "bookId": "2",\
            "type": "pdf",\
            "state": "pending",\
            "createdAt": "2011-12-10T23:00:00.000Z",\
            "url": "https://reedsy.com"\
        }, {\
            "bookId": "1",\
            "type": "pdf",\
            "state": "pending",\
            "createdAt": "2011-12-10T23:00:00.000Z",\
            "url": "https://reedsy.com"\
        }, {\
            "bookId": "0",\
            "type": "pdf",\
            "state": "pending",\
            "createdAt": "2011-12-10T23:00:00.000Z",\
            "url": "https://reedsy.com"\
        }]';

        // Remove JSON spaces. Was shown expanded for readability purposes
        expectedJson = expectedJson.replace(/\s/g, '');

        for (let i = 0; i < 3; i++) {
            chai.request(theApp.app)
                .post('/import')
                .send({
                    bookId: String(i),
                    type: 'pdf',
                    url: 'https://reedsy.com',
                })
                .then((res: any) => {
                    expect(res.status).to.equal(200);
                });
        }

        chai.request(theApp.app)
            .get('/import')
            .then((res: any) => {
                expect(res.status).to.equal(200);
                expect(res.text).to.equal(expectedJson);
                done();
            });
    });

    it('GET should return 200 and a array with all finished jobs', done => {
        const sixtySecsInMs = 60 * 1000;
        clock.restore();
        const testData = [
            {
                bookId: '3',
                type: 'word',
                state: 'finished',
                url: 'https://reedsy.com',
            },
            {
                bookId: '2',
                type: 'pdf',
                state: 'finished',
                url: 'https://www.google.com',
            },
            {
                bookId: '1',
                type: 'wattpad',
                state: 'finished',
                url: 'https://www.reddit.com',
            },
            {
                bookId: '0',
                type: 'evernote',
                state: 'finished',
                url: 'http://foo.com',
            },
        ];

        for (let i = 2; i >= 0; i--) {
            chai.request(theApp.app)
                .post('/import')
                .send({
                    bookId: testData[i].bookId,
                    type: testData[i].type,
                    url: testData[i].url,
                })
                .then((res: any) => {
                    expect(res.status).to.equal(200);
                });
        }

        setTimeout(() => {
            chai.request(theApp.app)
                .get('/import')
                .then((res: any) => {
                    expect(res.status).to.equal(200);
                    const returnedJobArray = JSON.parse(res.text);
                    expect(returnedJobArray.length).to.equal(3);
                    // Per object, check the number of properties and the difference between createdAt and updatedAt
                    for (let i = 0; i < 3; i++) {
                        const currentJob = returnedJobArray[i];
                        const expectedJob = testData[i];
                        expect(Object.keys(currentJob).length).to.be.equal(6);
                        expect(currentJob.bookId).to.be.equal(expectedJob.bookId);
                        expect(currentJob.type).to.be.equal(expectedJob.type);
                        expect(currentJob.state).to.be.equal('finished');

                        const datesDifferenceInMs =
                            new Date(currentJob.updatedAt).valueOf() - new Date(currentJob.createdAt).valueOf();
                        expect(datesDifferenceInMs).to.be.at.least(sixtySecsInMs);
                        expect(datesDifferenceInMs - sixtySecsInMs).to.be.lessThan(100);
                    }
                    done();
                });
        }, 65 * 1000);
    }).timeout(70 * 1000);
});
