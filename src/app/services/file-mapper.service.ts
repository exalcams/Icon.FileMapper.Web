import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { FileMapper, PatternMatching } from 'app/models/file-mapper';

@Injectable({
  providedIn: 'root'
})
export class FileMapperService {

  baseAddress: string;
  NotificationEvent: Subject<any>;

    GetNotification(): Observable<any> {
        return this.NotificationEvent.asObservable();
    }

    TriggerNotification(eventName: string): void {
        this.NotificationEvent.next(eventName);
    }

  constructor(private _httpClient: HttpClient, private _authService: AuthService) {
    this.baseAddress = _authService.baseAddress;
    this.NotificationEvent = new Subject();
  }

  // Error Handler
  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error || error.message || 'Server Error');
  }

  // FileMappers

  CreateFileMapper(fileMapper: FileMapper): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}api/FileMapper/CreateFileMapper`,
    fileMapper,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).pipe(catchError(this.errorHandler));

  }

  GetAllFileMappers(): Observable<FileMapper[] | string> {
    return this._httpClient.get<FileMapper[]>(`${this.baseAddress}api/FileMapper/GetAllFileMappers`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllPatterns(): Observable<string[] | string> {
    return this._httpClient.get<string[]>(`${this.baseAddress}api/FileMapper/GetAllPatterns`)
      .pipe(catchError(this.errorHandler));
  }

  UpdateFileMapper(fileMapper: FileMapper): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}api/FileMapper/UpdateFileMapper`,
    fileMapper,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).pipe(catchError(this.errorHandler));

  }

  DeleteFileMapper(fileMapper: FileMapper): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}api/FileMapper/DeleteFileMapper`,
      fileMapper,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }


}
