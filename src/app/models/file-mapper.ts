import { Guid } from 'guid-typescript';

export class FileMapper {

    FileMapperID:Guid;
    Mode: string;
    MailBox: string;
    Connectivity: string;
    Subject: string;
    From: string;
    AttachmentType: string;
    TrainingContext: string;
    IntervalCheck: string;
    Host: string;
    Port: string;
    Email: string;
    Password: string;
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    ModifiedOn?: Date;
    ModifiedBy: string;
    
}