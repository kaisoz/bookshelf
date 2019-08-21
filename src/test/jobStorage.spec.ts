/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import { expect } from 'chai';
import { JobStorage } from '../storage/jobStorage';

import { ImportJob } from '../jobs/importJob';
import { ExportJob } from '../jobs/exportJob';

describe('JobStorage', () => {
    it('should retrieve the import requests grouped by state', () => {
        const storage = new JobStorage();

        const pendingImportRequestOne = new ImportJob('1', 'word', 'https://reedsy.com');
        const pendingImportRequestTwo = new ImportJob('2', 'word', 'https://reedsy.com');
        const finishedImportRequestOne = new ImportJob('3', 'word', 'https://reedsy.com');
        const finishedImportRequestTwo = new ImportJob('4', 'word', 'https://reedsy.com');

        storage.add(pendingImportRequestOne);
        storage.add(finishedImportRequestOne);

        storage.add(pendingImportRequestTwo);
        storage.add(finishedImportRequestTwo);

        finishedImportRequestOne.finished();
        storage.update(finishedImportRequestOne);

        finishedImportRequestTwo.finished();
        storage.update(finishedImportRequestTwo);

        const importJobs = storage.getImportJobs();
        expect(importJobs[0].isFinished()).to.be.true;
        expect(importJobs[0].bookId).to.equal(finishedImportRequestTwo.bookId);

        expect(importJobs[1].isFinished()).to.be.true;
        expect(importJobs[1].bookId).to.equal(finishedImportRequestOne.bookId);

        expect(importJobs[2].isFinished()).to.be.false;
        expect(importJobs[2].bookId).to.equal(pendingImportRequestOne.bookId);

        expect(importJobs[3].isFinished()).to.be.false;
        expect(importJobs[3].bookId).to.equal(pendingImportRequestTwo.bookId);
    });

    it('should retrieve the export requests grouped by state', () => {
        const storage = new JobStorage();

        const pendingExportRequestOne = new ExportJob('1', 'epub');
        const pendingExportRequestTwo = new ExportJob('2', 'epub');
        const finishedExportRequestOne = new ExportJob('3', 'epub');
        const finishedExportRequestTwo = new ExportJob('4', 'epub');

        storage.add(pendingExportRequestOne);
        storage.add(finishedExportRequestOne);

        storage.add(pendingExportRequestTwo);
        storage.add(finishedExportRequestTwo);

        finishedExportRequestOne.finished();
        storage.update(finishedExportRequestOne);

        finishedExportRequestTwo.finished();
        storage.update(finishedExportRequestTwo);

        const exportJobs = storage.getExportJobs();
        expect(exportJobs[0].isFinished()).to.be.true;
        expect(exportJobs[0].bookId).to.equal(finishedExportRequestTwo.bookId);

        expect(exportJobs[1].isFinished()).to.be.true;
        expect(exportJobs[1].bookId).to.equal(finishedExportRequestOne.bookId);

        expect(exportJobs[2].isFinished()).to.be.false;
        expect(exportJobs[2].bookId).to.equal(pendingExportRequestOne.bookId);

        expect(exportJobs[3].isFinished()).to.be.false;
        expect(exportJobs[3].bookId).to.equal(pendingExportRequestTwo.bookId);
    });
});
