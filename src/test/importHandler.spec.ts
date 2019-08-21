/* eslint-disable no-unused-expressions */
/* eslint-disable no-multi-str */
/* eslint-disable no-undef */
import { expect } from 'chai';
import sinon from 'sinon';

import { ImportHandler } from '../handlers/importHandler';
import { JobStorage } from '../storage/jobStorage';
import { ImportJob } from '../jobs/importJob';

describe('ImportHandler', () => {
    let storageStub: any;
    let clock: any;

    beforeEach(() => {
        storageStub = sinon.createStubInstance(JobStorage);
    });

    afterEach(() => {
        storageStub = undefined;
        if (clock) {
            clock.restore();
            clock = undefined;
        }
    });

    it('should throw an exception if an invalid type is passed', () => {
        const importer = new ImportHandler(storageStub as any);
        expect(() => importer.importFrom('bla', 'https://reedsy.com', '1234')).to.throw('Invalid import type: bla');
    });

    it('should throw an exception if an invalid url is passed', () => {
        const importer = new ImportHandler(storageStub as any);
        expect(() => importer.importFrom('word', 'blable', '1234')).to.throw('Invalid url: blable');
    });

    it('should return all export jobs in JSON format', () => {
        const expectedDate = new Date(2011, 11, 11);
        clock = sinon.useFakeTimers(expectedDate.getTime());

        const storedJobs = [
            new ImportJob('1', 'word', 'https://reedsy.com'),
            new ImportJob('2', 'word', 'https://reedsy.com'),
            new ImportJob('3', 'word', 'https://reedsy.com'),
            new ImportJob('4', 'word', 'https://reedsy.com'),
        ];

        let expectedJson =
            '[{\
            "bookId": "1",\
            "type": "word",\
            "state": "pending",\
            "createdAt": "2011-12-10T23:00:00.000Z",\
            "url": "https://reedsy.com"\
        }, {\
            "bookId": "2",\
            "type": "word",\
            "state": "finished",\
            "createdAt": "2011-12-10T23:00:00.000Z",\
            "updatedAt": "2011-12-10T23:00:00.000Z",\
            "url": "https://reedsy.com"\
        }, {\
            "bookId": "3",\
            "type": "word",\
            "state": "finished",\
            "createdAt": "2011-12-10T23:00:00.000Z",\
            "updatedAt": "2011-12-10T23:00:00.000Z",\
            "url": "https://reedsy.com"\
        }, {\
            "bookId": "4",\
            "type": "word",\
            "state": "pending",\
            "createdAt": "2011-12-10T23:00:00.000Z",\
            "url": "https://reedsy.com"\
        }]';

        // Remove JSON spaces. Was shown expanded for readability purposes
        expectedJson = expectedJson.replace(/\s/g, '');

        storedJobs[1].finished();
        storedJobs[2].finished();

        storageStub.getImportJobs.returns(storedJobs);
        const handler = new ImportHandler(storageStub as any);

        const jsonJobsList = handler.getAllJobsAsJSON();
        expect(jsonJobsList).to.equal(expectedJson);
    });

    it('import request should be set to finished after 60 secs', done => {
        const sixtySecsInMs = 60 * 1000;
        const importer = new ImportHandler(storageStub as any);
        importer.importFrom('word', 'https://reedsy.com', '1234');

        expect(storageStub.add.calledOnce).to.be.true;
        const importJob = storageStub.add.getCall(0).args[0];
        expect(importJob.isFinished()).to.be.false;

        setTimeout(() => {
            expect(importJob.isFinished()).to.be.true;

            const datesDifferenceInMs = importJob.updatedAt.valueOf() - importJob.createdAt.valueOf();
            expect(datesDifferenceInMs).to.be.at.least(sixtySecsInMs);
            expect(datesDifferenceInMs - sixtySecsInMs).to.be.lessThan(80);

            done();
        }, sixtySecsInMs);
    }).timeout(60100);
});
