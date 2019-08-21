/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import { expect } from 'chai';
import sinon from 'sinon';

import { ExportHandler } from '../handlers/exportHandler';
import { JobStorage } from '../storage/jobStorage';
import { ExportEpubJob } from '../jobs/exportJob';

describe('ExportHandler', () => {
    let storageStub: any;
    // eslint-disable-next-line no-undef-init
    let clock: any = undefined;

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

    it('should throw an exception if an invalid type is passed when exporting a book', () => {
        const exporter = new ExportHandler(storageStub as any);
        expect(() => exporter.exportAs('bla', '1234')).to.throw('Invalid export type: bla');
    });

    it('should return all export jobs in JSON format', () => {
        const expectedDate = new Date(2011, 11, 11);
        clock = sinon.useFakeTimers(expectedDate.getTime());

        const storedJobs = [
            new ExportEpubJob('1'),
            new ExportEpubJob('2'),
            new ExportEpubJob('3'),
            new ExportEpubJob('4'),
        ];

        let expectedJson =
            // eslint-disable-next-line no-multi-str
            '[{\
            "bookId": "1",\
            "type": "epub",\
            "state": "pending",\
            "createdAt": "2011-12-10T23:00:00.000Z"\
        }, {\
            "bookId": "2",\
            "type": "epub",\
            "state": "finished",\
            "createdAt": "2011-12-10T23:00:00.000Z",\
            "updatedAt": "2011-12-10T23:00:00.000Z"\
        }, {\
            "bookId": "3",\
            "type": "epub",\
            "state": "finished",\
            "createdAt": "2011-12-10T23:00:00.000Z",\
            "updatedAt": "2011-12-10T23:00:00.000Z"\
        }, {\
            "bookId": "4",\
            "type": "epub",\
            "state": "pending",\
            "createdAt": "2011-12-10T23:00:00.000Z"\
        }]';

        // Remove JSON spaces. Was shown expanded for readability purposes
        expectedJson = expectedJson.replace(/\s/g, '');

        storedJobs[1].finished();
        storedJobs[2].finished();

        storageStub.getExportJobs.returns(storedJobs);
        const handler = new ExportHandler(storageStub as any);

        const jsonJobsList = handler.getAllJobsAsJSON();
        expect(jsonJobsList).to.equal(expectedJson);
    });

    it('should set a pdf export job to finished after 25 secs', done => {
        const exporter = new ExportHandler(storageStub as any);
        const twentyFiveSecsInMs = 25 * 1000;

        exporter.exportAs('pdf', '1234');

        expect(storageStub.add.calledOnce).to.be.true;
        const exportJob = storageStub.add.getCall(0).args[0];
        expect(exportJob.isFinished()).to.be.false;

        setTimeout(() => {
            expect(exportJob.isFinished()).to.be.true;

            const datesDifferenceInMs = exportJob.updatedAt.valueOf() - exportJob.createdAt.valueOf();
            expect(datesDifferenceInMs).to.be.at.least(twentyFiveSecsInMs);
            expect(datesDifferenceInMs - twentyFiveSecsInMs).to.be.lessThan(50);

            done();
        }, twentyFiveSecsInMs);
    }).timeout(26000);

    it('should set a epub export job to finished after 10 secs', done => {
        const exporter = new ExportHandler(storageStub as any);
        const tenSecsInMs = 10 * 1000;

        exporter.exportAs('epub', '1234');

        expect(storageStub.add.calledOnce).to.be.true;
        const exportJob = storageStub.add.getCall(0).args[0];
        expect(exportJob.isFinished()).to.be.false;

        setTimeout(() => {
            expect(exportJob.isFinished()).to.be.true;

            const datesDifferenceInMs = exportJob.updatedAt.valueOf() - exportJob.createdAt.valueOf();
            expect(datesDifferenceInMs).to.be.at.least(tenSecsInMs);
            expect(datesDifferenceInMs - tenSecsInMs).to.be.lessThan(50);

            done();
        }, tenSecsInMs);
    }).timeout(11000);
});
