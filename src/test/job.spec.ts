/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import { expect } from 'chai';
import sinon from 'sinon';
import { Job } from '../jobs/job';

describe('Job', () => {
    let clock: any;

    afterEach(() => {
        if (clock) {
            clock.restore();
        }
    });

    it('should throw an exception if an invalid bookId is passed', () => {
        expect(() => new Job('ab', 'pdf')).to.throw('Invalid book id: ab');
        expect(() => new Job('a1', 'pdf')).to.throw('Invalid book id: a1');
    });

    it('should set the current time when constructed', () => {
        const expectedDate = new Date(2011, 11, 11);
        clock = sinon.useFakeTimers(expectedDate.getTime());

        const job = new Job('12345', 'pdf');
        expect(job.createdAt).to.eql(expectedDate);
    });

    it('should set the finished state when requested', () => {
        const job = new Job('12345', 'pdf');
        job.finished();
        expect(job.isFinished()).to.be.true;
    });

    it('should set the update time when a request is finished', () => {
        const expectedDate = new Date(2012, 11, 11);
        clock = sinon.useFakeTimers(expectedDate.getTime());
        const job = new Job('12345', 'pdf');

        job.finished();

        expect(job.isFinished()).to.be.true;
        expect(job.updatedAt).to.eql(expectedDate);
    });
});
