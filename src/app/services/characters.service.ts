import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CharactersService {
  private baseUrl = 'https://rickandmortyapi.com/api/character';
  constructor(private http: HttpClient) {}

  getAllCharacters(): Observable<any[]> {
    return this.http.get<any>(this.baseUrl).pipe(
      map((response) => response.results) // solo nos interesan los personajes
    );
  }
}
