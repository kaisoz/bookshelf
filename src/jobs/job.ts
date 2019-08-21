export enum JobType {
    import = 'import',
    export = 'export',
}

export enum JobState {
    pending = 'pending',
    finished = 'finished',
}

export class Job {
    public readonly bookId: string;

    public readonly type: string;

    public readonly createdAt: Date;

    protected _updatedAt: Date;

    protected jobType: JobType;

    protected state: JobState;

    protected processingTimeInSecs: number;

    public constructor(bookId: string, type: string) {
        if (!this.isValidBookId(bookId)) {
            throw new Error(`Invalid book id: ${bookId}`);
        }

        this.bookId = bookId;
        this.type = type;
        this.state = JobState.pending;
        this.createdAt = new Date();
    }

    // eslint-disable-next-line class-methods-use-this
    private isValidBookId(bookId: string) {
        return Number.isInteger(Number(bookId));
    }

    public async execute() {
        setTimeout(() => {
            this.finished();
        }, this.processingTimeInSecs * 1000);
    }

    public finished(): void {
        this.state = JobState.finished;
        // eslint-disable-next-line no-underscore-dangle
        this._updatedAt = new Date();
    }

    public isFinished() {
        return this.state === JobState.finished;
    }

    public getJobType() {
        return this.jobType;
    }

    public get updatedAt(): Date {
        // eslint-disable-next-line no-underscore-dangle
        return this._updatedAt;
    }

    public toJSON() {
        return {
            bookId: this.bookId,
            type: this.type,
            state: this.state,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
