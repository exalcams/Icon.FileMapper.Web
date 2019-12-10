import { Guid } from 'guid-typescript';

export class FileMapper {

    MapperID: Guid;
    Mode: string;
    Address: string;
    MailBox: string;
    ConnectionServer: string;
    Subject: string;
    FromMail: string;
    AttachmentType: string;
    TrainingContext: string;
    IntervalCheck: string;
    Host: string;
    Port: number;
    Email: string;
    Password: string;
    Status: string;
    PatternID: string;
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
}
export class PatternMatching {
    Coordinates: string;
    GSTNText: string;
    Type: string;
    Pattern: string;
    Length: string;
    PatternCoordinates: string;
    Field: string;
    IsActive: boolean;
}
export class BotScheduler {
    SchedulerID: number;
    MapperID: Guid;
    PostCheckType: string;
    DateCheck: Date;
    DayCheck: string;
    TimeCheck: string;
    Interval: number;
    IsActive: string;
    ModifiedBy: string;
    CreatedBy: string;
}
export class FileMaperWithSchedule {
    fileMappers: FileMapper[];
    botSchedulers: BotScheduler[];
}